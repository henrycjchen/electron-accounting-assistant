<template>
  <a-space direction="vertical">
    <a-button
      type="primary"
      :disabled="requireFiles.length"
      @click="handleClick"
    >
      修改测算表
    </a-button>
    <a-typography-text
      v-if="requireFiles.length"
      type="warning"
    >
      提示：请上传{{ requireFiles.join(', ') }}
    </a-typography-text>
  </a-space>
</template>

<script lang="ts" setup>
import {computed} from 'vue';
import {defineEmits, defineProps} from 'vue';
const emit = defineEmits(['generateFile']);
const props = defineProps({
  files: {
    type: Object,
    required: true,
  },
});

const requireFiles = computed(() => {
  console.log('props.files', props.files);
  const result: string[] = [];
  // if (!props.files.outboundInvoices) {
  //   result.push('出库发票');
  // }
  // if (!props.files.calculate) {
  //   result.push('测算表');
  // }
  // if (!props.files.receivingInvoices) {
  //   result.push('购进发票');
  // }
  return result;
});

async function handleClick() {
  emit('generateFile');
}
</script>
