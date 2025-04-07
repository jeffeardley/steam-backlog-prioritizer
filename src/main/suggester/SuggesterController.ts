import { BaseController } from "../interfaces/BaseController";
import { Suggester } from "./utilities/Suggester";

export class SuggesterController extends BaseController {
    private suggester: Suggester;

    constructor() {
        super();
        this.suggester = new Suggester;
    }

    protected registerActions() {
        this.actions.set('suggestGames', this.suggestGames.bind(this));
    }

    private async suggestGames() {
        return this.suggester.suggest();
    }
}