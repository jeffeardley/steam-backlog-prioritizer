// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, IpcRenderer, ipcRenderer } from 'electron';
import { GameData } from './main/data-retriever/utilities/SteamAPIUtility';

// Interface for the exposed API
interface BackEndAPI {
    suggester: {
        suggest: () => Promise<string>;
    };
    dataRetriever: {
        getOwnedGames: (vanity: string, api_key: string) => Promise<GameData[]>
    };
}

declare global {
    interface Window {
        BackEndAPI: BackEndAPI;
    }
}

// Create API object that matches your controller structure
const api: BackEndAPI = {
    suggester: {
        suggest: () =>
            ipcRenderer.invoke('ipc-request', 'suggester/suggest'),
    },
    dataRetriever: {
        getOwnedGames: (vanity, api_key) =>
            ipcRenderer.invoke('ipc-request', 'data-retriever/getOwnedGames', vanity, api_key)
    }
};

contextBridge.exposeInMainWorld( 'BackEndAPI', api );