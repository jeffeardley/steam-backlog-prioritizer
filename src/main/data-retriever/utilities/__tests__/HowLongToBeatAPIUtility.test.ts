import { HowLongToBeatAPIUtility } from '../HowLongToBeatAPIUtility';

describe('HowLongToBeatAPIUtility (Live Tests)', () => {
    let utility: HowLongToBeatAPIUtility;

    beforeEach(() => {
        utility = new HowLongToBeatAPIUtility();
    });

    it('should return data for a known game (live test)', async () => {
        const gameName = 'The Long Dark';
        const result = await utility.getGameData(gameName);

        expect(result).toBeDefined();
        expect(result.name).toContain('Undertale');
    });

    it('should throw an error for an unknown game (live test)', async () => {
        const gameName = 'Nonexistent Game XYZ';

        await expect(utility.getGameData(gameName)).rejects.toThrow(`No data found for game: ${gameName}`);
    });
});
