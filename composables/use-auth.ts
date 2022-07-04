import { CognitoUser } from "@aws-amplify/auth";
import { Auth } from 'aws-amplify';

export const useAuth = () => {
  const currentUser = useState<CognitoUser>('auth', () => null)

  const getUser = async () => {
    try {
      const userData = await Auth.currentAuthenticatedUser()
      currentUser.value = userData
      return userData
     } catch(e) {
      currentUser.value = null
      return null
    }
  }

  const isAuthenticated = async () => {
    const user = await getUser()
    return !!user
  }

  return {
    currentUser,
    getUser,
    isAuthenticated,
  }
}
