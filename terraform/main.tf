resource "cloudflare_workers_kv_namespace" "tasks" {
  account_id = var.cloudflare_account_id
  title      = "student-task-manager-tasks"
}

resource "cloudflare_workers_script" "app" {

  account_id         = var.cloudflare_account_id
  name               = var.worker_name
  content            = file("${path.module}/../application/worker.js")
  compatibility_date = "2025-01-01"
  module             = true

  kv_namespace_binding {
    name         = "TASKS_KV"
    namespace_id = cloudflare_workers_kv_namespace.tasks.id
  }

  plain_text_binding {
    name = "APP_HTML"
    text = file("${path.module}/../application/index.html")
  }

  plain_text_binding {
    name = "APP_CSS"
    text = file("${path.module}/../application/style.css")
  }

  plain_text_binding {
    name = "APP_JS"
    text = file("${path.module}/../application/script.js")
  }
}