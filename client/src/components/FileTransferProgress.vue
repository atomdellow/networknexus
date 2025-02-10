<template>
  <div class="transfer-progress">
    <div v-for="transfer in transfers" :key="transfer.id" class="transfer-item">
      <div class="transfer-info">
        <span class="filename">{{ transfer.name }}</span>
        <span class="status" :class="transfer.status">{{ transfer.status }}</span>
      </div>
      <div class="progress-bar">
        <div 
          class="progress-fill"
          :style="{ width: `${transfer.progress}%` }"
          :class="transfer.status"
        ></div>
      </div>
      <div class="transfer-stats">
        {{ formatBytes(transfer.transferred) }} / {{ formatBytes(transfer.size) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useFileStore } from '../stores/files';

const fileStore = useFileStore();

const transfers = computed(() => {
  return Array.from(fileStore.transfers.entries())
    .map(([id, transfer]) => ({ id, ...transfer }))
    .filter(t => t.status !== 'completed' || Date.now() - t.id < 5000);
});

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}
</script>

<style scoped>
.transfer-progress {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 300px;
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  z-index: 1000;
}

.transfer-item {
  margin-bottom: 10px;
}

.transfer-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.status {
  font-size: 0.8em;
}

.status.uploading { color: #2196F3; }
.status.completed { color: #4CAF50; }
.status.failed { color: #f44336; }

.progress-bar {
  height: 4px;
  background: #eee;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #2196F3;
  transition: width 0.3s ease;
}

.progress-fill.completed { background: #4CAF50; }
.progress-fill.failed { background: #f44336; }

.transfer-stats {
  font-size: 0.8em;
  color: #666;
  text-align: right;
  margin-top: 2px;
}
</style>
