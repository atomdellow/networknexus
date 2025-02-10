import { defineStore } from 'pinia';
import { useSocketStore } from './socket';
import { useNotificationStore } from './notification';

export const useClipboardStore = defineStore('clipboard', {
  state: () => ({
    lastSyncedContent: null,
    syncEnabled: true
  }),

  actions: {
    async initClipboardSync() {
      const socketStore = useSocketStore();
      const notificationStore = useNotificationStore();

      // Listen for clipboard changes from remote
      socketStore.socket.on('clipboard-update', async (content) => {
        if (this.syncEnabled && content !== this.lastSyncedContent) {
          try {
            await navigator.clipboard.writeText(content);
            this.lastSyncedContent = content;
          } catch (error) {
            notificationStore.error('Failed to update clipboard');
          }
        }
      });

      // Monitor local clipboard
      document.addEventListener('copy', async (event) => {
        if (this.syncEnabled) {
          const text = await navigator.clipboard.readText();
          if (text !== this.lastSyncedContent) {
            this.lastSyncedContent = text;
            socketStore.sendEncrypted('clipboard-update', text);
          }
        }
      });

      // Handle paste events
      document.addEventListener('paste', async (event) => {
        if (this.syncEnabled) {
          const text = await navigator.clipboard.readText();
          if (text !== this.lastSyncedContent) {
            this.lastSyncedContent = text;
            socketStore.sendEncrypted('clipboard-update', text);
          }
        }
      });
    },

    toggleSync() {
      this.syncEnabled = !this.syncEnabled;
      const notificationStore = useNotificationStore();
      notificationStore.info(
        this.syncEnabled ? 'Clipboard sync enabled' : 'Clipboard sync disabled'
      );
    }
  }
});
