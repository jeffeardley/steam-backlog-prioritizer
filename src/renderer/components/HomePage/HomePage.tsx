import React, { useState, useEffect, ReactElement, use } from 'react';
import './HomePage.css';
import { GameData } from 'src/main/data-retriever/utilities/SteamAPIUtility';

const HomePage: React.FC = () => {
  const [apiKey, setAPIKey] = useState('');
  const [vanity, setVanity] = useState('');
  const [steamID, setSteamID] = useState('');
  const [indexedUsers, setIndexedUsers] = useState([]);

  const [gameData, setGameData] = useState<GameData[] | null>(null);

  const API = window.BackEndAPI;

  const [loading, setLoading] = useState(false); // Add loading state

  const handleGetGameList = async () => {
    setLoading(true); // Set loading to true
    try {
      const gameData = await API.dataRetriever.getOwnedGames(vanity, apiKey, steamID);
      gameData.sort((a, b) => b.playtime - a.playtime);

      const updatedGameData = await Promise.all(
        gameData.map(async (game) => {
          const timeToBeatData = await API.dataRetriever.getEstimatedLengthToBeat(game.name);
          return {
            ...game,
            timeToBeat: {
              mainStory: timeToBeatData.mainStory,
              mainExtra: timeToBeatData.mainExtra,
              completionist: timeToBeatData.completionist,
            },
            playtime: parseFloat(game.playtime.toString()),
          };
        })
      );

      setGameData(updatedGameData);
    } catch (error) {
      console.error("Error fetching game data:", error);
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  return (
    <div className="home-page">
      <div className='info'>
        <div className='input'>
          <label>Steam API Key</label>
          <input 
            type='password'
            onChange={(e) => {
              setAPIKey(e.target.value)
            }}
          />
          <label>Steam Account Vanity</label>
          <input
            onChange={(e) => {
              setVanity(e.target.value)
            }}
          />
          <label>Steam Account ID</label>
          <input
            onChange={(e) => {
              setSteamID(e.target.value)
            }}
          />
          <button
            onClick={handleGetGameList}
            disabled={loading} // Disable button while loading
          >
            {loading ? "Loading..." : "Get Game List"} {/* Show loading text */}
          </button>
        </div>
        <div className='indexed-users'>
          <label className='indexed-users-label'>Indexed Users</label>
        </div>
      </div>
      <div className="game-list">
        {loading && <div>Loading game data...</div>} {/* Show loading indicator */}
        {gameData && gameData.map((game, index) => (
          <React.Fragment key={index}>
            <div className="game-card">
              <div className='game-card-img-wrapper'>
                <img className='game-card-img' src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appID}/library_600x900.jpg`}/>
              </div>
              <div className="game-title">{game.name}</div>
              <div className="game-description">
                <div className="game-playtime">{game.playtime} hours played</div>
                <div className="game-time-to-beat">
                  {game.timeToBeat && (
                    <div>
                      <div>Main Story: {game.timeToBeat.mainStory} hours</div>
                      <div>Main Extra: {game.timeToBeat.mainExtra} hours</div>
                      <div>Completionist: {game.timeToBeat.completionist} hours</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default HomePage;