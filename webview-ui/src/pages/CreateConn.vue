<script setup lang="ts">
import { PostOptions, ReceiveOptions } from "../command/options";
import { vscode } from "../utilities/vscode";
import { $t, i18n } from "../locales"
import { ref } from "vue";

const connectionName = ref("新建连接");
const database = ref("employees");
const username = ref("root");
const password = ref("root");
const host = ref("localhost");
const port = ref(3306);
const dialect = ref("mysql");
const loading = ref(false);

const dialectOptions = [
    "mysql",
    "postgresql",
    "mongodb",
    "sqlite",
    "redis",
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
    i18n.global.locale.value = i18n.global.locale.value == "zh-CN" ? "en" : "zh-CN";
}

window.addEventListener('message', event => {
    const result = event.data;
    const { command } = result
    console.log("CreateConn.vue get message", result);
    switch (command) {
        case ReceiveOptions.dbConnection:
            loading.value = false;
            break;
    }
});

</script>

<template>
    <main class=" space-y-5">
        <div>{{ $t("connName") }}:
            <input class="font-bold text-sm input input-bordered input-md w-full max-w-xs" type="text"
                v-model="connectionName">
        </div>
        <div>{{ $t("dbName") }}:
            <input class="font-bold text-sm input input-bordered input-md w-full max-w-xs" type="text" v-model="database">
        </div>
        <div>{{ $t("dbConnUser") }}:
            <input class="font-bold text-sm input input-bordered input-md w-full max-w-xs" type="text" v-model="username">
        </div>
        <div>{{ $t("connPwd") }}:
            <input class="font-bold text-sm input input-bordered input-md w-full max-w-xs" type="text" v-model="password">
        </div>
        <div>{{ $t("host") }}:
            <input class="font-bold text-sm input input-bordered input-md w-full max-w-xs" type="text" v-model="host">
        </div>
        <div>{{ $t("port") }}:
            <input class="font-bold text-sm input input-bordered input-md w-full max-w-xs" type="number" v-model="port">
        </div>

        <div>
            {{ $t("dialect") }}:<select v-model="dialect" class="select select-bordered w-full max-w-xs">
                <option v-for="dialectOption in dialectOptions" :value="dialectOption">{{ dialectOption }}</option>
            </select>
        </div>

        <button class="btn" @click="createConnection" :disabled="loading">
            {{ $t("creatNewConn") }}</button>
        <button class="btn" @click="clearConnection" :disabled="loading">
            {{ $t("clearConn") }}</button>

        <button class="btn" @click="changeLang">
            切换语言</button>

    </main>
</template>