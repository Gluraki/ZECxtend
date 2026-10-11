use std::sync::Mutex;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use chrono::{DateTime, NaiveDateTime};
use rumqttc::{AsyncClient, Event, EventLoop, MqttOptions, Packet, QoS};
use serde::{Deserialize, Serialize};
use tauri::async_runtime::JoinHandle;
use tauri::{AppHandle, Emitter, State};

const CONNECT_TIMEOUT: Duration = Duration::from_secs(5);
const RECONNECT_DELAY: Duration = Duration::from_secs(2);

struct Session {
    client: AsyncClient,
    task: JoinHandle<()>,
}

#[derive(Default)]
pub struct MqttState(Mutex<Option<Session>>);

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MqttConfig {
    host: String,
    port: u16,
    topic: String,
    username: Option<String>,
    password: Option<String>,
}

/// Message sent by the ESPs: `{"esp_id": "<prefix>-<mac>", "timestamp": "<ISO datetime>"}`.
#[derive(Deserialize)]
struct EspPayload {
    esp_id: String,
    timestamp: String,
}

#[derive(Serialize, Clone)]
struct TimestampEvent {
    mac: String,
    /// Microseconds since epoch of the timestamp as sent (offset ignored, only differences matter).
    micros: i64,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct StatusEvent {
    connected: bool,
    error: Option<String>,
}

fn parse_timestamp(value: &str) -> Option<i64> {
    let naive = match DateTime::parse_from_rfc3339(value) {
        Ok(dt) => dt.naive_local(),
        Err(_) => NaiveDateTime::parse_from_str(value, "%Y-%m-%dT%H:%M:%S%.f").ok()?,
    };
    Some(naive.and_utc().timestamp_micros())
}

fn parse_payload(payload: &[u8]) -> Option<TimestampEvent> {
    let payload: EspPayload = serde_json::from_slice(payload).ok()?;
    let mac = payload
        .esp_id
        .split_once('-')
        .map_or(payload.esp_id.as_str(), |(_, mac)| mac);

    Some(TimestampEvent {
        mac: mac.to_string(),
        micros: parse_timestamp(&payload.timestamp)?,
    })
}

fn client_id() -> String {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.subsec_nanos())
        .unwrap_or_default();
    format!("zectime-{}-{nanos}", std::process::id())
}

async fn wait_for_connack(eventloop: &mut EventLoop) -> Result<(), String> {
    loop {
        match eventloop.poll().await {
            Ok(Event::Incoming(Packet::ConnAck(_))) => return Ok(()),
            Ok(_) => {}
            Err(e) => return Err(e.to_string()),
        }
    }
}

async fn run_eventloop(app: AppHandle, client: AsyncClient, mut eventloop: EventLoop, topic: String) {
    loop {
        match eventloop.poll().await {
            Ok(Event::Incoming(Packet::Publish(publish))) => {
                if let Some(event) = parse_payload(&publish.payload) {
                    let _ = app.emit("mqtt://timestamp", event);
                }
            }
            Ok(Event::Incoming(Packet::ConnAck(_))) => {
                // Clean sessions drop subscriptions, so subscribe again after every reconnect.
                let _ = client.try_subscribe(&topic, QoS::AtLeastOnce);
                let _ = app.emit("mqtt://status", StatusEvent { connected: true, error: None });
            }
            Ok(_) => {}
            Err(e) => {
                let _ = app.emit(
                    "mqtt://status",
                    StatusEvent { connected: false, error: Some(e.to_string()) },
                );
                tokio::time::sleep(RECONNECT_DELAY).await;
            }
        }
    }
}

fn stop_session(state: &MqttState) {
    if let Some(session) = state.0.lock().unwrap().take() {
        let _ = session.client.try_disconnect();
        session.task.abort();
    }
}

#[tauri::command]
pub async fn mqtt_connect(app: AppHandle, state: State<'_, MqttState>, config: MqttConfig) -> Result<(), String> {
    stop_session(&state);

    let mut options = MqttOptions::new(client_id(), config.host, config.port);
    options.set_keep_alive(Duration::from_secs(10));
    if let Some(username) = config.username.filter(|u| !u.is_empty()) {
        options.set_credentials(username, config.password.unwrap_or_default());
    }

    let (client, mut eventloop) = AsyncClient::new(options, 64);

    match tokio::time::timeout(CONNECT_TIMEOUT, wait_for_connack(&mut eventloop)).await {
        Ok(Ok(())) => {}
        Ok(Err(e)) => return Err(e),
        Err(_) => return Err("Connection timed out".into()),
    }

    client
        .subscribe(&config.topic, QoS::AtLeastOnce)
        .await
        .map_err(|e| e.to_string())?;

    let task = tauri::async_runtime::spawn(run_eventloop(app, client.clone(), eventloop, config.topic));
    *state.0.lock().unwrap() = Some(Session { client, task });

    Ok(())
}

#[tauri::command]
pub fn mqtt_disconnect(state: State<'_, MqttState>) {
    stop_session(&state);
}
