import { WebClient } from '@slack/web-api';

export interface SlackStatus {
  status_text: string;
  status_emoji: string;
  status_expiration?: number; // Unix timestamp
}

export class SlackService {
  private client: WebClient;

  constructor(token: string) {
    this.client = new WebClient(token);
  }

  /**
   * Update user's Slack status
   */
  async updateStatus(status: SlackStatus): Promise<void> {
    try {
      await this.client.users.profile.set({
        profile: {
          status_text: status.status_text,
          status_emoji: status.status_emoji,
          status_expiration: status.status_expiration || 0,
        },
      });
      console.log(`✅ Slack status updated: ${status.status_text}`);
    } catch (error) {
      console.error('❌ Failed to update Slack status:', error);
      throw error;
    }
  }

  /**
   * Clear user's status
   */
  async clearStatus(): Promise<void> {
    await this.updateStatus({
      status_text: '',
      status_emoji: '',
    });
  }

  /**
   * Set Do Not Disturb
   */
  async setDND(minutes: number): Promise<void> {
    try {
      await this.client.dnd.setSnooze({
        num_minutes: minutes,
      });
      console.log(`✅ DND enabled for ${minutes} minutes`);
    } catch (error) {
      console.error('❌ Failed to set DND:', error);
      throw error;
    }
  }

  /**
   * End Do Not Disturb
   */
  async endDND(): Promise<void> {
    try {
      await this.client.dnd.endSnooze();
      console.log('✅ DND disabled');
    } catch (error) {
      console.error('❌ Failed to end DND:', error);
      throw error;
    }
  }

  /**
   * Send a DM to user
   */
  async sendDM(userId: string, message: string): Promise<void> {
    try {
      const result = await this.client.conversations.open({
        users: userId,
      });

      if (result.channel?.id) {
        await this.client.chat.postMessage({
          channel: result.channel.id,
          text: message,
        });
        console.log(`✅ DM sent to ${userId}`);
      }
    } catch (error) {
      console.error('❌ Failed to send DM:', error);
      throw error;
    }
  }

  /**
   * Post message to channel
   */
  async postMessage(channel: string, text: string, blocks?: any[]): Promise<void> {
    try {
      await this.client.chat.postMessage({
        channel,
        text,
        blocks,
      });
      console.log(`✅ Message posted to ${channel}`);
    } catch (error) {
      console.error('❌ Failed to post message:', error);
      throw error;
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser() {
    try {
      const result = await this.client.auth.test();
      return {
        userId: result.user_id,
        username: result.user,
        teamId: result.team_id,
      };
    } catch (error) {
      console.error('❌ Failed to get user info:', error);
      throw error;
    }
  }

  /**
   * Generate status based on calendar event
   */
  generateStatusForEvent(eventSummary: string, duration: number): SlackStatus {
    const emoji = this.selectEmojiForEvent(eventSummary);
    const expirationTime = Math.floor(Date.now() / 1000) + (duration * 60);

    return {
      status_text: `In meeting: ${this.truncate(eventSummary, 100)}`,
      status_emoji: emoji,
      status_expiration: expirationTime,
    };
  }

  private selectEmojiForEvent(summary: string): string {
    const lowerSummary = summary.toLowerCase();

    if (lowerSummary.includes('standup') || lowerSummary.includes('sync')) {
      return ':speaking_head_in_silhouette:';
    }
    if (lowerSummary.includes('1:1') || lowerSummary.includes('one-on-one')) {
      return ':handshake:';
    }
    if (lowerSummary.includes('review') || lowerSummary.includes('feedback')) {
      return ':memo:';
    }
    if (lowerSummary.includes('interview')) {
      return ':briefcase:';
    }
    if (lowerSummary.includes('focus') || lowerSummary.includes('deep work')) {
      return ':dart:';
    }

    return ':calendar:'; // default
  }

  private truncate(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
  }

  /**
   * Send message to channel
   */
  async sendMessage(options: { channel: string; text: string; blocks?: any[] }): Promise<any> {
    try {
      const result = await this.client.chat.postMessage({
        channel: options.channel,
        text: options.text,
        blocks: options.blocks,
      });
      console.log(`✅ Message sent to ${options.channel}`);
      return result;
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Get list of channels
   */
  async getChannels(): Promise<any[]> {
    try {
      const result = await this.client.conversations.list({
        types: 'public_channel,private_channel',
        exclude_archived: true,
      });
      return result.channels || [];
    } catch (error) {
      console.error('❌ Failed to get channels:', error);
      throw error;
    }
  }

  /**
   * Get list of users
   */
  async getUsers(): Promise<any[]> {
    try {
      const result = await this.client.users.list({});
      return result.members || [];
    } catch (error) {
      console.error('❌ Failed to get users:', error);
      throw error;
    }
  }

  /**
   * Send calendar notification to channel
   */
  async sendCalendarNotification(channel: string, event: any): Promise<any> {
    const startTime = new Date(event.start.dateTime);
    const endTime = new Date(event.end.dateTime);
    
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `📅 ${event.summary}`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Start:*\n${startTime.toLocaleString()}`,
          },
          {
            type: 'mrkdwn',
            text: `*End:*\n${endTime.toLocaleString()}`,
          },
        ],
      },
    ];

    if (event.location) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Location:* ${event.location}`,
        },
      });
    }

    if (event.description) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Description:*\n${event.description}`,
        },
      });
    }

    if (event.attendees && event.attendees.length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Attendees:*\n${event.attendees.map((a: any) => a.email).join(', ')}`,
        },
      });
    }

    return await this.sendMessage({
      channel,
      text: `📅 ${event.summary}`,
      blocks,
    });
  }

  /**
   * Send available time slots to channel
   */
  async sendAvailableSlots(channel: string, slots: any[]): Promise<any> {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🕐 Available Time Slots',
        },
      },
    ];

    slots.forEach((slot, index) => {
      const start = new Date(slot.start);
      const end = new Date(slot.end);
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${index + 1}.* ${start.toLocaleString()} - ${end.toLocaleString()} (${slot.duration} min)`,
        },
      });
    });

    return await this.sendMessage({
      channel,
      text: `Found ${slots.length} available time slots`,
      blocks,
    });
  }

  /**
   * Send upcoming events to channel
   */
  async sendUpcomingEvents(channel: string, events: any[]): Promise<any> {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `📅 Upcoming Events (${events.length})`,
        },
      },
    ];

    events.forEach((event) => {
      const start = new Date(event.start.dateTime);
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${event.summary}*\n⏰ ${start.toLocaleString()}${event.location ? `\n📍 ${event.location}` : ''}`,
        },
      });
    });

    return await this.sendMessage({
      channel,
      text: `${events.length} upcoming events`,
      blocks,
    });
  }

  /**
   * Test Slack connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.client.auth.test();
      console.log('✅ Slack connection test successful:', result.user);
      return true;
    } catch (error) {
      console.error('❌ Slack connection test failed:', error);
      return false;
    }
  }
}