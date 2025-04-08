import { BaseController } from "../interfaces/BaseController";
import { SteamAPIUtility } from "./utilities/SteamAPIUtility";
import { HowLongToBeatAPIUtility } from "./utilities/HowLongToBeatAPIUtility";
import { GameData } from "./utilities/SteamAPIUtility";

export class DataRetrieverController extends BaseController {
    private steamAPI: SteamAPIUtility;
    private howLongToBeatAPI: HowLongToBeatAPIUtility;
    private steamAPIKey: string;
    private vanity: string;

    constructor() {
        super();
        this.steamAPI = new SteamAPIUtility();
        this.howLongToBeatAPI = new HowLongToBeatAPIUtility();
        // Load environment variables
        this.steamAPIKey = process.env.STEAM_API_KEY;
        this.vanity = process.env.VANITY;
    }

    protected registerActions() {
        this.actions.set('getOwnedGames', this.getOwnedGames.bind(this));
        this.actions.set('getTimeToBeat', this.getTimeToBeat.bind(this));
    }

    async getOwnedGames (
        vanity: string,
        api_key: string,
        steamID: string
    ): Promise<GameData[]> {
        let steamIDToUse;
        if (steamID === '') {
            steamIDToUse = await this.steamAPI.getSteamID(vanity, this.steamAPIKey);
        } else {
            steamIDToUse = steamID;
        }
        const ownedGames = await this.steamAPI.getOwnedGames(steamIDToUse, this.steamAPIKey);
        return ownedGames;
    }

    async getTimeToBeat(gameName: string): Promise<any> {
        try {
            const data = await this.howLongToBeatAPI.getGameData(gameName);
            return {
                mainStory: data?.gameplayMain ?? null,
                mainExtra: data?.gameplayMainExtra ?? null,
                completionist: data?.gameplayCompletionist ?? null,
            };
        } catch (error) {
            // console.error(`Failed to fetch time-to-beat data for ${gameName}:`, error);
            throw error;
        }
    }
}