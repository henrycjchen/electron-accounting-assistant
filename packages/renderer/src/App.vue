<template>
  <a-layout class="layout">
    <a-menu
      v-model:selectedKeys="selectedKeys"
      mode="horizontal"
      :style="{lineHeight: '64px'}"
    >
      <a-menu-item key="create-certificates">
        <RouterLink to="/create-certificates">创建凭证</RouterLink>
      </a-menu-item>
      <a-menu-item key="calculate-table">
        <RouterLink to="/calculate-table">测算表计算</RouterLink>
      </a-menu-item>
    </a-menu>
    <a-layout-content class="site-layout-content">
      <RouterView />
    </a-layout-content>
  </a-layout>
</template>
<script lang="ts" setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';
const selectedKeys = ref<string[]>(['create-certificates']);
const router = useRouter();
router.push('/create-certificates');
</script>
<style scoped>
.site-layout-content {
  min-height: 280px;
  padding: 24px;
  background: #fff;
}
#components-layout-demo-top .logo {
  float: left;
  width: 120px;
  height: 31px;
  margin: 16px 24px 16px 0;
  background: rgba(255, 255, 255, 0.3);
}
.ant-row-rtl #components-layout-demo-top .logo {
  float: right;
  margin: 16px 0 16px 24px;
}
</style>
