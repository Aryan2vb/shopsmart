variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
}

variable "project_name" {
  description = "Short project name used in resource names."
  type        = string
  default     = "shopsmart"
}

variable "container_image" {
  description = "Container image to run in ECS. The workflow updates this after pushing to ECR."
  type        = string
  default     = "public.ecr.aws/docker/library/nginx:stable-alpine"
}

variable "container_port" {
  description = "Port exposed by the application container."
  type        = number
  default     = 3000
}

variable "desired_count" {
  description = "Number of ECS tasks to run."
  type        = number
  default     = 0
}
