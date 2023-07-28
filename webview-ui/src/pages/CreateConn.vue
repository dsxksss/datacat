<script setup lang="ts">
import { PostOptions, ReceiveOptions } from "../command/options";
import { vscode } from "../utilities/vscode";
import { $t, i18n } from "../locales";
import { NInput, NInputNumber, NSelect, useNotification } from "naive-ui";
import { ref } from "vue";

const notification = useNotification()
const connectionName = ref("新建连接");
const database = ref("employees");
const username = ref("root");
const password = ref("root");
const host = ref("localhost");
const port = ref(3306);
const dialect = ref("mysql");
const loading = ref(false);

const dialectOptions = [
    {
        label: "Mysql",
        value: "mysql",
        disabled: true
    },
    {
        label: "Postgreql",
        value: "postgresql",
    },
    {
        label: "Mongodb",
        value: "mongodb",
    },
    {
        label: "Sqlite",
        value: "sqlite",
    },
    {
        label: "Redis",
        value: "redis",
    },
]

function createConnection() {
    loading.value = true;
    vscode.sendMsgToExtension(
        PostOptions.createConnection, {
        connectionName: connectionName.value,
        database: database.value,
        username: username.value,
        password: password.value,
        host: host.value,
        port: port.value,
        dialect: dialect.value
    });
}

function clearConnection() {
    vscode.sendMsgToExtension(PostOptions.clearConnectionEvent);
}

function changeLang() {
    notification.success({
        title: "切换语言成功",
        duration: 1500,
        keepAliveOnHover: true,
    });
    i18n.global.locale.value = i18n.global.locale.value == "zh-CN" ? "en" : "zh-CN";
}

window.addEventListener('message', event => {
    const result = event.data;
    const { command, message } = result
    console.log("CreateConn.vue get message", result);
    switch (command) {
        case ReceiveOptions.dbConnection:
            loading.value = false;
            break;
        case ReceiveOptions.error:
            notification.error({
                title: "创建连接时发生了点错误",
                content: message,
                duration: 3500,
                keepAliveOnHover: true,
            });
            loading.value = false;
            break;
    }
});

</script>

<template>
    <main class=" space-y-5">
        <div>{{ $t("connName") }}:
            <n-input v-model:value="connectionName" />
        </div>
        <div>{{ $t("dbName") }}:
            <n-input v-model:value="database" />
        </div>
        <div>{{ $t("dbConnUser") }}:
            <n-input v-model:value="username" />
        </div>
        <div>{{ $t("connPwd") }}:
            <n-input v-model:value="password" />
        </div>
        <div>{{ $t("host") }}:
            <n-input v-model:value="host" />
        </div>
        <div>{{ $t("port") }}:
            <n-input-number v-model:value="port" />
        </div>

        <div>
            {{ $t("dialect") }}:
            <!-- <select v-model="dialect" class="select select-bordered w-full max-w-xs">
                <option v-for="dialectOption in dialectOptions" :value="dialectOption">{{ dialectOption }}</option>
            </select> -->
            <n-select v-model:value="dialect" :options="dialectOptions" />
        </div>

        <button class="btn" @click="createConnection" :disabled="loading">
            {{ $t("creatNewConn") }}</button>
        <button class="btn" @click="clearConnection" :disabled="loading">
            {{ $t("clearConn") }}</button>

        <button class="btn" @click="changeLang">
            切换语言</button>

    </main>
</template>