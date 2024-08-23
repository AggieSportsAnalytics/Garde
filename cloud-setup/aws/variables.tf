variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "product_abbreviation" {
  description = "Product abbreviation for naming"
  type        = string
  default     = "gar"
}

variable "feature" {
  description = "Feature which is being built"
  type        = string
  default     = "fencing-videos"
}

variable "environment" {
  description = "Development environment"
  type        = string
  default     = "dev"
  #   default = "test"
  #   default = "stag"
  #   default = "prod"
}

variable "common_tags" {
  description = "Common tags for resources"
  type        = map(string)
  default = {
    "Organization" = "Garde"
    "Product"      = "Garde"
    "Feature"      = "FencingVideos"
    "Environment"  = "dev"
    "Terraform"    = "yes"
  }
}
