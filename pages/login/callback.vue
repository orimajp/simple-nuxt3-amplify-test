<template>
  <div>
    ログイン中…
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
onMounted(() => {
  router.replace('/')
})
</script>

