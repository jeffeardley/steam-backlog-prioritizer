import axios from 'axios';

export interface GameData {
    name: string;
    playtime: string;
    appID: number;
    gameDevelopers?: string[];
    genres?: string[];
    metacriticScore?: number;
    releaseDate?: string;
    timeToBeat?: number;
    completionDegree?: number;
}

interface SteamGameReturn {
    appid: number;
    name: string;
    playtime_forever: number;
    img_icon_url: string;
    content_descriptorids: number[];
}

export class SteamAPIUtility {
    async getSteamID(
        vanity: string,
        api_key: string
    ): Promise<string> {
        try {
            const res: any = await axios.get('https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/', {
            params: {
                key: api_key,
                vanityurl: vanity
            }
            });

            if (res.data.response.success === 1) {
                return res.data.response.steamid;
            } else {
                throw new Error('Failed to resolve vanity URL.');
            }
        } catch (err) {
            // console.error('Error resolving Steam ID:', err.message);
        }
    }

    async getOwnedGames(
        steamid: string,
        api_key: string
    ): Promise<GameData[]> {
        try {
            const res: any = await axios.get('https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/', {
                params: {
                    key: api_key,
                    steamid,
                    include_appinfo: true
                }
            });

            const games: SteamGameReturn[] = res.data.response.games || [];
            const gameData = games.map(game => ({
                name: game.name.replace(/[^\w\s:.\-]/g, ''), // Remove special characters
                playtime: (game.playtime_forever / 60).toFixed(2), // Convert from minutes to hours
                appID: game.appid,
            }))

            return gameData;

        } catch (err) {
            // console.error('Error fetching games:', err.message);
        }
    }

    async getSteamStoreDetails(appid: number) {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appid}`;

    try {
        const { data } = await axios.get(url);
        const gameData = data[appid].data;

        if (!gameData) {
            throw new Error(`Failed to fetch data for AppID ${appid}`);
        }

        let gameGenres : string[] = [];
        gameData.genres.forEach((genre) => {
            gameGenres.push(genre.description)
        })

        const dataToKeep = {
            developers: gameData.developers,
            genres: gameGenres,
            metacriticScore: gameData.metacritic?.score ?? 80,
            releaseDate: gameData.release_date?.date || 'Unknown'
        }

        return dataToKeep;
    } catch (error) {
        console.error(`Error fetching Steam Store details for app ${appid}:`, error);
        throw error;
    }
    }


    async getGameAchievements(appid: number, api_key: string) {
        if (!api_key) {
            throw new Error('API key is required.');
        }
        if (!appid || typeof appid !== 'number') {
            throw new Error('Invalid appid.');
        }
    
        const url = `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${api_key}&appid=${appid}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
    
            const achievements = data.game?.availableGameStats?.achievements || [];

            console.log(achievements);
            
            return achievements.map((ach: any) => ({
                name: ach.name,
                displayName: ach.displayName,
                description: ach.description,
            }));
        } catch (error) {
            console.error(`Error fetching game achievements for appid ${appid}:`, error.message);
            throw error;
        }
    }

    async getUserAchievements(appid: number, steamId: string, api_key: string) {
        if (!api_key) {
            throw new Error('API key is required.');
        }
        if (!appid || typeof appid !== 'number') {
            throw new Error('Invalid appid.');
        }
        if (!steamId || typeof steamId !== 'string') {
            throw new Error('Invalid steamid.');
        }
    
        const url = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/`;
    
        try {
            const { data } = await axios.get(url, {
                params: {
                    key: api_key,
                    steamid: steamId,
                    appid: appid,
                },
            });
    
            if (!data.playerstats?.achievements) {
                console.warn(`No achievements found for user ${steamId} in game ${appid}.`);
                return [];
            }
    
            const achievements = data.playerstats.achievements;
            return achievements.map((ach: any) => ({
                apiname: ach.apiname,
                achieved: ach.achieved === 1,
                unlocktime: ach.unlocktime ? new Date(ach.unlocktime * 1000) : null,
            }));
        } catch (error) {
            console.error(`Error fetching user achievements for appid ${appid} and steamid ${steamId}:`, error.message);
            throw error;
        }
    }
      
}