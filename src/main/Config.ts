import { BrowserWindow } from "electron";
import { AppController, AppControllerBuilder } from "./AppController";
import { SuggesterController } from "./suggester/SuggesterController";
import { DataRetrieverController } from "./data-retriever/DataRetrieverController";

export interface IConfig {
    appController: AppController;
    mainWindow: BrowserWindow;
    setMainWindow( mainWindow: BrowserWindow ): void;
}

export class GlobalConfiguration {
    private static _config: IConfig;

    public static setConfiguration( config: IConfig ) {
        this._config = config;
    }

    public static get config(): IConfig {
        if ( ! this._config ) {
            throw new Error( "Configuration has not been set" );
        }

        return this._config;
    }
}

export class DefaultConfig implements IConfig {  
    public constructor() {

    }

    private _appController: AppController;
    public get appController(): AppController {
        if ( ! this._appController ) {
            const controllerBuilder = new AppControllerBuilder();

            controllerBuilder.set( 'suggester', new SuggesterController() );
            controllerBuilder.set( 'data-retriever', new DataRetrieverController() );

            this._appController = controllerBuilder.create();
        }

        return this._appController;
    }

    private _mainWindow: BrowserWindow;
    public setMainWindow( mainWindow: BrowserWindow ): void {
        this._mainWindow = mainWindow;
    }
    public get mainWindow(): BrowserWindow {
        if ( ! this._mainWindow ) {
            throw new Error( "Main Window has not been set" );
        }
        return this._mainWindow;
    }
}