<template>
  <a-button
    type="primary"
    @click="handleClick"
  >
    生成出库凭证
  </a-button>
</template>

<script lang="ts" setup>
import {generateOutboundFile} from '#preload';
import {message} from 'ant-design-vue';

async function handleClick() {
    message.loading('生成中');
    await generateOutboundFile();
    message.success('生成完成');
}
</script>

