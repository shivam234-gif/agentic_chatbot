"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const net_1 = __importDefault(require("net"));
const electron_log_1 = __importDefault(require("electron-log"));
// Initialize logger
electron_log_1.default.initialize();
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
    // Placeholder: eventually this will point to the actual gateway entry point
    // For bundled app, this might be inside resources/app.asar.unpacked/ or similar
    // const gatewayPath = path.join(process.resourcesPath, 'gateway', 'index.js');
    electron_log_1.default.info('Gateway placeholder logic executing.');
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