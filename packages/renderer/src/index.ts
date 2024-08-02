import {createApp} from 'vue';
import Antd from 'ant-design-vue';
import App from '/@/App.vue';
import 'ant-design-vue/dist/reset.css';

import {createMemoryHistory, createRouter} from 'vue-router';

import CreateCertificates from './CreateCertificates.vue';
import CalculateTable from './CalculateTable/CalculateTable.vue';

const routes = [
  {path: '/create-certificates', component: CreateCertificates},
  {path: '/calculate-table', component: CalculateTable},
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

createApp(App).use(router).use(Antd).mount('#app');
