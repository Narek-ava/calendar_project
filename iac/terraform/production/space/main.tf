resource "digitalocean_spaces_bucket" "production-space" {
  name   = "production.chilledbutter"
  region = "nyc3"

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}
