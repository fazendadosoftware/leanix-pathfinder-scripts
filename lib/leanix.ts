import fetch, { RequestInit } from 'node-fetch'
import createHttpsProxyAgent from 'https-proxy-agent'
import jwtDecode from 'jwt-decode'
import { LeanIXCredentials, AccessToken, JwtClaims, BearerToken, ExecuteGraphQLParams, GraphQLResponse, GraphQLError } from './leanix.d'
export { LeanIXCredentials, AccessToken, JwtClaims, BearerToken, ExecuteGraphQLParams }

const snakeToCamel = (s: string): string => s.replace(/([-_]\w)/g, g => g[1].toUpperCase())

export const createLeanIXCredentials = (host: string = null, apitoken: string = null): LeanIXCredentials => {
  if (host === null || apitoken === null) throw Error('could not create leanix credentials: invalid host or apitoken')
  return { host, apitoken }
}

export const getAccessToken = async (credentials: LeanIXCredentials): Promise<AccessToken> => {
  const uri = `https://${credentials.host}/services/mtm/v1/oauth2/token?grant_type=client_credentials`
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Basic ${Buffer.from('apitoken:' + credentials.apitoken).toString('base64')}`
  }
  const options: RequestInit = { method: 'post', headers }
  if (credentials.proxyURL !== undefined) options.agent = createHttpsProxyAgent(credentials.proxyURL)
  const accessToken: AccessToken = await fetch(uri, options)
    .then(async res => {
      const content = await res[res.headers.get('content-type') === 'application/json' ? 'json' : 'text']()
      return res.ok ? content as AccessToken : await Promise.reject(res.status)
    })
    .then(accessToken => Object.entries(accessToken)
      .reduce((accumulator, [key, value]) => ({ ...accumulator, [snakeToCamel(key)]: value }), {
        accessToken: '',
        expired: false,
        expiresIn: 0,
        scope: '',
        tokenType: ''
      }))
  return accessToken
}

export const getAccessTokenClaims = (accessToken: AccessToken): JwtClaims => jwtDecode(accessToken.accessToken)

export const getLaunchUrl = (bearerToken: BearerToken): string => {
  const decodedToken: JwtClaims = jwtDecode(bearerToken)
  const baseLaunchUrl = `${decodedToken.instanceUrl}/${decodedToken.principal.permission.workspaceName}#access_token=${bearerToken}`
  return baseLaunchUrl
}

export class LeanIXGraphQLError extends Error {
  errors: GraphQLError[]
  constructor (errors: GraphQLError[]) {
    super(errors.map(error => error.message).join(', '))
    this.errors = errors
    this.name = 'LeanIXGraphQLError'
  }
}

export const executeGraphQL = async (params: ExecuteGraphQLParams) => {
  const claims = getAccessTokenClaims(params.accessToken)
  const url = `${claims.instanceUrl}/services/pathfinder/v1/graphql`
  const headers = {
    'content-type': 'application/json',
    authorization: `Bearer ${params.accessToken.accessToken}`
  }
  const body = JSON.stringify({ query: params.query, variables: params.variables ?? {} })
  const response = await fetch(url, { method: 'POST', headers, body })
  if (response.status === 200) {
    const payload = await response.json() as GraphQLResponse
    if (payload?.errors?.length > 0) {
      throw new LeanIXGraphQLError(payload.errors)
    }
    return payload.data
  }
}
