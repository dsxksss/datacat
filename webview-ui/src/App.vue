<script setup lang="ts">
import { ReceiveOptions } from "./command/options";
import { useRouter } from "vue-router"
import { ref, provide } from "vue";
import "./index.css";

const router = useRouter()
const theme = ref("dark");
provide("theme", theme);

window.addEventListener('message', event => {
  const result = event.data;
  const { command, message } = result
  console.log("app.vue get message",result);

  switch (command) {
    case ReceiveOptions.setPage:
      router.push(message.path);
      break;
  }

});

</script>


<template>
  <main :data-theme="theme">
    <RouterView />
  </main>
</template>