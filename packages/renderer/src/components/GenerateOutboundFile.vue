<template>
  <a-button
    type="primary"
    @click="handleClick"
  >
    生成（出库凭证/入库凭证）
  </a-button>
</template>

<script lang="ts" setup>
import {defineEmits} from 'vue';
const emit = defineEmits(['generateOutboundFile']);

async function handleClick() {
  emit('generateOutboundFile');
}
</script>
