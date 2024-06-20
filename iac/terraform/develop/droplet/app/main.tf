data "digitalocean_ssh_key" "beetsoft" {
  name = "beetsoft"
}

data "digitalocean_ssh_key" "deploy" {
  name = "deploy"
}

data "digitalocean_vpc" "common-vpc" {
  name = "common-vpc"
}

resource "digitalocean_droplet" "develop-manager" {
  image      = "ubuntu-20-04-x64"
  name       = "develop-manager"
  region     = "nyc3"
  size       = "s-2vcpu-4gb"
  vpc_uuid   = data.digitalocean_vpc.common-vpc.id
  monitoring = true
  ssh_keys   = [
    data.digitalocean_ssh_key.beetsoft.id,
    data.digitalocean_ssh_key.deploy.id
  ]

  provisioner "remote-exec" {
    inline = ["sudo apt update", "sudo apt install python3 -y", "echo Done!"]

    connection {
      host        = self.ipv4_address
      type        = "ssh"
      user        = "root"
      private_key = file(var.pvt_key)
    }
  }

  provisioner "local-exec" {
    command = "ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -u root -i '${self.ipv4_address},' --private-key ${var.pvt_key} -e 'pub_key=${var.pub_key}' droplet.yml"
  }
}
