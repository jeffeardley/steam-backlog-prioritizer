interface Game {
    appID: number;
    name: string;
    timeToBeat: number;
    gameDevelopers: string[];
    genres: string[];
    metacriticScore: number;
    releaseDate: string;
    completionDegree: number;
    playtime: number;
}

export class Suggester {
    private initialized: boolean = false;

    async initialize(): Promise<void> {
        console.log('Suggester initialized');
        this.initialized = true;
    }

    async dispose(): Promise<void> {
        console.log('Suggester disposed');
        this.initialized = false;
    }

    async suggest(
      userLibrary: Game[]
  ): Promise<{ game_id: number; game_title: string; probability: number }[]> {
      // Separate games into "liked" and "unplayed/underplayed"
      const likedGames = userLibrary.filter(game => game.playtime > 10); // Arbitrary threshold for "liked"
      const unplayedGames = userLibrary.filter(game => game.completionDegree < 1);
  
      // Compute similarity scores for unplayed games
      const scores = unplayedGames.map(game => {
          const similarityScore = this.computeSimilarity(game, likedGames);
          const completionPenalty = 1 - game.completionDegree; // Higher penalty for lower completion
          const normalizedMetacritic = game.metacriticScore ? game.metacriticScore / 100 : 0.5; // Default to 0.5 if no score
  
          // Final score includes similarity, completion penalty, and Metacritic impact
          return {
              game_id: game.appID,
              game_title: game.name,
              score: similarityScore * completionPenalty * normalizedMetacritic,
          };
      });
  
      // Apply softmax to scores
      const probabilities = this.softmax(scores.map(s => s.score));
  
      // Return games with probabilities
      return scores.map((game, index) => ({
          game_id: game.game_id,
          game_title: game.game_title,
          probability: probabilities[index],
      }));
  }

    private computeSimilarity(game: Game, likedGames: Game[]): number {
        // Simple similarity based on shared genres and developers
        let similarity = 0;

        likedGames.forEach(likedGame => {
            const sharedGenres = game.genres.filter(genre => likedGame.genres.includes(genre)).length;
            const sharedDevelopers = game.gameDevelopers.filter(dev => likedGame.gameDevelopers.includes(dev)).length;

            similarity += sharedGenres + sharedDevelopers;
        });

        return similarity;
    }

    private softmax(scores: number[]): number[] {
        const maxScore = Math.max(...scores); // For numerical stability
        const expScores = scores.map(score => Math.exp(score - maxScore));
        const sumExpScores = expScores.reduce((sum, score) => sum + score, 0);
        return expScores.map(score => score / sumExpScores);
    }
}