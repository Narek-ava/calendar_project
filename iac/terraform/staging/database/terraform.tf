terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }

  backend s3 {
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    endpoint                    = "nyc3.digitaloceanspaces.com"
    region                      = "us-east-1" // needed
    bucket                      = "iac.chilledbutter" // name of your space
    key                         = "staging/database/terraform/terraform.tfstate"
  }
}

provider digitalocean {
  token = var.do_token
}
