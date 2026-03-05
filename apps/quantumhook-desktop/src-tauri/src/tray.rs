use tauri::{AppHandle, menu::{Menu, MenuItem}, tray::TrayIconBuilder};

pub fn create_tray(app: &AppHandle) -> tauri::Result<()> {
    let quit_i = MenuItem::with_id(app, "quit", "Quit Quantumhook", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&quit_i])?;

    let builder = TrayIconBuilder::new()
        .menu(&menu)
        .tooltip("Quantumhook Desktop")
        .on_menu_event(|app: &tauri::AppHandle, event| {
            if event.id.as_ref() == "quit" {
                app.exit(0);
            }
        });

    // Use the default window icon if available
    let builder = if let Some(icon) = app.default_window_icon() {
        builder.icon(icon.clone())
    } else {
        builder
    };

    builder.build(app)?;
    
    Ok(())
}
