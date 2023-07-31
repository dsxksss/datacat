<script setup lang="ts" >
import { useRouter } from "vue-router"
import { ReceiveOptions } from "../command/options";
import type { DataTableColumns } from "naive-ui";
import { ref } from "vue";



const data = {
    "current_dept_emp": [
        {
            "COLUMN_NAME": "emp_no"
        },
        {
            "COLUMN_NAME": "dept_no"
        },
        {
            "COLUMN_NAME": "from_date"
        },
        {
            "COLUMN_NAME": "to_date"
        }
    ]
}

const router = useRouter()
const extensionResult = ref(data);



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
    <n-data-table />
</template>