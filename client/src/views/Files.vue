<template>
  <div class="files-view">
    <div class="path-navigator">
      <input v-model="currentPath" @keyup.enter="navigatePath">
      <button @click="navigateUp">↑ Up</button>
    </div>

    <div class="file-grid">
      <div v-for="item in fileList" 
           :key="item.path" 
           class="file-item"
           @click="handleFileClick(item)">
        <i :class="item.isDirectory ? 'folder-icon' : 'file-icon'"></i>
        <span>{{ item.name }}</span>
      </div>
    </div>

    <div class="file-operations">
      <input type="file" @change="handleFileUpload">
      <button @click="uploadFile">Upload</button>
      <button @click="createFolder">New Folder</button>
      <button @click="deleteSelected">Delete</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useFileStore } from '../stores/files';

const fileStore = useFileStore();
const currentPath = ref('C:/');
const selectedFile = ref(null);
const fileList = ref([]);

onMounted(async () => {
  await loadFiles();
});

async function loadFiles() {
  fileList.value = await fileStore.listFiles(currentPath.value);
}

function navigatePath() {
  loadFiles();
}

function navigateUp() {
  const parts = currentPath.value.split('/');
  parts.pop();
  currentPath.value = parts.join('/') || 'C:/';
  loadFiles();
}

function handleFileClick(item) {
  if (item.isDirectory) {
    currentPath.value = item.path;
    loadFiles();
  } else {
    selectedFile.value = item;
  }
}

async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    await fileStore.uploadFile(currentPath.value, file);
    loadFiles();
  }
}

async function createFolder() {
  const name = prompt('Enter folder name:');
  if (name) {
    await fileStore.createFolder(currentPath.value, name);
    loadFiles();
  }
}

async function deleteSelected() {
  if (selectedFile.value) {
    await fileStore.deleteItem(selectedFile.value.path);
    loadFiles();
  }
}
</script>

<style scoped>
.files-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.path-navigator {
  display: flex;
  gap: 10px;
}

.path-navigator input {
  flex: 1;
  padding: 8px;
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  padding: 20px;
  border: 1px solid #ccc;
}

.file-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 10px;
}

.file-item:hover {
  background: #f5f5f5;
}

.file-operations {
  display: flex;
  gap: 10px;
}
</style>
