use std::process::Stdio;
use std::sync::Arc;
use tokio::process::{Child, Command};
use tokio::sync::Mutex;
use tokio::time::{sleep, Duration};

/// Holds the spawned Gateway child process.
pub struct GatewayProcess {
    child: Arc<Mutex<Option<Child>>>,
}

impl GatewayProcess {
    pub fn new() -> Self {
        Self {
            child: Arc::new(Mutex::new(None)),
        }
    }

    /// Spawns the OpenClaw Gateway as `node dist-gateway/server.mjs`.
    /// The gateway binary path is resolved relative to the app's resource dir.
    pub async fn start(&self, gateway_script: &str) -> Result<(), String> {
        log::info!("Starting Gateway sidecar: node {}", gateway_script);

        let child = Command::new("node")
            .arg(gateway_script)
            .env("PORT", "3000")
            // Disable auth for local desktop — the gateway runs on 127.0.0.1 only
            .env("OPENCLAW_GATEWAY_AUTH_MODE", "none")
            .env("OPENCLAW_GATEWAY_TOKEN", "desktop-local-dev")
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .kill_on_drop(true)
            .spawn()
            .map_err(|e| format!("Failed to spawn Gateway: {}", e))?;

        let pid = child.id().unwrap_or(0);
        log::info!("Gateway sidecar started (PID: {})", pid);

        let mut lock = self.child.lock().await;
        *lock = Some(child);

        Ok(())
    }

    /// Checks if the Gateway process is still running.
    pub async fn is_running(&self) -> bool {
        let mut lock = self.child.lock().await;
        if let Some(ref mut child) = *lock {
            match child.try_wait() {
                Ok(Some(_)) => false,  // exited
                Ok(None) => true,      // still running
                Err(_) => false,
            }
        } else {
            false
        }
    }

    /// Gracefully kills the Gateway process.
    pub async fn stop(&self) {
        let mut lock = self.child.lock().await;
        if let Some(ref mut child) = *lock {
            let pid = child.id().unwrap_or(0);
            log::info!("Stopping Gateway sidecar (PID: {})", pid);
            let _ = child.kill().await;
            let _ = child.wait().await;
            log::info!("Gateway sidecar stopped");
        }
        *lock = None;
    }
}

/// Spawns the gateway and starts a background health-check loop.
/// If the gateway crashes, it will auto-restart with exponential backoff.
pub async fn run_gateway_with_watchdog(
    process: Arc<GatewayProcess>,
    gateway_script: String,
) {
    let mut backoff_secs: u64 = 1;
    let max_backoff: u64 = 10;

    loop {
        if let Err(e) = process.start(&gateway_script).await {
            log::error!("Gateway failed to start: {}", e);
        }

        // Health check loop — poll every 2 seconds
        loop {
            sleep(Duration::from_secs(2)).await;
            if !process.is_running().await {
                log::warn!("Gateway sidecar exited unexpectedly, restarting in {}s...", backoff_secs);
                break;
            }
            // Reset backoff on successful health check
            backoff_secs = 1;
        }

        sleep(Duration::from_secs(backoff_secs)).await;
        backoff_secs = (backoff_secs * 2).min(max_backoff);
    }
}
