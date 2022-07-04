export default defineNuxtRouteMiddleware(async (to, from) => {
  console.log('root middleware')
  const { isAuthenticated } = useAuth()

  try {
    const auth = await isAuthenticated()
    console.log(`authenticaed: ${auth}`)
    console.log(`to.path=${to.path}`)
  } catch (e) {
    console.error(e)
  }

  if (! await isAuthenticated() && to.path !== '/login') {
    console.log('go login page')
//    navigateTo('/login')
    return { path: '/login' }
  }
})
