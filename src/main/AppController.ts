import { BaseController } from './interfaces/BaseController';

import { IPCRouteParser } from './app-utilities/IPCRouteParser';

export class AppControllerBuilder {
    private controllers: Map<string, BaseController> = new Map();

    public set(channelPrefix: string, controller: BaseController): AppControllerBuilder {
        this.controllers.set(channelPrefix, controller);
        return this; // allow for chaining
    }

    public create(): AppController {
        return new AppController(this.controllers);
    }
}

export class AppController {
    private controllers: Map<string, BaseController>;

    constructor(controllers: Map<string, BaseController>) {
        this.controllers = controllers;
    }

    async handleIPCCall(channel: string, ...args: any[]) {
        const route = IPCRouteParser.parse(channel);
        const controller = this.controllers.get(route.namespace);

        if (!controller) {
            throw new Error(`No controller found for namespace: ${route.namespace}`);
        }

        return controller.handleAction(route.action, ...args);
    }
}