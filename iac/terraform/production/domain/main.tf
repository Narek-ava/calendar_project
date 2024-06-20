data "digitalocean_droplet" "production-manager" {
  name = "production-manager"
}

resource "digitalocean_domain" "production-app-domain" {
  name = "app.chilledbutter.com"
  ip_address = data.digitalocean_droplet.production-manager.ipv4_address
}

resource "digitalocean_domain" "production-frontend-domain" {
  name = "chilledbutter.com"
  ip_address = data.digitalocean_droplet.production-manager.ipv4_address
}

resource "digitalocean_domain" "production-api-domain" {
  name = "api.chilledbutter.com"
  ip_address = data.digitalocean_droplet.production-manager.ipv4_address
}

resource "digitalocean_domain" "production-ws-domain" {
  name = "ws.chilledbutter.com"
  ip_address = data.digitalocean_droplet.production-manager.ipv4_address
}

