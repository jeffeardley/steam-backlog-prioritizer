import { HowLongToBeatService } from 'howlongtobeat';

export class HowLongToBeatAPIUtility {
    private api: HowLongToBeatService;

    constructor() {
        this.api = new HowLongToBeatService();
    }

    async getGameData(gameName: string): Promise<any> {
        try {
            const data = await this.api.search(gameName);
            if (!data || data.length === 0) {
                throw new Error(`No data found for game: ${gameName}`);
            }
            return data[0];
        } catch (error) {
            // console.error('Error fetching game data:', error);
            throw error;
        }
    }
}