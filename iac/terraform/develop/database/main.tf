data "digitalocean_database_cluster" "common-postgres-cluster" {
  name = "common-postgres-cluster"
}

resource "digitalocean_database_db" "develop-freescout-db" {
  cluster_id = data.digitalocean_database_cluster.common-postgres-cluster.id
  name       = "develop-freescout"
}

resource "digitalocean_database_db" "develop-db" {
  cluster_id = data.digitalocean_database_cluster.common-postgres-cluster.id
  name       = "develop"
}

resource "digitalocean_database_user" "develop-db-user" {
  cluster_id = data.digitalocean_database_cluster.common-postgres-cluster.id
  name       = "develop"
}
