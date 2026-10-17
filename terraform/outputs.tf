output "worker_name" {
  description = "Name of the deployed Student Task Manager Worker"
  value       = cloudflare_workers_script.app.name
}

output "kv_namespace_id" {
  description = "ID of the tasks KV namespace"
  value       = cloudflare_workers_kv_namespace.tasks.id
}