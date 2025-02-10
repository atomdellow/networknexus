<template>
  <div class="remote-desktop">
    <div class="controls">
      <button @click="startRemote" :disabled="isConnected">Connect</button>
      <button @click="stopRemote" :disabled="!isConnected">Disconnect</button>
    </div>
    
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
import { ref, computed } from 'vue';
import { useSocketStore } from '../stores/socket';

const socketStore = useSocketStore();
const command = ref('');

const screenData = computed(() => socketStore.screenStream);
const commandOutput = computed(() => socketStore.commandOutput);
const isConnected = computed(() => socketStore.connected);

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
};

const handleMouseDown = (event) => {
  if (!isConnected.value) return;
  const button = event.button === 0 ? 'left' : 
                event.button === 2 ? 'right' : 
                event.button === 1 ? 'middle' : 'left';
  
  socketStore.sendMouseClick(button, event.detail === 2);
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
</style>
