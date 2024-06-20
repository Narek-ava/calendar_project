data "digitalocean_vpc" "common-vpc" {
  name = "common-vpc"
}

resource "digitalocean_database_cluster" "common-postgres-cluster" {
  name       = "common-postgres-cluster"
  engine     = "pg"
  version    = "14"
  size       = "db-s-2vcpu-4gb"
  region     = "nyc3"
  node_count = 1
  private_network_uuid = data.digitalocean_vpc.common-vpc.id
}

resource "digitalocean_database_cluster" "common-redis-cluster" {
  name       = "common-redis-cluster"
  engine     = "redis"
  version    = "6"
  size       = "db-s-1vcpu-1gb"
  region     = "nyc3"
  node_count = 1
  private_network_uuid = data.digitalocean_vpc.common-vpc.id
}
