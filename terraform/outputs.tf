output "artifact_bucket_name" {
  value       = aws_s3_bucket.artifacts.bucket
  description = "Versioned, encrypted S3 bucket with public access blocked."
}

output "ecr_repository_url" {
  value       = aws_ecr_repository.app.repository_url
  description = "ECR repository URL for the server image."
}

output "ecs_cluster_name" {
  value       = aws_ecs_cluster.main.name
  description = "ECS cluster name."
}

output "ecs_service_name" {
  value       = aws_ecs_service.app.name
  description = "ECS service name."
}

output "alb_dns_name" {
  value       = aws_lb.app.dns_name
  description = "Public application load balancer DNS name."
}
