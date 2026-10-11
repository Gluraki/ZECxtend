mod mqtt;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .manage(mqtt::MqttState::default())
        .invoke_handler(tauri::generate_handler![mqtt::mqtt_connect, mqtt::mqtt_disconnect])
        .run(tauri::generate_context!())
        .expect("error while running ZECtime");
}
