#!/usr/bin/env bash

set -euo pipefail

PROJECT_NAME="shopsmart"
RESOURCE_NAME=""
REGION="${AWS_REGION:-${AWS_DEFAULT_REGION:-}}"
YES="false"

usage() {
  cat <<USAGE
Usage: scripts/cleanup-aws.sh --region REGION [--name RESOURCE_NAME] --yes

Deletes ShopSmart AWS resources created by the Terraform ECS pipeline.

Options:
  --region REGION       AWS region that contains the resources.
  --name RESOURCE_NAME  Deterministic Terraform name, for example shopsmart-85c63698.
  --project NAME        Project name used by Terraform. Default: shopsmart.
  --yes                 Confirm deletion.
USAGE
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --region)
      REGION="${2:-}"
      shift 2
      ;;
    --name)
      RESOURCE_NAME="${2:-}"
      shift 2
      ;;
    --project)
      PROJECT_NAME="${2:-}"
      shift 2
      ;;
    --yes)
      YES="true"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [ -z "$REGION" ]; then
  echo "Missing AWS region. Pass --region or set AWS_REGION." >&2
  exit 1
fi

if [ "$YES" != "true" ]; then
  echo "Refusing to delete AWS resources without --yes." >&2
  usage
  exit 1
fi

aws_region() {
  aws --region "$REGION" "$@"
}

hash_suffix() {
  local value="$1"

  if command -v md5sum >/dev/null 2>&1; then
    printf "%s" "$value" | md5sum | awk '{print substr($1, 1, 8)}'
  elif command -v md5 >/dev/null 2>&1; then
    printf "%s" "$value" | md5 | awk '{print substr($NF, 1, 8)}'
  else
    printf "%s" "$value" | openssl dgst -md5 | awk '{print substr($NF, 1, 8)}'
  fi
}

if [ -z "$RESOURCE_NAME" ]; then
  ACCOUNT_ID=$(aws_region sts get-caller-identity --query Account --output text)
  RESOURCE_NAME="${PROJECT_NAME}-$(hash_suffix "${ACCOUNT_ID}-${REGION}-${PROJECT_NAME}")"
fi

BUCKET_NAME="${RESOURCE_NAME}-artifacts"
ECR_REPO_NAME="${PROJECT_NAME}-server"
ALB_NAME="${RESOURCE_NAME}-alb"
TG_NAME="${RESOURCE_NAME}-tg"
LOG_GROUP_NAME="/ecs/${RESOURCE_NAME}"
CLUSTER_NAME="${RESOURCE_NAME}-cluster"
SERVICE_NAME="${RESOURCE_NAME}-service"
TASK_FAMILY="${RESOURCE_NAME}-task"

echo "Deleting ShopSmart AWS resources in $REGION:"
echo "  Resource name: $RESOURCE_NAME"
echo "  ECR repo:      $ECR_REPO_NAME"
echo "  S3 bucket:     $BUCKET_NAME"

wait_for_lb_deleted() {
  local alb_arn="$1"
  aws_region elbv2 wait load-balancers-deleted --load-balancer-arns "$alb_arn" || true
}

SERVICE_ARN=$(aws_region ecs describe-services \
  --cluster "$CLUSTER_NAME" \
  --services "$SERVICE_NAME" \
  --query 'services[?status!=`INACTIVE`].serviceArn | [0]' \
  --output text 2>/dev/null || true)

if [ -n "$SERVICE_ARN" ] && [ "$SERVICE_ARN" != "None" ]; then
  echo "Deleting ECS service $SERVICE_NAME..."
  aws_region ecs update-service --cluster "$CLUSTER_NAME" --service "$SERVICE_NAME" --desired-count 0 >/dev/null || true
  aws_region ecs wait services-stable --cluster "$CLUSTER_NAME" --services "$SERVICE_NAME" || true
  aws_region ecs delete-service --cluster "$CLUSTER_NAME" --service "$SERVICE_NAME" --force >/dev/null || true
  aws_region ecs wait services-inactive --cluster "$CLUSTER_NAME" --services "$SERVICE_NAME" || true
fi

ALB_ARN=$(aws_region elbv2 describe-load-balancers \
  --names "$ALB_NAME" \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text 2>/dev/null || true)

if [ -n "$ALB_ARN" ] && [ "$ALB_ARN" != "None" ]; then
  echo "Deleting ALB listeners for $ALB_NAME..."
  LISTENER_ARNS=$(aws_region elbv2 describe-listeners \
    --load-balancer-arn "$ALB_ARN" \
    --query 'Listeners[].ListenerArn' \
    --output text 2>/dev/null || true)
  for listener_arn in $LISTENER_ARNS; do
    aws_region elbv2 delete-listener --listener-arn "$listener_arn" >/dev/null || true
  done

  echo "Deleting ALB $ALB_NAME..."
  aws_region elbv2 delete-load-balancer --load-balancer-arn "$ALB_ARN" >/dev/null || true
  wait_for_lb_deleted "$ALB_ARN"
fi

TG_ARN=$(aws_region elbv2 describe-target-groups \
  --names "$TG_NAME" \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text 2>/dev/null || true)

if [ -n "$TG_ARN" ] && [ "$TG_ARN" != "None" ]; then
  echo "Deleting target group $TG_NAME..."
  aws_region elbv2 delete-target-group --target-group-arn "$TG_ARN" >/dev/null || true
fi

CLUSTER_ARN=$(aws_region ecs describe-clusters \
  --clusters "$CLUSTER_NAME" \
  --query 'clusters[?status==`ACTIVE`].clusterArn | [0]' \
  --output text 2>/dev/null || true)

