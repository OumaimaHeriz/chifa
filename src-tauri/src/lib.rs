mod db;
mod server;

use std::sync::Once;
static INIT: Once = Once::new();

#[tauri::command]
async fn start_server_cmd(storage_path: String) -> Result<String, String> {
    INIT.call_once(|| {
        let path = storage_path.clone();
        tauri::async_runtime::spawn(async move {
            if let Err(e) = server::start_server(path).await {
                eprintln!("Server error: {}", e);
            }
        });
    });
    Ok("Server started".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![start_server_cmd])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
