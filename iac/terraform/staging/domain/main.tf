data "digitalocean_droplet" "staging-manager" {
  name = "staging-manager"
}

resource "digitalocean_domain" "staging-frontend-domain" {
  name = "staging.chilledbutter.com"
  ip_address = data.digitalocean_droplet.staging-manager.ipv4_address
}

resource "digitalocean_domain" "staging-api-domain" {
  name = "api.staging.chilledbutter.com"
  ip_address = data.digitalocean_droplet.staging-manager.ipv4_address
}

resource "digitalocean_domain" "staging-ws-domain" {
  name = "ws.staging.chilledbutter.com"
  ip_address = data.digitalocean_droplet.staging-manager.ipv4_address
}

