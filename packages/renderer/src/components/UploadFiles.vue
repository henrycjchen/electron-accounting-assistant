<template>
  <a-space>
    <a-space direction="vertical">
      出库发票
      <a-upload
        name="avatar"
        list-type="picture-card"
        class="avatar-uploader"
        :show-upload-list="false"
        action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
        accept=".xlsx, .xls"
        @change="(e: UploadChangeParam) => handleChange(e, 'outboundInvoices')"
      >
        <a-space
          direction="vertical"
          :style="{
            fontSize: '12px',
            padding: '10px',
          }"
        >
          <template v-if="uploadFlag.outboundInvoices">
            <FileDoneOutlined :style="{fontSize: '30px', color: 'green'}"></FileDoneOutlined>
            {{ uploadFlag.outboundInvoices }}
          </template>
          <template v-else>
            <plus-outlined :style="{fontSize: '30px', color: 'gray'}"></plus-outlined>
          </template>
        </a-space>
      </a-upload>
    </a-space>
    <a-space direction="vertical">
      测算表
      <a-upload
        name="avatar"
        list-type="picture-card"
        class="avatar-uploader"
        :show-upload-list="false"
        action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
        accept=".xlsx, .xls"
        @change="(e: UploadChangeParam) => handleChange(e, 'calculate')"
      >
        <a-space
          direction="vertical"
          :style="{
            fontSize: '12px',
            padding: '10px',
          }"
        >
          <template v-if="uploadFlag.calculate">
            <FileDoneOutlined :style="{fontSize: '30px', color: 'green'}"></FileDoneOutlined>
            {{ uploadFlag.calculate }}
          </template>
          <template v-else>
            <plus-outlined :style="{fontSize: '30px', color: 'gray'}"></plus-outlined>
          </template>
        </a-space>
      </a-upload>
    </a-space>
    <a-space direction="vertical">
      购进发票
      <a-upload
        name="avatar"
        list-type="picture-card"
        class="avatar-uploader"
        :show-upload-list="false"
        action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
        accept=".xlsx, .xls"
        @change="(e: UploadChangeParam) => handleChange(e, 'receivingInvoices')"
      >
        <a-space
          direction="vertical"
          :style="{
            fontSize: '12px',
            padding: '10px',
          }"
        >
          <template v-if="uploadFlag.receivingInvoices">
            <FileDoneOutlined :style="{fontSize: '30px', color: 'green'}"></FileDoneOutlined>
            {{ uploadFlag.receivingInvoices }}
          </template>
          <template v-else>
            <plus-outlined :style="{fontSize: '30px', color: 'gray'}"></plus-outlined>
          </template>
        </a-space>
      </a-upload>
    </a-space>
  </a-space>
</template>
<script lang="ts" setup>
import {ref, defineEmits} from 'vue';
import {PlusOutlined, FileDoneOutlined} from '@ant-design/icons-vue';
import type {UploadChangeParam} from 'ant-design-vue';
const emit = defineEmits(['change']);
const files: Record<string, string> = {};
const uploadFlag = ref<Record<string, string>>({outboundInvoices: '', receivingInvoices: '', calculate: ''});

const handleChange = (info: UploadChangeParam, type: string) => {
  uploadFlag.value[type] = info.file.originFileObj?.name || '';
  if (uploadFlag.value[type]) {
    addFile({
      path: info.file.originFileObj!.path,
      type,
    });
  }
};

function addFile(file: {path: string; type: string}) {
  if (files[file.type]) {
    files[file.type] = file.path;
  } else {
    files[file.type] = file.path;
  }
  emit('change', files);
}
</script>
<style scoped></style>
