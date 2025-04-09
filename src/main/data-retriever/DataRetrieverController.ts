import { BaseController } from "../interfaces/BaseController";
import { SteamAPIUtility } from "./utilities/SteamAPIUtility";
import { HowLongToBeatAPIUtility } from "./utilities/HowLongToBeatAPIUtility";
import { GameData } from "./utilities/SteamAPIUtility";
import { doesUserExist, insertGame, insertUser, insertUserToGame, getUserGames } from "../database/utilities/Database";
import { Suggester } from "../suggester/utilities/Suggester";

export class DataRetrieverController extends BaseController {
    private steamAPI: SteamAPIUtility;
    private howLongToBeatAPI: HowLongToBeatAPIUtility;
    private steamAPIKey: string;
    private suggester: Suggester;
    private vanity: string;

    constructor() {
        super();
        this.steamAPI = new SteamAPIUtility();
        this.howLongToBeatAPI = new HowLongToBeatAPIUtility();
        this.suggester = new Suggester();
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
            console.log('\n\n\n\n\n\n\n\n\n\n\n SANITIZED GAMES', userGames);
            const ownedGames: GameData[] = userGames.map(game => ({
                name: game.game_title,
                playtime: game.play_time,
                appID: game.game_id,
                timeToBeat: game.estimated_time_to_beat,
                completionDegree: game.completion_degree,
                recommendationStrength: game.recommendation_strength
            }))
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
            console.log('\n\n\n\n\n\n\n\n\n\n\n SANITIZED GAMES', ownedGames);
            const detailedGames = await Promise.all(
                ownedGames.map(async (game) => {
                    // Get time to beat data
                    const timeToBeat = await this.howLongToBeatAPI.getGameData(game.name);
                    game.timeToBeat = timeToBeat;
                    if (game.timeToBeat !== 0) {
                        game.completionDegree = parseFloat(game.playtime) / game.timeToBeat;
                    } else {
                        game.completionDegree = 100;
                    }

                    // Get detailed game info
                    const detailedInfo = await this.steamAPI.getSteamStoreDetails(game.appID);
                    game.gameDevelopers = detailedInfo.developers;
                    game.genres = detailedInfo.genres;
                    game.metacriticScore = detailedInfo.metacriticScore;
                    game.releaseDate = detailedInfo.releaseDate;

                    return game;
                })
            );

            console.log('\n\n\n\n\n\n\n\n\n\n\n SANITIZED GAMES', detailedGames);

            const suggestedGames = await this.suggester.suggest(detailedGames);

            console.log('\n\n\n\n\n\n\n\n\n\n\n SANITIZED GAMES', suggestedGames);

            const gamesWithRecommendations = detailedGames.map((game) => {
                const suggestion = suggestedGames.find((sg) => sg.game_id === game.appID);
                const recommendationStrength = suggestion?.probability || 0;

                return {
                    ...game,
                    recommendationStrength,
                };
            });

            // Insert games into the database
            await Promise.all(
                gamesWithRecommendations.map(async (game) => {
                    await insertGame(
                        game.appID,
                        game.name,
                        null,
                        game.timeToBeat,
                        game.gameDevelopers,
                        game.genres,
                        game.metacriticScore,
                        game.releaseDate
                    );
                    await insertUserToGame(
                        parseInt(steamIDToUse),
                        game.appID,
                        game.completionDegree,
                        parseFloat(game.playtime),
                        game.recommendationStrength
                    );
                })
            );

            const sanitizedGames = gamesWithRecommendations.map((game) => ({
                appID: game.appID,
                name: game.name,
                timeToBeat: game.timeToBeat,
                gameDevelopers: game.gameDevelopers,
                genres: game.genres,
                metacriticScore: game.metacriticScore,
                releaseDate: game.releaseDate,
                completionDegree: game.completionDegree,
                playtime: game.playtime,
                recommendationStrength: game.recommendationStrength,
            }));

            console.log('\n\n\n\n\n\n\n\n\n\n\n SANITIZED GAMES', sanitizedGames);

            return sanitizedGames.filter((game) => game.recommendationStrength > 0);
        }
    }
}