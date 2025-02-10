import { defineStore } from 'pinia';
import { useSocketStore } from './socket';
import { useNotificationStore } from './notification';

export const useFileStore = defineStore('files', {
  state: () => ({
    currentDirectory: null,
    selectedFile: null,
    transfers: new Map(), // Tracks ongoing transfers
    chunkSize: 1024 * 1024, // 1MB chunks
  }),

  actions: {
    async listFiles(path) {
      const socketStore = useSocketStore();
      return new Promise((resolve) => {
        socketStore.socket.emit('list-files', path);
        socketStore.socket.once('files-list', (files) => {
          resolve(files);
        });
      });
    },

    async uploadFile(path, file) {
      const socketStore = useSocketStore();
      const notificationStore = useNotificationStore();
      const transferId = Date.now().toString();
      
      this.transfers.set(transferId, {
        name: file.name,
        size: file.size,
        transferred: 0,
        status: 'uploading',
        progress: 0
      });

      try {
        const chunks = Math.ceil(file.size / this.chunkSize);
        
        for (let i = 0; i < chunks; i++) {
          const start = i * this.chunkSize;
          const end = Math.min(start + this.chunkSize, file.size);
          const chunk = file.slice(start, end);
          
          const buffer = await chunk.arrayBuffer();
          await socketStore.sendEncrypted('upload-chunk', {
            transferId,
            path,
            name: file.name,
            chunk: Buffer.from(buffer).toString('base64'),
            index: i,
            total: chunks
          });

          const transfer = this.transfers.get(transferId);
          transfer.transferred += chunk.size;
          transfer.progress = (transfer.transferred / transfer.size) * 100;
          this.transfers.set(transferId, { ...transfer });
        }

        this.transfers.get(transferId).status = 'completed';
        notificationStore.success(`Upload complete: ${file.name}`);
      } catch (error) {
        this.transfers.get(transferId).status = 'failed';
        notificationStore.error(`Upload failed: ${file.name}`);
        throw error;
      }
    },

    async createFolder(path, name) {
      const socketStore = useSocketStore();
      return new Promise((resolve) => {
        socketStore.socket.emit('create-folder', { path, name });
        socketStore.socket.once('folder-created', resolve);
      });
    },

    async deleteItem(path) {
      const socketStore = useSocketStore();
      return new Promise((resolve) => {
        socketStore.socket.emit('delete-item', path);
        socketStore.socket.once('item-deleted', resolve);
      });
    }
  }
});
