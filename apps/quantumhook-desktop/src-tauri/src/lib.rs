mod gateway;

use std::sync::Arc;
use gateway::sidecar::{GatewayProcess, run_gateway_with_watchdog};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let gateway = Arc::new(GatewayProcess::new());
    let gateway_for_setup = gateway.clone();
    let gateway_for_exit = gateway.clone();

    tauri::Builder::default()
        .setup(move |app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Resolve the gateway script path relative to the app dir
            let app_dir = std::env::current_dir().unwrap_or_default();
            let gateway_script = app_dir
                .join("dist-gateway")
                .join("server.mjs")
                .to_string_lossy()
                .to_string();

            log::info!("Gateway script path: {}", gateway_script);

            // Spawn the gateway watchdog on Tauri's async runtime
            let gw = gateway_for_setup.clone();
            tauri::async_runtime::spawn(async move {
                run_gateway_with_watchdog(gw, gateway_script).await;
            });

            Ok(())
        })
        .on_window_event(move |_window, event| {
            if let tauri::WindowEvent::Destroyed = event {
                let gw = gateway_for_exit.clone();
                tauri::async_runtime::spawn(async move {
                    gw.stop().await;
                });
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

