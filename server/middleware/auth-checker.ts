import jwkToPem from 'jwk-to-pem'
import jwt from 'jsonwebtoken'
import {promisify} from 'util'

// https://aws.amazon.com/jp/premiumsupport/knowledge-center/decode-verify-cognito-json-token/
// https://github.com/awslabs/aws-support-tools/blob/master/Cognito/decode-verify-jwt/decode-verify-jwt.ts

export interface ClaimVerifyRequest {
  readonly token?: string;
}

export interface ClaimVerifyResult {
  readonly userName: string;
  readonly clientId: string;
  readonly isValid: boolean;
  readonly error?: any;
}

interface TokenHeader {
  kid: string;
  alg: string;
}
interface PublicKey {
  alg: string;
  e: string;
  kid: string;
  kty: string;
  n: string;
  use: string;
}
interface PublicKeyMeta {
  instance: PublicKey;
  pem: string;
}

interface PublicKeys {
  keys: PublicKey[];
}

interface MapOfKidToPublicKey {
  [key: string]: PublicKeyMeta;
}

interface Claim {
  token_use: string;
  auth_time: number;
  iss: string;
  exp: number;
  username: string;
  client_id: string;
}

const config = useRuntimeConfig()
const region = config.public.REGION
const poolId = config.public.COGNITO_USER_POOL_ID
const cognitoIssuer = `https://cognito-idp.${region}.amazonaws.com/${poolId}`

let cacheKeys: MapOfKidToPublicKey | undefined

const getPublicKeys = async (): Promise<MapOfKidToPublicKey> => {
  if (!cacheKeys) {
    const url = `${cognitoIssuer}/.well-known/jwks.json`
    const publicKyes = await $fetch<PublicKeys>(url)
    cacheKeys = publicKyes.keys.reduce((agg, current) => {
      const pem = jwkToPem(current as jwkToPem.JWK)
      agg[current.kid] = {instance: current, pem}
      return agg
    }, {} as MapOfKidToPublicKey)
    return cacheKeys
  } else {
    return cacheKeys
  }
}

const verifyPromised = promisify(jwt.verify.bind(jwt))

export default defineEventHandler(async (event) => {
  if (!event.req.url.startsWith('/api')) {
    return
  }

  try {
//    console.log(event.req.headers.authorization)
    const token = event.req.headers?.authorization?.split(" ")?.[1]
//    console.log('token={}', token)
    if (!token) {
      console.log('token not found')
      event.res.statusCode = 401
      event.res.setHeader('WWW-Authenticate', 'Bearer realm="token_required"')
      event.res.end('Unauthorized')
      return
    }

    const tokenSections = (token || '').split('.')
    if (tokenSections.length < 2) {
      console.log('requested token is invalid')
      event.res.statusCode = 401
      event.res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"')
      event.res.end('Unauthorized')
      return
    }

    const headerJSON = Buffer.from(tokenSections[0], 'base64').toString('utf8')
    const header = JSON.parse(headerJSON) as TokenHeader
    const keys = await getPublicKeys()
    const key = keys[header.kid]
    if (key === undefined) {
      console.log('claim made for unknown kid')
      event.res.statusCode = 401
      event.res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"')
      event.res.end('Unauthorized')
      return
    }

    const claim = await verifyPromised(token, key.pem) as Claim;
//    console.log('calim=', claim)
    const currentSeconds = Math.floor( (new Date()).valueOf() / 1000);
    if (currentSeconds > claim.exp || currentSeconds < claim.auth_time) {
      console.log('claim is expired or invalid')
      event.res.statusCode = 401
      event.res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"')
      event.res.end('Unauthorized')
      return
    }
    if (claim.iss !== cognitoIssuer) {
      console.log('claim issuer is invalid')
      event.res.statusCode = 401
      event.res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"')
      event.res.end('Unauthorized')
      return
    }
    if (claim.token_use !== 'id') {
      console.log('claim use is not id')
      event.res.statusCode = 401
      event.res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"')
      event.res.end('Unauthorized')
      return
    }
    event.context.auth = claim
  } catch (error) {
    console.log(error)
    event.res.statusCode = 401
    event.res.setHeader('WWW-Authenticate', 'Bearer error="invalid_token"')
    event.res.end('Unauthorized')
  }
})
