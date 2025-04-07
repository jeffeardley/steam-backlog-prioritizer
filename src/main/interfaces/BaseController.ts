export abstract class BaseController {
    protected actions: Map<string, Function> = new Map();
    private _actionsAreRegistered: boolean = false;

    protected abstract registerActions(): void;

    async handleAction(action: string, ...args: any[]) {
        if ( !this._actionsAreRegistered ) this.registerActions();

        const handler = this.actions.get(action);
        if (!handler) {
            throw new Error(`No handler found for action: ${action}`);
        }
        return handler.apply(this, args);
    }
}