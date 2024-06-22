<template>
  <a-space direction="vertical">
    <UploadFiles @change="handleUploadChange" />
    <GenerateOutboundFile @generate-outbound-file="handleGenerateOutboundFile" />
  </a-space>
</template>
<script lang="ts" setup>
import GenerateOutboundFile from './components/GenerateOutboundFile.vue';
import UploadFiles from './components/UploadFiles.vue';
import {generateOutboundFile} from '#preload';
import {message} from 'ant-design-vue';

let files: Record<string, string> = {};
async function handleUploadChange(uploads: Record<string, string>) {
  files = uploads;
}

async function handleGenerateOutboundFile() {
  if (!files.bills) {
    message.error('请先上传全量发票查询导出结果');
    return;
  }

  if (!files.calculate) {
    message.error('请先上传测算表');
    return;
  }

  message.loading('生成中');
  await generateOutboundFile(files);
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
  margin: 60px auto;
  max-width: 700px;
}

fieldset {
  margin: 2rem;
  padding: 1rem;
}
</style>
