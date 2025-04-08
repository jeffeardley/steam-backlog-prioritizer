import axios from 'axios';

export interface GameData {
    name: string;
    playtime: string;
    appID: number;
    timeToBeat?: number;
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
}