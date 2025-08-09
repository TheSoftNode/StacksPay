import { MongoClient, Db } from 'mongodb';

class MongoDB {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  async connect(): Promise<Db> {
    if (this.db) {
      return this.db;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    this.client = new MongoClient(uri);
    await this.client.connect();
    
    this.db = this.client.db(process.env.MONGODB_DB_NAME || 'sbtc_gateway');
    return this.db;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }
}

export const mongodb = new MongoDB();
export default mongodb;
