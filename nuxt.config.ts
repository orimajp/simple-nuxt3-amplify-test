import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
// https://v3.nuxtjs.org/guide/features/runtime-config
export default defineNuxtConfig({
  nitro: {
    preset: 'aws-lambda',
    serveStatic: true
},
ssr: false,

  runtimeConfig: {
    public: {
      REGION: '',
      DOMAIN: '',
      SCOPE: '',
      REDIRECT_URL: '',
      LOGOUT_URL: '',
      COGNITO_USER_POOL_WEB_CLIENT_ID: '',
      COGNITO_USER_POOL_ID: '',
    },
  },

//  builder: 'webpack',
  app: {
    head: {
      meta: [
        {  name: 'viewport', content: 'width=device-width,initial-scale=1.0,maximum-scale=1.0'  },
      ],
    }
  },
  vite: {
    resolve: {
      alias: {
        './runtimeConfig': './runtimeConfig.browser',
      }
    },
    define: {
      "window.global": {},
    }
  },
  alias: {
    '@aws-amplify/core': '@aws-amplify/core/lib',
    '@aws-amplify/auth': '@aws-amplify/auth/lib',
  },

})
