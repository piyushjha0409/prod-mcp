import { SlackService } from './services/slack.service';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testSlackIntegration() {
  console.log('🧪 Testing Slack Integration...\n');

  try {
    // Test Slack service initialization
    console.log('1. Initializing Slack Service...');
    const slackService = new SlackService();
    console.log('✅ Slack Service initialized successfully\n');

    // Test connection
    console.log('2. Testing Slack connection...');
    const isConnected = await slackService.testConnection();
    if (isConnected) {
      console.log('✅ Slack connection successful\n');
    } else {
      console.log('❌ Slack connection failed\n');
      return;
    }

    // Test getting channels
    console.log('3. Fetching Slack channels...');
    const channels = await slackService.getChannels();
    console.log(`✅ Found ${channels.length} channels:`);
    channels.slice(0, 5).forEach(channel => {
      console.log(`   - #${channel.name} (${channel.id})`);
    });
    if (channels.length > 5) {
      console.log(`   ... and ${channels.length - 5} more`);
    }
    console.log('');

    // Test getting users
    console.log('4. Fetching Slack users...');
    const users = await slackService.getUsers();
    console.log(`✅ Found ${users.length} users:`);
    users.slice(0, 5).forEach(user => {
      console.log(`   - ${user.real_name} (@${user.name})`);
    });
    if (users.length > 5) {
      console.log(`   ... and ${users.length - 5} more`);
    }
    console.log('');

    // Test sending a message (optional - uncomment to test)
    // console.log('5. Testing message sending...');
    // const testChannel = channels.find(c => c.name === 'general') || channels[0];
    // if (testChannel) {
    //   const result = await slackService.sendMessage({
    //     channel: testChannel.id,
    //     text: '🧪 Test message from Productivity Assistant!'
    //   });
    //   console.log('✅ Test message sent successfully');
    //   console.log('   Message timestamp:', result.ts);
    // } else {
    //   console.log('⚠️  No suitable channel found for testing');
    // }

    console.log('🎉 Slack integration test completed successfully!');

  } catch (error: any) {
    console.error('❌ Slack integration test failed:', error.message);
    
    if (error.message.includes('SLACK_BOT_TOKEN is required')) {
      console.log('\n💡 Make sure to set SLACK_BOT_TOKEN in your .env.local file');
    } else if (error.message.includes('invalid_auth')) {
      console.log('\n💡 Check that your SLACK_BOT_TOKEN is valid and the bot is installed in your workspace');
    } else if (error.message.includes('not_authed')) {
      console.log('\n💡 The bot needs to be installed in your workspace with proper permissions');
    }
  }
}

// Run the test
testSlackIntegration().catch(console.error);
