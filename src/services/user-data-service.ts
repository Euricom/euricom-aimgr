import { consola } from 'consola';
import fs from 'fs/promises';
import path from 'path';
import { UserData } from '../providers/base-provider';

export class UserDataService {
  private static readonly dataDir = path.join(process.cwd(), 'data');
  private static readonly dataFile = path.join(this.dataDir, 'userdata.json');

  /**
   * Merge user data from multiple providers
   */
  static merge(existingUsers: UserData[], newUsers: UserData[]): UserData[] {
    // Merge users by email
    const mergedUsers = new Map<string, UserData>();

    // First add existing users to the map
    existingUsers.forEach(user => {
      mergedUsers.set(user.email, user);
    });

    // Merge new users
    newUsers.forEach(newUser => {
      const existingUser = mergedUsers.get(newUser.email);
      if (existingUser) {
        // Merge providers arrays, avoiding duplicates
        const existingProviderNames = new Set(existingUser.providers.map(p => p.name));
        const newProviders = newUser.providers.filter(p => !existingProviderNames.has(p.name));
        existingUser.providers.push(...newProviders);
        mergedUsers.set(newUser.email, existingUser);
      } else {
        mergedUsers.set(newUser.email, newUser);
      }
    });

    return [...mergedUsers.values()];
  }

  /**
   * Save user data to file
   */
  static async save(users: UserData[]): Promise<void> {
    try {
      // Create data directory if it doesn't exist
      await fs.mkdir(UserDataService.dataDir, { recursive: true });

      await fs.writeFile(UserDataService.dataFile, JSON.stringify(users, undefined, 2), 'utf8');
    } catch (error) {
      consola.error('Error saving user data:', error);
      throw error;
    }
  }

  /**
   * Merge and save user data from multiple providers
   */
  static async mergeAndSave(newUsers: UserData[]): Promise<void> {
    try {
      const existingUsers = await this.load();
      const mergedUsers = this.merge(existingUsers, newUsers);
      await this.save(mergedUsers);
    } catch (error) {
      consola.error('Error in mergeAndSave:', error);
      throw error;
    }
  }

  /**
   * Load user data from file
   */
  static async load(): Promise<UserData[]> {
    try {
      const fileExists = await fs
        .access(UserDataService.dataFile)
        .then(() => true)
        .catch(() => false);

      if (!fileExists) {
        return [];
      }

      const data = await fs.readFile(UserDataService.dataFile, 'utf-8');
      return JSON.parse(data) as UserData[];
    } catch (error) {
      consola.error('Error loading user data:', error);
      return [];
    }
  }

  /**
   * Get filtered user data
   */
  static async getFilteredUsers(filter?: string): Promise<UserData[]> {
    const users = await this.load();
    if (!filter) {
      return users;
    }

    return users.filter(user => user.email.toLowerCase().includes(filter.toLowerCase()));
  }
}
