import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { ipcMain } from 'electron';
import { DefaultConfig, GlobalConfiguration } from './main/Config';
import axios from 'axios';
import 'dotenv/config';
import { initializeDatabase, closeDatabase } from './main/Database';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

GlobalConfiguration.setConfiguration( new DefaultConfig() );
const superController = GlobalConfiguration.config.appController;

(global as any).axios = axios;

// Set up IPC handler for all controller requests
ipcMain.handle('ipc-request', async (_event, channel, ...args) => {
  try {
    return await superController.handleIPCCall(channel, ...args);
  } catch (error) {
    console.error(`Error handling IPC call for channel ${channel}:`, error);
    return error;
  }
});

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    },
  });

  GlobalConfiguration.config.setMainWindow( mainWindow );

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

async function sleep( time: number ): Promise<void> {
  return new Promise(resolve => setTimeout( resolve, time));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  await initializeDatabase();
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    await closeDatabase();
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
