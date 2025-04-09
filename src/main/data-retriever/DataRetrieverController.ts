import { BaseController } from "../interfaces/BaseController";
import { SteamAPIUtility } from "./utilities/SteamAPIUtility";
import { HowLongToBeatAPIUtility } from "./utilities/HowLongToBeatAPIUtility";
import { GameData } from "./utilities/SteamAPIUtility";
import { doesUserExist, insertGame, insertUser, insertUserToGame, getUserGames } from "../database/utilities/Database";

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
    }

    async getOwnedGames (
        vanity: string,
        api_key: string,
        steamID: string,
        forceIndex: boolean = false,
    ): Promise<GameData[]> {
        const isPlayerIndexed = await doesUserExist(steamID);
        if (isPlayerIndexed && !forceIndex) {
            // Get the cached user data
            const userGames = await getUserGames(parseInt(steamID));
            const ownedGames: GameData[] = userGames.map(game => ({
                name: game.game_title,
                playtime: game.play_time,
                appID: game.game_id,
                timeToBeat: game.estimated_time_to_beat,
                completionDegree: game.completion_degree,
            }))
            console.log(ownedGames);
            return ownedGames;
        } else {
            // Obtain user data through APIs
            let steamIDToUse;
            if (steamID === '') {
                steamIDToUse = await this.steamAPI.getSteamID(vanity, this.steamAPIKey);
            } else {
                steamIDToUse = steamID;
            }
            await insertUser(steamIDToUse, vanity);
            const ownedGames = await this.steamAPI.getOwnedGames(steamIDToUse, this.steamAPIKey);
            await Promise.all(
                ownedGames.map(async (game) => {
                    //get time to beat data
                    const timeToBeat = await this.howLongToBeatAPI.getGameData(game.name);
                    game.timeToBeat = timeToBeat;
                    if (game.timeToBeat != 0) {
                        game.completionDegree = parseFloat(game.playtime) / game.timeToBeat;
                    } else {
                        game.completionDegree = 100
                    }

                    //get detailed game info
                    const detailedInfo = await this.steamAPI.getSteamStoreDetails(game.appID);

                    game.gameDevelopers = detailedInfo.developers;
                    game.genres = detailedInfo.genres;
                    game.metacriticScore = detailedInfo.metacriticScore;
                    game.releaseDate = detailedInfo.releaseDate;

                    await insertGame(
                        game.appID, 
                        game.name, 
                        null, 
                        timeToBeat, 
                        game.gameDevelopers,
                        game.genres,
                        game.metacriticScore,
                        game.releaseDate,
                    );
                    await insertUserToGame(parseInt(steamIDToUse), game.appID, game.completionDegree, parseFloat(game.playtime));
                })
            );
            return ownedGames;
        }
    }
}