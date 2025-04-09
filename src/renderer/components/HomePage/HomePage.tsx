import React, { useState, useEffect, ReactElement, use } from 'react';
import './HomePage.css';
import { GameData } from 'src/main/data-retriever/utilities/SteamAPIUtility';

const HomePage: React.FC = () => {
  const [inputApiKey, setAPIKey] = useState('');
  const [inputVanity, setVanity] = useState('');
  const [inputSteamID, setSteamID] = useState('');
  const [indexedUsers, setIndexedUsers] = useState([]);

  const [gameData, setGameData] = useState<GameData[] | null>(null);

  const API = window.BackEndAPI;

  const [loading, setLoading] = useState(false); // Add loading state

  const handleIndexedUserClick = async (steamID: string) => {
    handleGetGameList('', inputApiKey, steamID);
  }

  const handleGetGameList = async (vanity: string, apiKey: string, steamID: string) => {
    setLoading(true); // Set loading to true
    try {
      const gameData = await API.dataRetriever.getOwnedGames(vanity, apiKey, steamID);
      gameData.sort((a, b) => a.completionDegree - b.completionDegree);

      setGameData(gameData);
    } catch (error) {
      console.error("Error fetching game data:", error);
    } finally {
      setLoading(false); // Set loading to false
      fetchUsers();
    }
  };

  const fetchUsers = async () => {
    const users = await API.database.getIndexedUsers();
    setIndexedUsers(users);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="home-page">
      <h1>Prioritize Your Backlog</h1>
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
            onClick={() => {handleGetGameList(inputVanity, inputApiKey, inputSteamID)}}
            disabled={loading} // Disable button while loading
          >
            {loading ? "Loading..." : "Get Game List"} {/* Show loading text */}
          </button>
        </div>
        <div className='indexed-users'>
          <label className='indexed-users-label'>Indexed Users</label>
          <ul>
            {indexedUsers && indexedUsers.map((user) => (
              <li 
                key={user.id}
                onClick={() => {handleIndexedUserClick(user.steamID);}}
              >{user.vanity}:{user.steamID}</li>
            ))}
          </ul>
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
                  {(
                    <>
                      <div>Average Time to Beat: {game.timeToBeat} hours</div>
                      <div>Completion index: {(game.completionDegree).toFixed(2)}</div>
                    </>
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