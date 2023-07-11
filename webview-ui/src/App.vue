<script setup lang="ts">
import { vscode } from "./utilities/vscode";
import { ref } from "vue";

const connectionName = ref("新建连接");
const database = ref("employees");
const username = ref("root");
const password = ref("root");
const host = ref("localhost");
const port = ref(3306);
const dialect = ref("");

const dialectOptions = [
  "mysql"
]

function handleHowdyClick() {
  vscode.postMessage({
    command: "hello",
    text: "Hey there partner! 🤠",
  });
}

function createConnection() {
  vscode.postMessage({
    command: "create-connection",
    connectionName: connectionName.value,
    database: database.value,
    username: username.value,
    password: password.value,
    host: host.value,
    port: port.value,
    dialect: dialect.value
  });

}
</script>

<template>
  <main class=" space-y-5">
    <button class="btn" @click="handleHowdyClick">Hello</button>
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

    <button class="btn" @click="createConnection">Create Connection</button>

  </main>
</template>