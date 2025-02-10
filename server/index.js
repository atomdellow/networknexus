const express = require('express');
const { Server } = require('socket.io');
const { exec } = require('child_process');
const screenshot = require('screenshot-desktop');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const robot = require('robotjs');
const app = express();
const server = require('http').createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

let screenInterval;

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('start-screen-share', () => {
    screenInterval = setInterval(async () => {
      try {
        const img = await screenshot();
        socket.emit('screen-data', `data:image/png;base64,${img.toString('base64')}`);
      } catch (err) {
        console.error('Screenshot error:', err);
      }
    }, 1000);
  });

  socket.on('stop-screen-share', () => {
    if (screenInterval) {
      clearInterval(screenInterval);
    }
  });

  socket.on('execute-command', (command) => {
    exec(command, (error, stdout, stderr) => {
      socket.emit('command-output', error ? stderr : stdout);
    });
  });

  socket.on('list-files', async (dirPath) => {
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

  socket.on('upload-file', async (data) => {
    try {
      const filePath = path.join(data.path, data.name);
      await fs.writeFile(filePath, Buffer.from(data.content));
      socket.emit('upload-complete');
    } catch (err) {
      socket.emit('error', err.message);
    }
  });

  socket.on('create-folder', async (data) => {
    try {
      const folderPath = path.join(data.path, data.name);
      await fs.mkdir(folderPath);
      socket.emit('folder-created');
    } catch (err) {
      socket.emit('error', err.message);
    }
  });

  socket.on('delete-item', async (itemPath) => {
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

  socket.on('mouse-move', (data) => {
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

  socket.on('mouse-click', (data) => {
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

  socket.on('mouse-wheel', (delta) => {
    try {
      robot.scrollMouse(0, delta);
    } catch (error) {
      console.error('Mouse wheel error:', error);
    }
  });

  socket.on('key-press', (data) => {
    const { key, modifier } = data;
    if (modifier) {
      robot.keyToggle(modifier, 'down');
    }
    robot.keyTap(key);
    if (modifier) {
      robot.keyToggle(modifier, 'up');
    }
  });

  socket.on('disconnect', () => {
    if (screenInterval) {
      clearInterval(screenInterval);
    }
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
