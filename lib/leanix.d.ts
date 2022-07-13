export type LeanIXHost = string
export type LeanIXApiToken = string
export type BearerToken = string
export type LeanIXWorkspaceId = string
export type LeanIXWorkspaceName = string

export interface LeanIXCredentials {
  host: LeanIXHost
  apitoken: LeanIXApiToken
  proxyURL?: string
}

export interface AccessToken {
  accessToken: BearerToken
  expired: boolean
  expiresIn: number
  scope: string
  tokenType: string
}

export interface JwtClaims {
  exp: number
  instanceUrl: string
  iss: string
  jti: string
  sub: string
  principal: { permission: { workspaceId: LeanIXWorkspaceId, workspaceName: LeanIXWorkspaceName } }
}

export interface ExecuteGraphQLParams {
  query: string
  variables?: any
  accessToken: AccessToken
}

export interface GraphQLError {
  message: string
  locations: Array<{ line: number, column: number }>
}

export interface GraphQLResponse {
  data: any
  errors?: GraphQLError[]
}
