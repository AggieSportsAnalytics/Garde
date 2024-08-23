# Define a MongoDB cluster
resource "mongodbatlas_cluster" "garde_cluster" {
  project_id                  = var.mongodb_atlas_project_id
  name                        = "GardeCluster"
  provider_region_name        = "US_EAST_1"
  provider_name               = "AWS"
  provider_instance_size_name = "M10"

  # Additional cluster settings
  replication_specs {
    num_shards = 1
    regions_config {
      region_name     = "US_EAST_1"
      electable_nodes = 3
      priority        = 7
    }
  }

  mongo_db_major_version = "6.0"
}


# Define the Garde database
resource "mongodbatlas_database" "garde_db" {
  project_id   = var.mongodb_atlas_project_id
  cluster_name = mongodbatlas_cluster.garde_cluster.name
  name         = "Garde"
}

# Define multiple collections within the Garde database
resource "mongodbatlas_collection" "garde_user_angles" {
  project_id   = var.mongodb_atlas_project_id
  cluster_name = mongodbatlas_cluster.garde_cluster.name
  database     = mongodbatlas_database.garde_db.name
  name         = "garde_user_angles"
}

resource "mongodbatlas_collection" "coach" {
  project_id   = var.mongodb_atlas_project_id
  cluster_name = mongodbatlas_cluster.garde_cluster.name
  database     = mongodbatlas_database.garde_db.name
  name         = "coach"
}

resource "mongodbatlas_collection" "fencer" {
  project_id   = var.mongodb_atlas_project_id
  cluster_name = mongodbatlas_cluster.garde_cluster.name
  database     = mongodbatlas_database.garde_db.name
  name         = "fencer"
}

resource "mongodbatlas_collection" "fencer_instructions" {
  project_id   = var.mongodb_atlas_project_id
  cluster_name = mongodbatlas_cluster.garde_cluster.name
  database     = mongodbatlas_database.garde_db.name
  name         = "fencer_instructions"
}

resource "mongodbatlas_collection" "garde_ideal_angles" {
  project_id   = var.mongodb_atlas_project_id
  cluster_name = mongodbatlas_cluster.garde_cluster.name
  database     = mongodbatlas_database.garde_db.name
  name         = "garde_ideal_angles"
}

resource "mongodbatlas_collection" "videos" {
  project_id   = var.mongodb_atlas_project_id
  cluster_name = mongodbatlas_cluster.garde_cluster.name
  database     = mongodbatlas_database.garde_db.name
  name         = "videos"
}
