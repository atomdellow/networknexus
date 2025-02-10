import { defineStore } from 'pinia';
import { io } from 'socket.io-client';
import { encrypt, decrypt } from '../../../shared/encryption';
import { useSettingsStore } from './settings';

export const useSocketStore = defineStore('socket', {
  state: () => ({
    socket: null,
    connected: false,
    screenStream: null,
    commandOutput: '',
    serverIP: localStorage.getItem('serverIP') || 'localhost',
    serverPort: localStorage.getItem('serverPort') || '3000',
    stats: {
      bandwidth: 0,
      latency: 0,
      fps: 0,
      lastFrameTime: 0
    }
  }),

  actions: {
    connect(ip = null, port = null) {
      if (ip) {
        this.serverIP = ip;
        localStorage.setItem('serverIP', ip);
      }
      if (port) {
        this.serverPort = port;
        localStorage.setItem('serverPort', port);
      }

      // Disconnect existing connection if any
      if (this.socket) {
        this.socket.disconnect();
      }

      const serverUrl = `http://${this.serverIP}:${this.serverPort}`;
      console.log(`Attempting to connect to: ${serverUrl}`);

      this.socket = io(serverUrl, {
        timeout: 5000,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection failed:', error);
        // You can emit this to your notification system
      });

      this.socket.on('connect', () => {
        this.connected = true;
      });

      this.socket.on('disconnect', () => {
        this.connected = false;
      });

      this.socket.on('screen-data', (imageData) => {
        this.screenStream = imageData;
      });

      this.socket.on('command-output', (output) => {
        this.commandOutput = output;
      });
    },

    // Method to try connecting to a specific IP
    async tryConnect(ip) {
      return new Promise((resolve) => {
        const testSocket = io(`http://${ip}:${this.serverPort}`, {
          timeout: 1000,
          reconnection: false
        });

        testSocket.on('connect', () => {
          testSocket.disconnect();
          this.connect(ip);
          resolve(true);
        });

        testSocket.on('connect_error', () => {
          testSocket.disconnect();
          resolve(false);
        });
      });
    },

    // Optional: Method to scan local network
    async scanNetwork() {
      const baseIP = '192.168.1.'; // Adjust based on your network
      const promises = [];
      
      for (let i = 1; i <= 254; i++) {
        promises.push(this.tryConnect(`${baseIP}${i}`));
      }

      return Promise.race(promises);
    },

    requestScreenShare() {
      this.socket.emit('start-screen-share');
    },

    stopScreenShare() {
      this.socket.emit('stop-screen-share');
    },

    async sendEncrypted(event, data) {
      if (!this.socket || !this.connected) return;
      const encrypted = encrypt(data, this.authStore.password);
      return new Promise((resolve) => {
        this.socket.emit(event, encrypted);
        this.socket.once(event + '-response', (encryptedResponse) => {
          const decrypted = decrypt(encryptedResponse, this.authStore.password);
          resolve(decrypted);
        });
      });
    },

    // Update existing methods to use encryption
    executeCommand(command) {
      return this.sendEncrypted('execute-command', command);
    },

    sendMouseMove(x, y) {
      return this.sendEncrypted('mouse-move', { x, y });
    },

    sendMouseClick(button = 'left', double = false) {
      this.socket.emit('mouse-click', { button, double });
    },

    sendKeyPress(key, modifier = null) {
      this.socket.emit('key-press', { key, modifier });
    },
    
    sendMouseWheel(delta) {
      this.socket.emit('mouse-wheel', delta);
    },

    updateScreenSettings() {
      const settingsStore = useSettingsStore();
      if (this.socket && this.connected) {
        this.socket.emit('update-screen-settings', {
          quality: settingsStore.screenQuality,
          frameRate: settingsStore.frameRate,
          compression: settingsStore.compression,
          scaleRatio: settingsStore.scaleRatio
        });
      }
    },

    updateStats(imageSize) {
      const now = performance.now();
      const timeDiff = now - this.stats.lastFrameTime;
      
      this.stats.fps = Math.round(1000 / timeDiff);
      this.stats.bandwidth = Math.round((imageSize / 1024) * this.stats.fps);
      this.stats.lastFrameTime = now;
    }
  }
});
