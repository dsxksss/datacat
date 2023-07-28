<script setup lang="ts">
import { ReceiveOptions } from "./command/options";
import { useRouter } from "vue-router"
import { ref, provide } from "vue";
import { darkTheme, NConfigProvider, NNotificationProvider } from 'naive-ui'
import "./index.css";

const router = useRouter()
const theme = ref("dark");
provide("theme", theme);

window.addEventListener('message', event => {
  const result = event.data;
  const { command, message } = result
  console.log("App.vue get message", result);

  switch (command) {
    case ReceiveOptions.setPage:
      router.push(message.path);
      break;
  }
});

</script>


<template>
  <n-config-provider :theme="darkTheme">
    <n-notification-provider>
      <RouterView />
    </n-notification-provider>
  </n-config-provider>
</template>