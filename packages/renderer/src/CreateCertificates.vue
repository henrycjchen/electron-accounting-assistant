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
  try {
    await generateOutboundFile(JSON.parse(JSON.stringify(files.value)));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    message.error(e.message.match(/Error: ([^:]*)$/)?.[1] ?? e.message);
    return;
  }
  message.destroy();
  message.success('生成完成');
}
</script>
<style></style>
