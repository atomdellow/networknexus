<template>
  <div class="remote-desktop">
    <div class="controls">
      <button @click="startRemote" :disabled="isConnected">Connect</button>
      <button @click="stopRemote" :disabled="!isConnected">Disconnect</button>
      <button @click="toggleClipboardSync" :class="{ active: clipboardEnabled }">
        {{ clipboardEnabled ? 'Disable' : 'Enable' }} Clipboard Sync
      </button>
    </div>
    <ScreenSettings />
    <PerformanceMonitor />
    <RecordingPlayer />
    <div class="screen-view" 
         @mousemove="handleMouseMove"
         @mousedown="handleMouseDown"
         @mouseup="handleMouseUp"
         @mouseleave="handleMouseLeave"
         @wheel="handleMouseWheel"
         tabindex="0">
      <img :src="screenData" v-if="screenData" />
      <div v-else>No screen data available</div>
    </div>

    <div class="command-console">
      <input v-model="command" @keyup.enter="sendCommand" placeholder="Enter command...">
      <pre>{{ commandOutput }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useSocketStore } from '../stores/socket';
import { useClipboardStore } from '../stores/clipboard';
import RecordingPlayer from '../components/RecordingPlayer.vue';
import { useRecordingStore } from '../stores/recording';
import PerformanceMonitor from '../components/PerformanceMonitor.vue';
import { usePerformanceStore } from '../stores/performance';

const socketStore = useSocketStore();
const clipboardStore = useClipboardStore();
const recordingStore = useRecordingStore();
const performanceStore = usePerformanceStore();
const command = ref('');

const screenData = computed(() => {
  const data = socketStore.screenStream;
  if (data) {
    // Calculate metrics
    const imageSize = (data.length * 3) / 4; // Base64 to binary size
    performanceStore.updateMetrics({
      bandwidth: imageSize / 1024, // KB
      fps: socketStore.stats.fps,
      latency: socketStore.stats.latency
    });
  }
  return data;
});

const commandOutput = computed(() => socketStore.commandOutput);
const isConnected = computed(() => socketStore.connected);
const clipboardEnabled = computed(() => clipboardStore.syncEnabled);

onMounted(() => {
  clipboardStore.initClipboardSync();
});

const startRemote = () => {
  socketStore.requestScreenShare();
};

const stopRemote = () => {
  socketStore.stopScreenShare();
};

const sendCommand = () => {
  if (command.value.trim()) {
    socketStore.executeCommand(command.value);
    command.value = '';
  }
};

const handleMouseMove = (event) => {
  if (!isConnected.value) return;
  
  const rect = event.target.getBoundingClientRect();
  const scaleX = screen.width / rect.width;
  const scaleY = screen.height / rect.height;
  
  const x = Math.round((event.clientX - rect.left) * scaleX);
  const y = Math.round((event.clientY - rect.top) * scaleY);
  
  socketStore.sendMouseMove(x, y);
  recordingStore.recordEvent('mouse-move', { x, y });
};

const handleMouseDown = (event) => {
  if (!isConnected.value) return;
  const button = event.button === 0 ? 'left' : 
                event.button === 2 ? 'right' : 
                event.button === 1 ? 'middle' : 'left';
  
  socketStore.sendMouseClick(button, event.detail === 2);
  recordingStore.recordEvent('mouse-click', { button, double: event.detail === 2 });
};

const handleMouseUp = () => {
  // Handle mouse up if needed
};

const handleMouseLeave = () => {
  // Optional: Handle mouse leaving the screen view
};

const handleMouseWheel = (event) => {
  if (!isConnected.value) return;
  socketStore.sendMouseWheel(event.deltaY > 0 ? 1 : -1);
};

const handleKeyDown = (event) => {
  if (!isConnected.value) return;
  
  const key = event.key.toLowerCase();
  const modifier = event.ctrlKey ? 'ctrl' : 
                  event.shiftKey ? 'shift' : 
                  event.altKey ? 'alt' : null;
                  
  socketStore.sendKeyPress(key, modifier);
  event.preventDefault();
};

const toggleClipboardSync = () => {
  clipboardStore.toggleSync();
};
</script>

<style scoped>
.remote-desktop {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.controls {
  display: flex;
  gap: 10px;
}

.screen-view {
  border: 1px solid #ccc;
  min-height: 400px;
  outline: none; /* Remove focus outline */
  user-select: none; /* Prevent text selection */
  cursor: crosshair;  /* Add this line for better cursor visibility */
}

.command-console {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.command-console input {
  padding: 8px;
}

.command-console pre {
  background: #f5f5f5;
  padding: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.active {
  background-color: #42b983;
  color: white;
}
</style>
