const express = require('express');
const { Server } = require('socket.io');
const { exec } = require('child_process');
const screenshot = require('screenshot-desktop');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const robot = require('robotjs');
const crypto = require('crypto');
const { encrypt, decrypt } = require('../shared/encryption');
const clipboard = require('clipboardy');
const sharp = require('sharp');
const https = require('https');
const totp = require('otplib').totp;
const app = express();

const SSL_OPTIONS = {
  key: fs.readFileSync(path.join(__dirname, 'config/ssl/server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'config/ssl/server.crt'))
};

const server = https.createServer(SSL_OPTIONS, app);

const SERVER_PASSWORD = process.env.SERVER_PASSWORD || 'your-secure-password';
const authenticatedSockets = new Set();

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

let screenInterval;
const activeSessions = new Map();

io.on('connection', (socket) => {
  console.log('Client connected, awaiting authentication');
  
  socket.on('authenticate', async ({ password, totpToken }) => {
    if (password === SERVER_PASSWORD && totp.verify(totpToken, process.env.TOTP_SECRET)) {
      const sessionId = crypto.randomBytes(32).toString('hex');
      activeSessions.set(socket.id, {
        sessionId,
        lastActivity: Date.now(),
        ip: socket.handshake.address
      });
      
      socket.emit('auth-result', true);
      console.log('Client authenticated with 2FA');
    } else {
      socket.emit('auth-result', false);
      console.log('Authentication failed');
    }
  });

  const requireAuth = (event, handler) => {
    socket.on(event, async (encryptedData) => {
      if (!authenticatedSockets.has(socket.id)) {
        socket.emit('error', 'Authentication required');
        return;
      }
      try {
        const data = decrypt(encryptedData, SERVER_PASSWORD);
        const result = await handler(data);
        if (result !== undefined) {
          socket.emit(event + '-response', encrypt(result, SERVER_PASSWORD));
        }
      } catch (error) {
        socket.emit('error', 'Encryption error');
      }
    });
  };

  let screenSettings = {
    quality: 'medium',
    frameRate: 30,
    compression: 70,
    scaleRatio: 1.0
  };

  requireAuth('update-screen-settings', (settings) => {
    screenSettings = { ...screenSettings, ...settings };
    if (screenInterval) {
      clearInterval(screenInterval);
      startScreenShare();
    }
  });

  let lastFrameTime = Date.now();
  let frameCount = 0;
  
  async function captureAndProcessScreen() {
    try {
      const startTime = Date.now();
      const img = await screenshot();
      let processedImage = sharp(img);

      // Apply optimizations based on settings
      if (screenSettings.scaleRatio !== 1.0) {
        const metadata = await processedImage.metadata();
        processedImage = processedImage.resize(
          Math.round(metadata.width * screenSettings.scaleRatio),
          Math.round(metadata.height * screenSettings.scaleRatio)
        );
      }

      // Optimize based on quality setting
      const quality = screenSettings.quality === 'low' ? 60 :
                     screenSettings.quality === 'medium' ? 80 : 100;

      processedImage = processedImage.jpeg({
        quality,
        progressive: true,
        optimizeScans: true,
        chromaSubsampling: screenSettings.quality === 'low' ? '4:2:0' : '4:4:4'
      });

      // Calculate performance metrics
      const buffer = await processedImage.toBuffer();
      const processingTime = Date.now() - startTime;
      frameCount++;

      if (Date.now() - lastFrameTime >= 1000) {
        socket.emit('performance-metrics', {
          fps: frameCount,
          processingTime,
          dataSize: buffer.length
        });
        frameCount = 0;
        lastFrameTime = Date.now();
      }

      const encryptedImage = encrypt(buffer.toString('base64'), SERVER_PASSWORD);
      socket.emit('screen-data', encryptedImage);
    } catch (err) {
      console.error('Screenshot error:', err);
    }
  }

  function startScreenShare() {
    screenInterval = setInterval(
      captureAndProcessScreen,
      1000 / screenSettings.frameRate
    );
  }

  requireAuth('start-screen-share', () => {
    startScreenShare();
  });

  requireAuth('stop-screen-share', () => {
    if (screenInterval) {
      clearInterval(screenInterval);
    }
  });

  requireAuth('execute-command', (command) => {
    exec(command, (error, stdout, stderr) => {
      socket.emit('command-output', error ? stderr : stdout);
    });
  });

  requireAuth('list-files', async (dirPath) => {
    try {
      const files = await fs.readdir(dirPath);
      const fileList = await Promise.all(files.map(async (file) => {
        const fullPath = path.join(dirPath, file);
        const stats = await fs.stat(fullPath);
        return {
          name: file,
          path: fullPath,
          isDirectory: stats.isDirectory(),
          size: stats.size,
          modified: stats.mtime
        };
      }));
      socket.emit('files-list', fileList);
    } catch (err) {
      socket.emit('error', err.message);
    }
  });

  requireAuth('upload-file', async (data) => {
    try {
      const filePath = path.join(data.path, data.name);
      await fs.writeFile(filePath, Buffer.from(data.content));
      socket.emit('upload-complete');
    } catch (err) {
      socket.emit('error', err.message);
    }
  });

  requireAuth('create-folder', async (data) => {
    try {
      const folderPath = path.join(data.path, data.name);
      await fs.mkdir(folderPath);
      socket.emit('folder-created');
    } catch (err) {
      socket.emit('error', err.message);
    }
  });

  requireAuth('delete-item', async (itemPath) => {
    try {
      const stats = await fs.stat(itemPath);
      if (stats.isDirectory()) {
        await fs.rmdir(itemPath, { recursive: true });
      } else {
        await fs.unlink(itemPath);
      }
      socket.emit('item-deleted');
    } catch (err) {
      socket.emit('error', err.message);
    }
  });

  requireAuth('mouse-move', (data) => {
    try {
      const { x, y } = data;
      const currentMouse = robot.getMousePos();
      
      // Smooth movement by calculating steps
      const steps = 2;
      const deltaX = (x - currentMouse.x) / steps;
      const deltaY = (y - currentMouse.y) / steps;
      
      for (let i = 1; i <= steps; i++) {
        const stepX = Math.round(currentMouse.x + deltaX * i);
        const stepY = Math.round(currentMouse.y + deltaY * i);
        robot.moveMouse(stepX, stepY);
      }
    } catch (error) {
      console.error('Mouse move error:', error);
    }
  });

  requireAuth('mouse-click', (data) => {
    try {
      const { button, double } = data;
      if (double) {
        robot.mouseClick(button, true);
      } else {
        robot.mouseClick(button);
      }
    } catch (error) {
      console.error('Mouse click error:', error);
    }
  });

  requireAuth('mouse-wheel', (delta) => {
    try {
      robot.scrollMouse(0, delta);
    } catch (error) {
      console.error('Mouse wheel error:', error);
    }
  });

  requireAuth('key-press', (data) => {
    const { key, modifier } = data;
    if (modifier) {
      robot.keyToggle(modifier, 'down');
    }
    robot.keyTap(key);
    if (modifier) {
      robot.keyToggle(modifier, 'up');
    }
  });

  const transfers = new Map();

  requireAuth('upload-chunk', async (data) => {
    const { transferId, path: filePath, name, chunk, index, total } = data;
    
    try {
      if (!transfers.has(transferId)) {
        transfers.set(transferId, {
          chunks: new Array(total).fill(null),
          path: path.join(filePath, name)
        });
      }

      const transfer = transfers.get(transferId);
      transfer.chunks[index] = Buffer.from(chunk, 'base64');

      // Check if transfer is complete
      if (!transfer.chunks.includes(null)) {
        const finalBuffer = Buffer.concat(transfer.chunks);
        await fs.writeFile(transfer.path, finalBuffer);
        transfers.delete(transferId);
        socket.emit('transfer-complete', { transferId });
      } else {
        socket.emit('transfer-progress', {
          transferId,
          progress: (transfer.chunks.filter(Boolean).length / total) * 100
        });
      }
    } catch (error) {
      socket.emit('transfer-error', { transferId, error: error.message });
    }
  });

  requireAuth('clipboard-update', async (content) => {
    try {
      await clipboard.write(content);
      // Broadcast to all other connected clients
      socket.broadcast.emit('clipboard-update', content);
    } catch (error) {
      socket.emit('error', 'Failed to update clipboard');
    }
  });

  // Monitor server clipboard changes
  let lastClipboardContent = '';
  const clipboardInterval = setInterval(async () => {
    try {
      const content = await clipboard.read();
      if (content !== lastClipboardContent) {
        lastClipboardContent = content;
        socket.emit('clipboard-update', content);
      }
    } catch (error) {
      console.error('Clipboard read error:', error);
    }
  }, 1000);

  // Add session timeout checker
  const activityCheck = setInterval(() => {
    const session = activeSessions.get(socket.id);
    if (session && Date.now() - session.lastActivity > 30 * 60 * 1000) { // 30 minutes
      socket.emit('session-timeout');
      socket.disconnect();
    }
  }, 60000); // Check every minute

  socket.on('activity', () => {
    const session = activeSessions.get(socket.id);
    if (session) {
      session.lastActivity = Date.now();
    }
  });

  socket.on('disconnect', () => {
    clearInterval(activityCheck);
    authenticatedSockets.delete(socket.id);
    if (screenInterval) {
      clearInterval(screenInterval);
    }
    clearInterval(clipboardInterval);
    activeSessions.delete(socket.id);
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
