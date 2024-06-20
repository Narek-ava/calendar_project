output id {
  value = digitalocean_spaces_bucket.production-space.id
}

output bucket_domain_name {
  value = digitalocean_spaces_bucket.production-space.bucket_domain_name
}
