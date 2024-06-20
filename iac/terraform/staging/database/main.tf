data "digitalocean_database_cluster" "common-postgres-cluster" {
  name = "common-postgres-cluster"
}

resource "digitalocean_database_db" "staging-freescout-db" {
  cluster_id = data.digitalocean_database_cluster.common-postgres-cluster.id
  name       = "staging-freescout"
}

resource "digitalocean_database_db" "staging-db" {
  cluster_id = data.digitalocean_database_cluster.common-postgres-cluster.id
  name       = "staging"
}

resource "digitalocean_database_user" "staging-db-user" {
  cluster_id = data.digitalocean_database_cluster.common-postgres-cluster.id
  name       = "staging"
}
