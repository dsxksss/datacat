<script setup lang="ts" >
import { useRouter } from "vue-router"
import { ReceiveOptions } from "../command/options";
import { ref } from "vue";

const router = useRouter()
const extensionResult = ref("对方还没有回应");

window.addEventListener('message', event => {
    const result = event.data;
    const { command, message } = result
    console.log("ConnWindow.vue get message", result);
    switch (command) {
        case ReceiveOptions.openConnWindow:
            extensionResult.value = message;
            break;
    }
});
</script>

<template>
    <h1>{{ $route.params.table }}</h1>
    <pre>{{ extensionResult }}</pre>
</template>