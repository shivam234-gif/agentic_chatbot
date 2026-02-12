import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fork } from 'child_process';
import net from 'net';
import log from 'electron-log';

// Initialize logger
log.initialize();
console.log('Running in mode:', process.env.NODE_ENV);

let mainWindow: BrowserWindow | null = null;
let gatewayProcess: any = null;

const isDev = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

async function findFreePort(startPort: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      server.close(() => resolve(startPort));
    });
    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findFreePort(startPort + 1));
      } else {
        reject(err);
      }
    });
  });
}

async function startGateway() {
  log.info('Starting Gateway Process...');
  
  let gatewayScript: string;
  if (isDev) {
    gatewayScript = path.join(__dirname, '../dist-gateway/server.mjs');
  } else {
    // In production, we expect the gateway to be bundled in resources/gateway/server.mjs
    gatewayScript = path.join(process.resourcesPath, 'gateway', 'server.mjs');
  }
  
  log.info(`Gateway script path: ${gatewayScript}`);

  const GATEWAY_PORT = 3000;
  const env = { 
    ...process.env, 
    PORT: String(GATEWAY_PORT),
    OPENCLAW_GATEWAY_TOKEN: process.env.OPENCLAW_GATEWAY_TOKEN || 'dev-dummy-token',
    // Ensure we don't inherit electron specific vars that might confuse the server if checking for environment
  };

  try {
    // using silent: true pipes stdout/stderr to parent
    gatewayProcess = fork(gatewayScript, [], {
      env,
      silent: true,
    });

    gatewayProcess.stdout?.on('data', (data: any) => {
      // Clean up log lines
      const line = data.toString().trim();
      if (line) log.info(`[Gateway] ${line}`);
    });

    gatewayProcess.stderr?.on('data', (data: any) => {
       const line = data.toString().trim();
       if (line) log.error(`[Gateway] ${line}`);
    });

    gatewayProcess.on('exit', (code: number, signal: string) => {
      log.info(`Gateway process exited with code ${code} and signal ${signal}`);
    });
    
    gatewayProcess.on('error', (err: Error) => {
      log.error(`Gateway process failed to spawn: ${err.message}`);
    });

  } catch(e) {
    log.error(`Failed to start gateway process: ${e}`);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // For simplicity in this wrapper, but consider turning on for security later
    },
    autoHideMenuBar: true,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await startGateway();
  createWindow();

  app.on('activate', () => {
    if (mainWindow === null) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (gatewayProcess) {
     gatewayProcess.kill();
  }
});
