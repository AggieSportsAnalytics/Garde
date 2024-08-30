resource "mongodbatlas_project" "garde_project" {
  name   = "Garde Project"
  org_id = var.org_id
}

# Uncomment in prod, setup free manually for now
# resource "mongodbatlas_cluster" "garde_cluster" {
#   project_id   = mongodbatlas_project.garde_project.id
#   name         = "Garde-Cluster"
#   provider_name = "AWS"
#   provider_region_name = "US_EAST_2"
#   provider_instance_size_name = "M10"
# }

# Have to comment out code below then apply, then uncomment, init, then apply again, then manually setup the cluster
resource "mongodbatlas_database_user" "garde_user" {
  project_id         = mongodbatlas_project.garde_project.id
  username           = var.db_user_name
  password           = var.db_user_password
  auth_database_name = "admin" # This is the database used for authentication
  roles {
    role_name     = var.db_user_roles[0]
    database_name = var.db_name
  }
}
resource "null_resource" "setup_mongodb_db_collections" {
  provisioner "local-exec" {
    command = "python3 scripts/mongodb.py"
    environment = {
      USERNAME   = "${var.db_user_name}"
      PASSWORD   = "${var.db_user_password}"
      CLUSTER    = "Garde-Cluster" # replace with ${mongodbatlas_cluster.garde_cluster.name} in prod
      PROJECT    = "${mongodbatlas_project.garde_project.name}"
      ORG_ID     = "${var.org_id}"
      PROJECT_ID = "${mongodbatlas_project.garde_project.id}"
      NAME       = "${var.db_name}"
    }
  }
  # depends_on = [mongodbatlas_cluster.garde_cluster]
}