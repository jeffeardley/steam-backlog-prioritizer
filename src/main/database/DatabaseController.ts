import { BaseController } from "../interfaces/BaseController";
import { getUsers } from "./utilities/Database"

export class DatabaseController extends BaseController {
    constructor() {
        super();
    }

    protected registerActions() {
        this.actions.set('getIndexedUsers', this.getIndexedUsers.bind(this));
    }

    async getIndexedUsers (): Promise<any[]> {
        const users = await getUsers();
        return users;
    }
}