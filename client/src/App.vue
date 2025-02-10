<template>
  <div class="app">
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/files">Files</router-link> |
      <router-link to="/remote">Remote Desktop</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useSocketStore } from './stores/socket';

const socketStore = useSocketStore();

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
</style>
