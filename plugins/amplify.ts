import {Amplify} from "aws-amplify"

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const amplifyConfig = {
    Auth: {
      region: config.public.REGION,
      userPoolId: config.public.COGNITO_USER_POOL_ID,
      userPoolWebClientId: config.public.COGNITO_USER_POOL_WEB_CLIENT_ID,
      oauth: {
        domain: config.public.DOMAIN,
        scope: ['openid'],
        redirectSignIn: config.public.REDIRECT_URL,
        redirectSignOut: config.public.LOGOUT_URL,
        responseType: 'code',
      },
    },
//    ssr: true,
  }
  
  console.log(amplifyConfig)
  Amplify.configure(amplifyConfig)
  
})
