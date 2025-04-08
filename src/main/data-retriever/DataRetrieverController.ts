import { BaseController } from "../interfaces/BaseController";
import { SteamAPIUtility } from "./utilities/SteamAPIUtility";
import { GameData } from "./utilities/SteamAPIUtility";

export class DataRetrieverController extends BaseController {
    private steamAPI: SteamAPIUtility;
    private steamAPIKey: string;
    private vanity: string;

    constructor() {
        super();
        this.steamAPI = new SteamAPIUtility();
        this.steamAPIKey = process.env.STEAM_API_KEY;
        this.vanity = process.env.VANITY;
    }

    protected registerActions() {
        this.actions.set('getOwnedGames', this.getOwnedGames.bind(this));
    }

    async getOwnedGames (
        vanity: string,
        api_key: string
    ): Promise<GameData[]> {
        const steamID = await this.steamAPI.getSteamID(this.vanity, this.steamAPIKey);
        const ownedGames = await this.steamAPI.getOwnedGames(steamID, this.steamAPIKey);
        return ownedGames;
    }

}