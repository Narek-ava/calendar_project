data "digitalocean_database_cluster" "common-postgres-cluster" {
  name = "common-postgres-cluster"
}

resource "digitalocean_database_db" "production-freescout-db" {
  cluster_id = data.digitalocean_database_cluster.common-postgres-cluster.id
  name       = "production-freescout"
}

resource "digitalocean_database_db" "production-db" {
  cluster_id = data.digitalocean_database_cluster.common-postgres-cluster.id
  name       = "production"
}

resource "digitalocean_database_user" "production-db-user" {
  cluster_id = data.digitalocean_database_cluster.common-postgres-cluster.id
  name       = "production"
}
