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
      new_column INTEGER,
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

// Function to insert a game
export async function insertGame(game_id: number, game_title: string, has_single_player: boolean): Promise<void> {
    // Check if the game already exists
    const existingGame = await db.get('SELECT game_id FROM Game WHERE game_id = ?', [game_id]);
  
    if (existingGame) {
      console.log(`Game with game_id ${game_id} already exists.`);
      return; // Exit if the game already exists
    }
  
    // Insert the new game
    await db.run('INSERT INTO Game (game_id, game_title, has_single_player) VALUES (?, ?, ?)', [
      game_id,
      game_title,
      has_single_player,
    ]);
  
    console.log(`Game with game_id ${game_id} inserted successfully.`);
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