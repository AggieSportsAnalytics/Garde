terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.64.0"
    }
  }

  required_version = ">= 1.5.0, < 2.0.0"

  backend "local" {
    path = "./state/terraform.tfstate"
  }
}

provider "aws" {
  region = var.region
}