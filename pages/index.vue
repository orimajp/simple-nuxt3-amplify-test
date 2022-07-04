<template>
  <div>
    <h1>トップ</h1>
    <div>
      <!--
      <button @click="signIn">サインイン</button>
      -->
      <button @click="signOut">サインアウト</button>
    </div>
    <!--
    <h2>API hello</h2>
    <div>
      <button @click="pushSayHello">Say hello!</button>
      <div>
        <span>{{ retText }}</span>
      </div>
    </div>
    -->
    <h2>Dog API</h2>
    <div>
      <button @click="getDogImage">Get Dog Image</button>
    </div>
    <div>
      <img :src="dogImageLink" />
    </div>
    <!--
    <h2>ページ遷移</h2>
    <div>
      <NuxtLink to="/sub">サブ</NuxtLink>
    </div>
    -->
  </div>
</template>

<script setup lang="ts">
import { Auth } from 'aws-amplify';

Auth.currentAuthenticatedUser()
.then(userData => console.log(userData))
.catch(() => console.log('Not singed in'))

// https://qiita.com/saki-engineering/items/b327f93fe7f027913bd7
const header = {
  headers: {
    Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
  }
}
/*
const retText = ref('')

const pushSayHello = async () => {
  retText.value = ''
  const {data: text} = await useFetch('/api/hello', {
    headers: {
      Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
    },
    initialCache: false,
  })
  retText.value = text.value.text
}*/

const dogImageLink = ref('')

const getDogImage = async () => {
  dogImageLink.value = ''
  const { data: response } = await useFetch('/api/dog', {
    headers: {
      Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
    },
    initialCache: false,
  })
  dogImageLink.value = response.value.message
}

/*
const signIn = () => {
  Auth.federatedSignIn()
}*/
const signOut = () => {
  Auth.signOut()
}

</script>