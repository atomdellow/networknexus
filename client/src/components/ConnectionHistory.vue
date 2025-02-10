<template>
  <div class="connection-history">
    <h3>Connection History</h3>
    <div class="history-list">
      <div v-for="conn in history" 
           :key="conn.timestamp" 
           class="history-item">
        <div class="history-details">
          <span class="timestamp">{{ formatDate(conn.timestamp) }}</span>
          <span class="ip">{{ conn.ip }}</span>
          <span :class="['status', conn.success ? 'success' : 'failed']">
            {{ conn.success ? 'Success' : 'Failed' }}
          </span>
        </div>
      </div>
    </div>
    <button @click="clearHistory" 
            class="clear-button" 
            v-if="history.length">
      Clear History
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthEnhancedStore } from '../stores/auth-enhanced';

const authStore = useAuthEnhancedStore();
const history = computed(() => authStore.connectionHistory);

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString();
}

function clearHistory() {
  authStore.clearConnectionHistory();
}
</script>

<style scoped>
.connection-history {
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 20px;
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  padding: 8px;
  border-bottom: 1px solid #eee;
}

.history-details {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr;
  gap: 10px;
}

.timestamp {
  color: #666;
}

.status.success {
  color: #4CAF50;
}

.status.failed {
  color: #f44336;
}

.clear-button {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
