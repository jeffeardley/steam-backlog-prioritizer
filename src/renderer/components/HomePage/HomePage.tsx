import React, { useState, useEffect, ReactElement, use } from 'react';
import './HomePage.css';
import { GameData } from 'src/main/data-retriever/utilities/SteamAPIUtility';

const HomePage: React.FC = () => {
  const [apiKey, setAPIKey] = useState('');
  const [vanity, setVanity] = useState('');

  const [gameData, setGameData] = useState<GameData[] | null>(null);

  const handleGetGameList = async () => {
    const gameData = await window.BackEndAPI.dataRetriever.getOwnedGames(vanity, apiKey);
    gameData.sort((a, b) => b.playtime - a.playtime);
    setGameData(gameData);
  }

  useEffect(() => {
    handleGetGameList();
  }, []);

  return (
    <div className="home-page">
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
      <button
        onClick={handleGetGameList}
      >
        Get Game List
      </button>
      <div className="game-list">
        {gameData && gameData.map((game, index) => (
          <React.Fragment key={index}>
            <div className="game-card">
              <div className="game-title">{game.name}</div>
              <div className="game-playtime">{game.playtime}</div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default HomePage;