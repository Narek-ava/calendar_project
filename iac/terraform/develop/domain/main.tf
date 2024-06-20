data "digitalocean_droplet" "develop-manager" {
  name = "develop-manager"
}

resource "digitalocean_domain" "develop-frontend-domain" {
  name = "develop.chilledbutter.com"
  ip_address = data.digitalocean_droplet.develop-manager.ipv4_address
}

resource "digitalocean_domain" "develop-api-domain" {
  name = "api.develop.chilledbutter.com"
  ip_address = data.digitalocean_droplet.develop-manager.ipv4_address
}

resource "digitalocean_domain" "develop-ws-domain" {
  name = "ws.develop.chilledbutter.com"
  ip_address = data.digitalocean_droplet.develop-manager.ipv4_address
}