if [ -n "$CLUSTER_ARN" ] && [ "$CLUSTER_ARN" != "None" ]; then
  echo "Deleting ECS cluster $CLUSTER_NAME..."
  aws_region ecs delete-cluster --cluster "$CLUSTER_NAME" >/dev/null || true
fi

TASK_DEFINITION_ARNS=$(aws_region ecs list-task-definitions \
  --family-prefix "$TASK_FAMILY" \
  --status ACTIVE \
  --query 'taskDefinitionArns[]' \
  --output text 2>/dev/null || true)

for task_definition_arn in $TASK_DEFINITION_ARNS; do
  echo "Deregistering ECS task definition $task_definition_arn..."
  aws_region ecs deregister-task-definition --task-definition "$task_definition_arn" >/dev/null || true
done

if aws_region logs describe-log-groups \
  --log-group-name-prefix "$LOG_GROUP_NAME" \
  --query "logGroups[?logGroupName=='${LOG_GROUP_NAME}'].logGroupName | [0]" \
  --output text 2>/dev/null | grep -qx "$LOG_GROUP_NAME"; then
  echo "Deleting CloudWatch log group $LOG_GROUP_NAME..."
  aws_region logs delete-log-group --log-group-name "$LOG_GROUP_NAME" >/dev/null || true
fi

if aws_region ecr describe-repositories --repository-names "$ECR_REPO_NAME" >/dev/null 2>&1; then
  echo "Deleting ECR repository $ECR_REPO_NAME..."
  aws_region ecr delete-repository --repository-name "$ECR_REPO_NAME" --force >/dev/null || true
fi

if aws_region s3api head-bucket --bucket "$BUCKET_NAME" >/dev/null 2>&1; then
  echo "Emptying and deleting S3 bucket $BUCKET_NAME..."
  aws s3 rm "s3://${BUCKET_NAME}" --recursive --region "$REGION" >/dev/null || true
  aws_region s3api delete-bucket --bucket "$BUCKET_NAME" >/dev/null || true
fi

VPC_ID=$(aws_region ec2 describe-vpcs \
  --filters "Name=tag:Name,Values=${RESOURCE_NAME}-vpc" \
  --query 'Vpcs[0].VpcId' \
  --output text 2>/dev/null || true)

if [ -n "$VPC_ID" ] && [ "$VPC_ID" != "None" ]; then
  echo "Deleting VPC dependencies for $VPC_ID..."

  ECS_SG_ID=$(aws_region ec2 describe-security-groups \
    --filters "Name=vpc-id,Values=${VPC_ID}" "Name=group-name,Values=${RESOURCE_NAME}-ecs" \
    --query 'SecurityGroups[0].GroupId' \
    --output text 2>/dev/null || true)
  ALB_SG_ID=$(aws_region ec2 describe-security-groups \
    --filters "Name=vpc-id,Values=${VPC_ID}" "Name=group-name,Values=${RESOURCE_NAME}-alb" \
    --query 'SecurityGroups[0].GroupId' \
    --output text 2>/dev/null || true)

  RTB_IDS=$(aws_region ec2 describe-route-tables \
    --filters "Name=vpc-id,Values=${VPC_ID}" "Name=tag:Name,Values=${RESOURCE_NAME}-public-rt" \
    --query 'RouteTables[].RouteTableId' \
    --output text 2>/dev/null || true)
  for rtb_id in $RTB_IDS; do
    ASSOC_IDS=$(aws_region ec2 describe-route-tables \
      --route-table-ids "$rtb_id" \
      --query 'RouteTables[].Associations[?Main==`false`].RouteTableAssociationId' \
      --output text 2>/dev/null || true)
    for assoc_id in $ASSOC_IDS; do
      aws_region ec2 disassociate-route-table --association-id "$assoc_id" >/dev/null || true
    done
    aws_region ec2 delete-route-table --route-table-id "$rtb_id" >/dev/null || true
  done

  IGW_IDS=$(aws_region ec2 describe-internet-gateways \
    --filters "Name=attachment.vpc-id,Values=${VPC_ID}" \
    --query 'InternetGateways[].InternetGatewayId' \
    --output text 2>/dev/null || true)
  for igw_id in $IGW_IDS; do
    aws_region ec2 detach-internet-gateway --internet-gateway-id "$igw_id" --vpc-id "$VPC_ID" >/dev/null || true
    aws_region ec2 delete-internet-gateway --internet-gateway-id "$igw_id" >/dev/null || true
  done

  if [ -n "$ECS_SG_ID" ] && [ "$ECS_SG_ID" != "None" ]; then
    aws_region ec2 delete-security-group --group-id "$ECS_SG_ID" >/dev/null || true
  fi
  if [ -n "$ALB_SG_ID" ] && [ "$ALB_SG_ID" != "None" ]; then
    aws_region ec2 delete-security-group --group-id "$ALB_SG_ID" >/dev/null || true
  fi

  SUBNET_IDS=$(aws_region ec2 describe-subnets \
    --filters "Name=vpc-id,Values=${VPC_ID}" \
    --query 'Subnets[].SubnetId' \
    --output text 2>/dev/null || true)
  for subnet_id in $SUBNET_IDS; do
    aws_region ec2 delete-subnet --subnet-id "$subnet_id" >/dev/null || true
  done

  echo "Deleting VPC $VPC_ID..."
  aws_region ec2 delete-vpc --vpc-id "$VPC_ID" >/dev/null || true
fi

echo "Cleanup finished."
