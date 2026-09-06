// db.js — a small file-based data store.
// Swap this for PostgreSQL/MySQL later without changing much else:
// every function here just needs to become a real query.

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'db.json');

function load() {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    const seed = {
      users: [],
      modules: [
        {
          id: 1,
          title: 'Sending Money by Bank Transfer',
          description: 'How to safely send money to family using your bank app or USSD code.',
          steps: [
            'Open your bank app or dial your bank\'s USSD code (e.g. *901# for GTBank).',
            'Choose "Transfer" or "Send Money".',
            'Enter the receiver\'s account number and select their bank.',
            'Double-check the name that appears before confirming — it should match who you intend to send to.',
            'Enter the amount and your PIN to complete the transfer.',
            'Take a screenshot or note the confirmation message as proof of payment.'
          ]
        },
        {
          id: 2,
          title: 'Using WhatsApp Safely',
          description: 'Stay in touch with family while avoiding common WhatsApp scams.',
          steps: [
            'Only add contacts you know personally — be cautious of unknown numbers messaging you first.',
            'Never share OTP (One-Time Password) codes with anyone, even if they say they are your bank.',
            'Be suspicious of messages asking for money urgently, even from a "relative" — call them directly to confirm.',
            'Turn on two-step verification in WhatsApp Settings > Account > Two-step verification.',
            'If a message feels wrong, ask a trusted family member before responding.'
          ]
        },
        {
          id: 3,
          title: 'Spotting Scam Messages',
          description: 'Learn the common warning signs of a scam text, call, or message.',
          steps: [
            'Be alert to messages saying you\'ve "won" a prize you never entered for.',
            'Real banks and organizations never ask for your PIN, password, or OTP by phone or SMS.',
            'Watch for pressure to act "immediately" — scammers rush you so you don\'t think it through.',
            'Check the sender\'s number carefully — scammers often use numbers that look similar to real ones.',
            'When unsure, hang up or ignore the message, then call the organization directly using a number you already trust.'
          ]
        },
        {
          id: 4,
          title: 'Making Video Calls to Family',
          description: 'Set up and use video calls to stay connected with family abroad or in another city.',
          steps: [
            'Open WhatsApp and find the contact you want to call.',
            'Tap the video camera icon at the top of the chat.',
            'Wait for them to answer — make sure you have good internet or WiFi connection first.',
            'Hold your phone at eye level so they can see your face clearly.',
            'Tap the red button to end the call when you\'re done.'
          ]
        },
        {
          id: 5,
          title: 'Using USSD Codes',
          description: 'Understand what USSD codes are and how to use them without internet.',
          steps: [
            'USSD codes start with * and end with # (e.g. *737# for GTBank).',
            'Dial the code like a phone number, then press call.',
            'Follow the on-screen menu by replying with the number of your choice.',
            'USSD works without internet, but standard call charges from your network may apply.',
            'Keep your PIN private — never share it even if the menu asks you to "confirm" it to someone else.'
          ]
        }
      ],
      progress: [] // { userId, moduleId, completedAt }
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2));
    return seed;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function save(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

module.exports = { load, save };
