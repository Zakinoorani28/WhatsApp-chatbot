import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import { processMessage } from './chain.js';
import { initRAG } from './rag.js';

// Map of Promise chains per phone number for concurrency queue protection
const userQueues = new Map();

/**
 * Enqueues message processing for a user phone number to prevent race conditions
 */
function enqueueUserMessage(phone, task) {
  const previousTask = userQueues.get(phone) || Promise.resolve();
  const nextTask = previousTask.then(task).catch(() => {});
  userQueues.set(phone, nextTask);
  return nextTask;
}

/**
 * Main Baileys WhatsApp Connection Handler
 */
async function startBot() {
  // 1. Call initRAG() and wait for completion
  await initRAG();
  console.log('RAG pipeline initialized ✓');

  // 2. Load auth credentials
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

  // 3. Get latest Baileys version
  const { version } = await fetchLatestBaileysVersion();

  // 4. Create socket
  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['AI Season Bot', 'Chrome', '1.0.0'],
  });

  // Save credentials on update
  sock.ev.on('creds.update', saveCreds);

  // 5. Handle connection updates
  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('\n📱 Scan this QR code with WhatsApp:\n');
      qrcode.generate(qr, { small: true });
      console.log('\nWhatsApp → Settings → Linked Devices → Link a Device\n');
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        startBot();
      } else {
        console.log('Logged out. Delete auth_info_baileys/ and restart.');
      }
    }

    if (connection === 'open') {
      console.log('✅ WhatsApp connected! Bot is ready.');
      console.log('Send a message to start chatting.\n');
    }
  });

  // Handle incoming messages
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    const msg = messages[0];
    if (!msg || !msg.message) return;
    if (msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const isGroup = sender.endsWith('@g.us');
    if (isGroup) return;

    const phone = sender.replace('@s.whatsapp.net', '');
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      '';

    if (!text.trim()) return;

    console.log(`📩 [${phone}]: ${text}`);

    // Queue protection: Process one message at a time per phone number
    enqueueUserMessage(phone, async () => {
      await sock.sendPresenceUpdate('composing', sender);

      try {
        const response = await processMessage(phone, text);
        await sock.sendMessage(sender, { text: response });
        console.log(`📤 Bot replied to ${phone}`);
      } catch (error) {
        console.error('Message handling error:', error);
        await sock.sendMessage(sender, {
          text: 'Sorry, I ran into an issue. Please try again!',
        });
      } finally {
        await sock.sendPresenceUpdate('paused', sender);
      }
    });
  });
}

startBot().catch(console.error);
