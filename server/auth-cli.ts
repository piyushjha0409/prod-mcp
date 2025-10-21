import { AuthService } from './services/auth.service';
import readline from 'readline';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function authenticate() {
  const authService = new AuthService();

  // Check if already authenticated
  try {
    await authService.getClient();
    console.log('✅ Already authenticated!');
    console.log('✅ Tokens are valid.');
    return;
  } catch (error) {
    console.log('❌ Not authenticated or tokens expired. Starting authentication process...');
  }

  // Generate auth URL
  const authUrl = authService.getAuthUrl();
  console.log('\n🔐 Authorize this app by visiting this URL:\n');
  console.log(authUrl);
  console.log('\n');

  // Get authorization code from user
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code = await new Promise<string>((resolve) => {
    rl.question('Enter the code from that page here: ', (answer) => {
      rl.close();
      resolve(answer);
    });
  });

  // Exchange code for tokens
  try {
    await authService.getTokenFromCode(code);
    console.log('✅ Authentication complete!');
  } catch (error) {
    console.error('❌ Failed to get token from code.', error);
  }
}

authenticate().catch(console.error);
