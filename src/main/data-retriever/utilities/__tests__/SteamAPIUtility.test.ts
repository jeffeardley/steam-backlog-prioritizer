import { SteamAPIUtility } from "../SteamAPIUtility";
import 'dotenv/config';

describe('HowLongToBeatAPIUtility (Live Tests)', () => {
    let utility: SteamAPIUtility;

    beforeEach(() => {
        utility = new SteamAPIUtility();
    });

    it('should return data for a known game (live test)', async () => {
        const gameID = 1254370; //Half Life 2
        const apiKey = process.env.STEAM_API_KEY
        const result = await utility.getSteamStoreDetails(gameID);

        expect(result).toBeDefined();
        expect(result.name).toContain('Undertale');
    });
});