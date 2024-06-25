<template>
  <a-space direction="vertical">
    <UploadFiles @change="handleUploadChange" />
    <GenerateOutboundFile
      :files="files"
      @generate-outbound-file="handleGenerateOutboundFile"
    />
  </a-space>
</template>
<script lang="ts" setup>
import GenerateOutboundFile from './components/GenerateOutboundFile.vue';
import UploadFiles from './components/UploadFiles.vue';
import {generateOutboundFile} from '#preload';
import {message} from 'ant-design-vue';
import {ref} from 'vue';

let files = ref<Record<string, string>>({});
async function handleUploadChange(uploads: Record<string, string>) {
  files.value = JSON.parse(JSON.stringify(uploads));
}

async function handleGenerateOutboundFile() {
  message.loading('生成中');
  await generateOutboundFile(JSON.parse(JSON.stringify(files.value)));
  message.destroy();
  message.success('生成完成');
}
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  max-width: 700px;
}
body {
  padding: 60px;
}

fieldset {
  margin: 2rem;
  padding: 1rem;
}
</style>
