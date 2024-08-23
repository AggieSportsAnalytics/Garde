terraform {
  required_providers {
    mongodbatlas = {
      source  = "mongodb/mongodbatlas"
      version = "~> 1.18.0"
    }
  }

  required_version = ">= 1.5.0, < 2.0.0"

  backend "local" {
    path = "./state/terraform.tfstate"
  }
}

provider "mongodbatlas" {
  public_key  = var.mongodb_atlas_public_key
  private_key = var.mongodb_atlas_private_key
}