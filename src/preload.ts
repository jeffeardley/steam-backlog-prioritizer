// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, IpcRenderer, ipcRenderer } from 'electron';

// Interface for the exposed API
interface ToAllAPI {
    suggester: {
        suggest: () => Promise<string>;
    };
}

declare global {
    interface Window {
        ToAllAPI: ToAllAPI;
    }
}

// Create API object that matches your controller structure
const api: ToAllAPI = {
    suggester: {
        suggest: () =>
            ipcRenderer.invoke('ipc-request', 'suggester/suggest'),
    },
};

contextBridge.exposeInMainWorld( 'ToAllAPI', api );