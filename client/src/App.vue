<template>
  <div class="app">
    <div class="connection-status" :class="{ connected: isConnected }">
      {{ isConnected ? 'Connected' : 'Disconnected' }}
    </div>
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/files">Files</router-link> |
      <router-link to="/remote">Remote Desktop</router-link>
    </nav>
    <router-view></router-view>
    <Notifications />
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useSocketStore } from './stores/socket';
import Notifications from './components/Notifications.vue';

const socketStore = useSocketStore();
const isConnected = computed(() => socketStore.connected);

onMounted(() => {
  socketStore.connect();
});
</script>

<style>
.app {
  font-family: Arial, sans-serif;
  padding: 20px;
}

nav {
  padding: 20px 0;
}

nav a {
  margin: 0 10px;
  text-decoration: none;
  color: #2c3e50;
}

nav a.router-link-active {
  color: #42b983;
}

.connection-status {
  position: fixed;
  top: 10px;
  left: 10px;
  padding: 5px 10px;
  border-radius: 4px;
  background-color: #ff4444;
  color: white;
}

.connection-status.connected {
  background-color: #00C851;
}
</style>
