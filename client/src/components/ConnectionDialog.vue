<template>
  <div class="connection-dialog">
    <h3>Connect to Remote PC</h3>
    <div class="form-group">
      <input 
        v-model="ip" 
        placeholder="Server IP (e.g., 192.168.1.100)"
        :class="{ error: connectionError }">
      <input 
        v-model="port" 
        placeholder="Port (default: 3000)">
    </div>
    <div class="form-group">
      <input 
        v-model="password"
        type="password"
        placeholder="Server Password"
        :class="{ error: authError }">
    </div>
    <div class="actions">
      <button @click="connect">Connect</button>
      <button @click="scanNetwork" :disabled="scanning">
        {{ scanning ? 'Scanning...' : 'Scan Network' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useSocketStore } from '../stores/socket';
import { useNotificationStore } from '../stores/notification';
import { useAuthStore } from '../stores/auth';

const socketStore = useSocketStore();
const notificationStore = useNotificationStore();
const authStore = useAuthStore();

const ip = ref(socketStore.serverIP);
const port = ref(socketStore.serverPort);
const password = ref(authStore.password);
const scanning = ref(false);
const connectionError = ref(false);
const authError = ref(false);

async function connect() {
  try {
    await socketStore.connect(ip.value, port.value);
    if (await authStore.authenticate(password.value)) {
      connectionError.value = false;
      authError.value = false;
      notificationStore.success('Connected successfully!');
    } else {
      authError.value = true;
      notificationStore.error('Authentication failed');
    }
  } catch (error) {
    connectionError.value = true;
    notificationStore.error('Connection failed');
  }
}

async function scanNetwork() {
  scanning.value = true;
  try {
    const found = await socketStore.scanNetwork();
    if (!found) {
      notificationStore.error('No server found on network');
    }
  } finally {
    scanning.value = false;
  }
}
</script>

<style scoped>
.connection-dialog {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-group {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

input {
  padding: 8px;
}

input.error {
  border-color: red;
}

.actions {
  display: flex;
  gap: 10px;
}
</style>
