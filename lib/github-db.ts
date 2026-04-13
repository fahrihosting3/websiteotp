import { Octokit } from '@octokit/rest';

interface UserData {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

class GitHubDB {
  private octokit: Octokit | null = null;
  private owner: string = '';
  private repo: string = '';
  private branch: string = 'main';
  private dataPath: string = 'data/users';

  constructor() {
    this.initializeOctokit();
  }

  private initializeOctokit() {
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;

    if (!token || !owner || !repo) {
      console.warn('[GitHubDB] Missing GitHub credentials. Falling back to localStorage.');
      return;
    }

    this.octokit = new Octokit({ auth: token });
    this.owner = owner;
    this.repo = repo;
  }

  async saveUser(user: UserData): Promise<void> {
    if (!this.octokit) {
      this.saveTolocalStorage(user);
      return;
    }

    try {
      const filePath = `${this.dataPath}/${user.id}.json`;
      const fileContent = Buffer.from(JSON.stringify(user, null, 2)).toString('base64');

      // Check if file exists
      let sha: string | undefined;
      try {
        const response = await this.octokit.repos.getContent({
          owner: this.owner,
          repo: this.repo,
          path: filePath,
          ref: this.branch,
        });
        if (response.data && typeof response.data === 'object' && 'sha' in response.data) {
          sha = response.data.sha;
        }
      } catch (error) {
        // File doesn't exist yet, which is fine
      }

      // Create or update file
      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path: filePath,
        message: `Save user data: ${user.username}`,
        content: fileContent,
        branch: this.branch,
        ...(sha && { sha }),
      });

      console.log('[GitHubDB] User saved to GitHub:', user.id);
    } catch (error) {
      console.error('[GitHubDB] Error saving user to GitHub:', error);
      this.saveTolocalStorage(user);
    }
  }

  async getUser(userId: string): Promise<UserData | null> {
    if (!this.octokit) {
      return this.getFromLocalStorage(userId);
    }

    try {
      const filePath = `${this.dataPath}/${userId}.json`;
      const response = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: filePath,
        ref: this.branch,
      });

      if (response.data && typeof response.data === 'object' && 'content' in response.data) {
        const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
        return JSON.parse(content);
      }
      return null;
    } catch (error) {
      console.error('[GitHubDB] Error fetching user from GitHub:', error);
      return this.getFromLocalStorage(userId);
    }
  }

  async getUserByEmail(email: string): Promise<UserData | null> {
    if (!this.octokit) {
      return this.getFromLocalStorageByEmail(email);
    }

    try {
      const response = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: this.dataPath,
        ref: this.branch,
      });

      if (Array.isArray(response.data)) {
        for (const file of response.data) {
          if (file.type === 'file' && file.name?.endsWith('.json')) {
            const fileResponse = await this.octokit.repos.getContent({
              owner: this.owner,
              repo: this.repo,
              path: file.path,
              ref: this.branch,
            });

            if (
              fileResponse.data &&
              typeof fileResponse.data === 'object' &&
              'content' in fileResponse.data
            ) {
              const content = Buffer.from(fileResponse.data.content, 'base64').toString('utf-8');
              const user: UserData = JSON.parse(content);
              if (user.email === email) {
                return user;
              }
            }
          }
        }
      }
      return null;
    } catch (error) {
      console.error('[GitHubDB] Error searching user by email:', error);
      return this.getFromLocalStorageByEmail(email);
    }
  }

  async deleteUser(userId: string): Promise<void> {
    if (!this.octokit) {
      this.deleteFromLocalStorage(userId);
      return;
    }

    try {
      const filePath = `${this.dataPath}/${userId}.json`;
      const response = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: filePath,
        ref: this.branch,
      });

      if (response.data && typeof response.data === 'object' && 'sha' in response.data) {
        await this.octokit.repos.deleteFile({
          owner: this.owner,
          repo: this.repo,
          path: filePath,
          message: `Delete user: ${userId}`,
          sha: response.data.sha,
          branch: this.branch,
        });
      }
    } catch (error) {
      console.error('[GitHubDB] Error deleting user from GitHub:', error);
      this.deleteFromLocalStorage(userId);
    }
  }

  // localStorage fallback methods
  private saveTolocalStorage(user: UserData): void {
    if (typeof window !== 'undefined') {
      const users = this.getAllFromLocalStorage();
      users[user.id] = user;
      localStorage.setItem('ruma-users', JSON.stringify(users));
    }
  }

  private getFromLocalStorage(userId: string): UserData | null {
    if (typeof window !== 'undefined') {
      const users = JSON.parse(localStorage.getItem('ruma-users') || '{}');
      return users[userId] || null;
    }
    return null;
  }

  private getFromLocalStorageByEmail(email: string): UserData | null {
    if (typeof window !== 'undefined') {
      const users = JSON.parse(localStorage.getItem('ruma-users') || '{}');
      for (const user of Object.values(users)) {
        if ((user as UserData).email === email) {
          return user as UserData;
        }
      }
    }
    return null;
  }

  private deleteFromLocalStorage(userId: string): void {
    if (typeof window !== 'undefined') {
      const users = this.getAllFromLocalStorage();
      delete users[userId];
      localStorage.setItem('ruma-users', JSON.stringify(users));
    }
  }

  private getAllFromLocalStorage(): Record<string, UserData> {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('ruma-users') || '{}');
    }
    return {};
  }
}

export const gitHubDB = new GitHubDB();
export type { UserData };
