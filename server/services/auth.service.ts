import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs/promises';
import path from 'path';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
];

const TOKEN_PATH = path.join(process.cwd(), 'data', 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'config', 'credentials.json');

export class AuthService {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.oauth2Client.on('tokens', (tokens) => {
        if (tokens.refresh_token) {
          console.log('Received new refresh token:', tokens.refresh_token);
        }
        console.log('Access token updated.');
      });
  }

  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
    });
  }

  async getTokenFromCode(code: string): Promise<void> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    await this.saveTokens(tokens);
  }

  async loadSavedTokens(): Promise<boolean> {
    try {
      const content = await fs.readFile(TOKEN_PATH, 'utf-8');
      const tokens = JSON.parse(content);
      if (Object.keys(tokens).length === 0) {
        return false;
      }
      this.oauth2Client.setCredentials(tokens);
      return true;
    } catch (error) {
      return false;
    }
  }

  private isTokenExpired(tokens: any): boolean {
    if (!tokens.expiry_date) return true;
    return Date.now() >= tokens.expiry_date - 60000; // 60s buffer
  }

  private async saveTokens(tokens: any): Promise<void> {
    try {
        await fs.mkdir(path.dirname(TOKEN_PATH), { recursive: true });
        await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2));
        console.log('✅ Tokens saved successfully');
      } catch (error) {
        console.error('❌ Failed to save tokens:', error);
      }
  }

  async getClient(): Promise<OAuth2Client> {
    if (!await this.loadSavedTokens()) {
        throw new Error('User not authenticated. Please run authentication process.');
    }

    const tokens = this.oauth2Client.credentials;
    if (this.isTokenExpired(tokens)) {
        console.log('Access token expired, refreshing...');
        try {
            const { credentials } = await this.oauth2Client.refreshAccessToken();
            this.oauth2Client.setCredentials(credentials);
            await this.saveTokens(credentials);
            console.log('✅ Token refreshed successfully');
        } catch (error) {
            console.error('❌ Failed to refresh token:', error);
            await this.clearTokens();
            throw new Error('Token refresh failed. Please re-authenticate.');
        }
    }

    return this.oauth2Client;
  }

  async clearTokens(): Promise<void> {
    try {
      await fs.unlink(TOKEN_PATH);
      console.log('✅ Tokens cleared');
    } catch (error) {
      // It's okay if the file doesn't exist.
    }
  }
}
