<script setup lang="ts" >
import { useRouter } from "vue-router"
const router = useRouter()
</script>

<template>
    {{ $route.params.table }}
</template>