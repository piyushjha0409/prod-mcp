import { NLPService } from './services/nlp.service';
import readline from 'readline';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testNLP() {
  const nlpService = new NLPService();

  console.log('🧠 NLP Service Test');
  console.log('Type natural language calendar requests (or "quit" to exit)\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askQuestion = () => {
    rl.question('> ', async (input) => {
      if (input.toLowerCase() === 'quit') {
        rl.close();
        return;
      }

      try {
        const result = await nlpService.parseEventIntent(input);
        console.log('\n📋 Parsed Intent:');
        console.log(JSON.stringify(result, null, 2));
        console.log('\n');
      } catch (error) {
        console.error('❌ Error:', error);
        console.log('\n');
      }

      askQuestion();
    });
  };

  askQuestion();
}

testNLP().catch(console.error);
