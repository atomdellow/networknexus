import { defineStore } from 'pinia';
import { useSocketStore } from './socket';

export const useFileStore = defineStore('files', {
  state: () => ({
    currentDirectory: null,
    selectedFile: null
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
      const reader = new FileReader();
      
      return new Promise((resolve) => {
        reader.onload = () => {
          socketStore.socket.emit('upload-file', {
            path,
            name: file.name,
            content: reader.result
          });
          socketStore.socket.once('upload-complete', resolve);
        };
        reader.readAsArrayBuffer(file);
      });
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
