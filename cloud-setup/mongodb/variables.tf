variable "mongodb_atlas_public_key" {
  description = "Public key for MongoDB Atlas"
  type        = string
}

variable "mongodb_atlas_private_key" {
  description = "Private key for MongoDB Atlas"
  type        = string
}

variable "org_id" {
  description = "Organization ID for Garde"
  type        = string
}

variable "db_user_name" {
  description = "Database Username"
  default     = "garde_user"
}

variable "db_user_password" {
  description = "Database User Password"
  type        = string
}

variable "db_user_roles" {
  description = "Database User Roles"
  default     = ["readWrite"]
}

variable "db_name" {
  description = "Database Name"
  default     = "Garde"
}