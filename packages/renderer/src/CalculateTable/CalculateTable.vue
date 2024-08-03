<template>
  <a-space direction="vertical">
    <a-flex
      gap="small"
      align="center"
    >
      <span> 公司： </span>
      <a-select
        v-model:value="company"
        style="flex: 1"
        placeholder="请选择公司"
      >
        <a-select-option value="捷锦">捷锦</a-select-option>
      </a-select>
    </a-flex>

    <UploadFiles @change="handleUploadChange" />
    <ModifyCalculation
      :files="files"
      @generate-file="handleGenerateFile"
    />
  </a-space>
</template>
<script lang="ts" setup>
import ModifyCalculation from '../components/ModifyCalculation.vue';
import UploadFiles from '../components/UploadFiles.vue';
import {generateCalculateFile} from '#preload';
import {message} from 'ant-design-vue';
import {ref} from 'vue';

const company = ref<string>('捷锦');

let files = ref<Record<string, string>>({});
async function handleUploadChange(uploads: Record<string, string>) {
  files.value = JSON.parse(JSON.stringify(uploads));
}

async function handleGenerateFile() {
  message.loading('生成中');
  try {
    await generateCalculateFile(JSON.parse(JSON.stringify(files.value)));
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
