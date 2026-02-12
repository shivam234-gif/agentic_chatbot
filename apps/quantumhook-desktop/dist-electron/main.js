"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const net_1 = __importDefault(require("net"));
const electron_log_1 = __importDefault(require("electron-log"));
// Initialize logger
electron_log_1.default.initialize();
console.log('Running in mode:', process.env.NODE_ENV);
let mainWindow = null;
let gatewayProcess = null;
const isDev = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
async function findFreePort(startPort) {
    return new Promise((resolve, reject) => {
        const server = net_1.default.createServer();
        server.listen(startPort, () => {
            server.close(() => resolve(startPort));
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(findFreePort(startPort + 1));
            }
            else {
                reject(err);
            }
        });
    });
}
async function startGateway() {
    electron_log_1.default.info('Starting Gateway Process...');
    let gatewayScript;
    if (isDev) {
        gatewayScript = path_1.default.join(__dirname, '../dist-gateway/server.mjs');
    }
    else {
        // In production, we expect the gateway to be bundled in resources/gateway/server.mjs
        gatewayScript = path_1.default.join(process.resourcesPath, 'gateway', 'server.mjs');
    }
    electron_log_1.default.info(`Gateway script path: ${gatewayScript}`);
    const GATEWAY_PORT = 3000;
    const env = {
        ...process.env,
        PORT: String(GATEWAY_PORT),
        OPENCLAW_GATEWAY_TOKEN: process.env.OPENCLAW_GATEWAY_TOKEN || 'dev-dummy-token',
        // Ensure we don't inherit electron specific vars that might confuse the server if checking for environment
    };
    try {
        // using silent: true pipes stdout/stderr to parent
        gatewayProcess = (0, child_process_1.fork)(gatewayScript, [], {
            env,
            silent: true,
        });
        gatewayProcess.stdout?.on('data', (data) => {
            // Clean up log lines
            const line = data.toString().trim();
            if (line)
                electron_log_1.default.info(`[Gateway] ${line}`);
        });
        gatewayProcess.stderr?.on('data', (data) => {
            const line = data.toString().trim();
            if (line)
                electron_log_1.default.error(`[Gateway] ${line}`);
        });
        gatewayProcess.on('exit', (code, signal) => {
            electron_log_1.default.info(`Gateway process exited with code ${code} and signal ${signal}`);
        });
        gatewayProcess.on('error', (err) => {
            electron_log_1.default.error(`Gateway process failed to spawn: ${err.message}`);
        });
    }
    catch (e) {
        electron_log_1.default.error(`Failed to start gateway process: ${e}`);
    }
}
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
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
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, '../dist/index.html'));
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
electron_1.app.whenReady().then(async () => {
    await startGateway();
    createWindow();
    electron_1.app.on('activate', () => {
        if (mainWindow === null)
            createWindow();
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('before-quit', () => {
    if (gatewayProcess) {
        gatewayProcess.kill();
    }
});
//# sourceMappingURL=main.js.map