resource "digitalocean_vpc" "common-vpc" {
  name     = "common-vpc"
  region   = "nyc3"
  ip_range = "10.10.10.0/24"
}
