<template>
  <a-space direction="vertical">
    <a-button
      type="primary"
      :disabled="!outputFiles.length"
      @click="handleClick"
    >
      生成
    </a-button>
    <a-typography-text v-if="outputFiles.length">
      生成内容：{{ outputFiles.join('/') }}
    </a-typography-text>
    <a-typography-text
      v-else
      type="warning"
    >
      提示：请至少上传《出库发票》
    </a-typography-text>
  </a-space>
</template>

<script lang="ts" setup>
import {computed} from 'vue';
import {defineEmits, defineProps} from 'vue';
const emit = defineEmits(['generateOutboundFile']);
const props = defineProps({
  files: {
    type: Object,
    required: true,
  },
});
const outputFiles = computed(() => {
  const result: string[] = [];
  if (props.files.outboundInvoices) {
    result.push('出库凭证');
  } else {
    return result;
  }
  if (props.files.calculate) {
    result.push('入库凭证', '领料单');
  } else {
    return result;
  }
  if (props.files.inboundInvoices) {
    result.push('收料单');
  }
  return result;
});

async function handleClick() {
  emit('generateOutboundFile');
}
</script>
