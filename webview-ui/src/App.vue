<script setup lang="ts">
import { PostOptions } from "./command/options";
import { vscode } from "./utilities/vscode";
import { ref } from "vue";

const connectionName = ref("新建连接");
const database = ref("employees");
const username = ref("root");
const password = ref("root");
const host = ref("localhost");
const port = ref(3306);
const dialect = ref("mysql");
const loading = ref(false);
const result = ref("对方还没有回应");

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
  result.value = "对方还没有回应";
}

window.addEventListener('message', event => {
  const result = event.data;
  console.log(result);
  result.value = result.message;
  loading.value = false;
});

</script>

<template>
  <main class=" space-y-5">
    <div>连接名称：
      <input class="font-bold text-sm input input-bordered input-md w-full max-w-xs" type="text" v-model="connectionName">
    </div>
    <div>数据库名称：
      <input class="font-bold text-sm input input-bordered input-md w-full max-w-xs" type="text" v-model="database">
    </div>
    <div>数据库用户名：
      <input class="font-bold text-sm input input-bordered input-md w-full max-w-xs" type="text" v-model="username">
    </div>
    <div>数据库密码：
      <input class="font-bold text-sm input input-bordered input-md w-full max-w-xs" type="text" v-model="password">
    </div>
    <div>连接地址:
      <input class="font-bold text-sm input input-bordered input-md w-full max-w-xs" type="text" v-model="host">
    </div>
    <div>端口号:
      <input class="font-bold text-sm input input-bordered input-md w-full max-w-xs" type="number" v-model="port">
    </div>

    <div>
      请选择要连接的数据库类型:<select v-model="dialect" class="select select-bordered w-full max-w-xs">
        <option v-for="dialectOption in dialectOptions" :value="dialectOption">{{ dialectOption }}</option>
      </select>
    </div>

    <button class="btn" @click="createConnection" :disabled="loading">
      Create Connection</button>
    <button class="btn" @click="clearConnection" :disabled="loading">
      Clear Connection</button>
    <div>
      <pre>{{ result }}</pre>
    </div>

  </main>
</template>