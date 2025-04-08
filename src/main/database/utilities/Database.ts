import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let db: Database<sqlite3.Database, sqlite3.Statement>;

// Initialize the database and create tables if they don't exist
export async function initializeDatabase() {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS User (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      steamID TEXT,
      vanity TEXT
    );

    CREATE TABLE IF NOT EXISTS Game (
      game_id INTEGER PRIMARY KEY,
      game_title TEXT,
      estimated_time_to_beat INTEGER,
      has_single_player BOOLEAN
    );

    CREATE TABLE IF NOT EXISTS Tag (
      tag_id INTEGER PRIMARY KEY,
      tag TEXT
    );

    CREATE TABLE IF NOT EXISTS Tag_to_Game (
      game_id INTEGER,
      tag_id INTEGER,
      PRIMARY KEY (game_id, tag_id),
      FOREIGN KEY (game_id) REFERENCES Game(game_id),
      FOREIGN KEY (tag_id) REFERENCES Tag(tag_id)
    );

    CREATE TABLE IF NOT EXISTS Achievement (
      achievement_id INTEGER PRIMARY KEY,
      game_id INTEGER,
      achievement_title TEXT,
      achievement_description TEXT,
      FOREIGN KEY (game_id) REFERENCES Game(game_id)
    );

    CREATE TABLE IF NOT EXISTS User_to_Game (
      user_id INTEGER,
      game_id INTEGER,
      completion_degree INTEGER,
      play_time INTEGER,
      PRIMARY KEY (user_id, game_id),
      FOREIGN KEY (user_id) REFERENCES User(id),
      FOREIGN KEY (game_id) REFERENCES Game(game_id)
    );

    CREATE TABLE IF NOT EXISTS User_to_Achievement (
      user_id INTEGER,
      achievement_id INTEGER,
      PRIMARY KEY (user_id, achievement_id),
      FOREIGN KEY (user_id) REFERENCES User(id),
      FOREIGN KEY (achievement_id) REFERENCES Achievement(achievement_id)
    );
  `);

  console.log('Database initialized and tables created (if not existing).');
}

// Function to insert a user
export async function insertUser(steamID: string, vanity: string): Promise<number | null> {
    // Check if the user already exists
    const existingUser = await db.get('SELECT id FROM User WHERE steamID = ?', [steamID]);
  
    if (existingUser) {
      console.log(`User with steamID ${steamID} already exists.`);
      return null; // Return null if the user already exists
    }
  
    // Insert the new user
    const result = await db.run('INSERT INTO User (vanity, steamID) VALUES (?, ?)', [vanity, steamID]);
    return result.lastID!;
}



// Function to fetch all users
export async function getUsers(): Promise<any[]> {
  return await db.all('SELECT * FROM User');
}

export async function getUserIdBySteamID(steamID: string): Promise<number | null> {
  const user = await db.get('SELECT id FROM User WHERE steamID = ?', [steamID]);

  if (user) {
    return user.id; // Return the user ID if found
  } else {
    console.log(`No user found with steamID ${steamID}.`);
    return null; // Return null if no user is found
  }
}

export async function getUserGames(user_id: number): Promise<any[]> {
  const query = `
    SELECT 
      User_to_Game.user_id,
      User_to_Game.game_id,
      User_to_Game.completion_degree,
      User_to_Game.play_time,
      Game.game_title,
      Game.estimated_time_to_beat,
      Game.has_single_player
    FROM 
      User_to_Game
    INNER JOIN 
      Game
    ON 
      User_to_Game.game_id = Game.game_id
    WHERE 
      User_to_Game.user_id = ?
  `;

  const result = await db.all(query, [user_id]);
  return result;
}

// Function to insert a game
export async function insertGame(game_id: number, game_title: string, has_single_player: boolean, estimated_time_to_beat: number): Promise<void> {
    // Check if the game already exists
    const existingGame = await db.get('SELECT game_id FROM Game WHERE game_id = ?', [game_id]);
  
    if (existingGame) {
      console.log(`Game with game_id ${game_id} already exists.`);
      return; // Exit if the game already exists
    }
  
    // Insert the new game
    await db.run('INSERT INTO Game (game_id, game_title, has_single_player, estimated_time_to_beat) VALUES (?, ?, ?, ?)', [
      game_id,
      game_title,
      has_single_player,
      estimated_time_to_beat
    ]);
  
    console.log(`Game with game_id ${game_id} inserted successfully.`);
}

export async function doesUserExist(steamID: string): Promise<boolean> {
  const user = await db.get('SELECT id FROM User WHERE steamID = ?', [steamID]);
  return !!user; // Return true if user exists, false otherwise
}

export async function insertUserToGame(
  user_id: number,
  game_id: number,
  completion_degree: number,
  play_time: number,
): Promise<void> {
  // Check if the entry already exists
  const existingEntry = await db.get(
    'SELECT * FROM User_to_Game WHERE user_id = ? AND game_id = ?',
    [user_id, game_id]
  );

  if (existingEntry) {
    console.log(`Entry for user_id ${user_id} and game_id ${game_id} already exists.`);
    return; // Exit if the entry already exists
  }

  // Insert the new entry
  await db.run(
    'INSERT INTO User_to_Game (user_id, game_id, completion_degree, play_time) VALUES (?, ?, ?, ?)',
    [user_id, game_id, completion_degree, play_time]
  );

  console.log(`Entry for user_id ${user_id} and game_id ${game_id} inserted successfully.`);
}

// Function to fetch all games
export async function getGames(): Promise<any[]> {
  return await db.all('SELECT * FROM Game');
}

// Close the database connection
export async function closeDatabase() {
  await db.close();
  console.log('Database connection closed.');
}