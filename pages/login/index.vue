<template>
  <div>
    <h1>ログイン</h1>
    <div>
      <button @click="signIn">サインイン</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Auth } from 'aws-amplify';
const signIn = () => {
  Auth.federatedSignIn()
}
</script>
