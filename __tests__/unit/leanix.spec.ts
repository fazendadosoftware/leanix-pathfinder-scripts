import {
  createLeanIXCredentials,
  getAccessToken,
  getLaunchUrl,
  getAccessTokenClaims,
  executeGraphQL
} from '../../lib/leanix'

// Do not forget to add an ".env" file to this project root folder containing the following variables
// LEANIX_HOST=<your workspace instance - e.g. app.leanix.net>
// LEANIX_APITOKEN=<your api token>
const credentials = createLeanIXCredentials(process.env.LEANIX_HOST, process.env.LEANIX_APITOKEN)

describe('LeanIX helpers', () => {
  test('allow to get an access token from credentials', async () => {
    expect(credentials.host).not.toBeFalsy()
    expect(credentials.apitoken).not.toBeFalsy()

    const accessToken = await getAccessToken(credentials)
    expect(accessToken)
      .toEqual(expect.objectContaining({
        accessToken: expect.any(String),
        expired: expect.any(Boolean),
        expiresIn: expect.any(Number),
        scope: expect.any(String),
        tokenType: 'bearer'
      })
      )
  })
  test('allow to login into a workspace using an access token', async () => {
    const accessToken = await getAccessToken(credentials)
    const claims = getAccessTokenClaims(accessToken)
    const launchUrl = getLaunchUrl(accessToken.accessToken)
    const url = new URL(launchUrl)
    expect(url.origin).toEqual(claims.instanceUrl)
    expect(url.pathname).toEqual(`/${claims.principal.permission.workspaceName}`)
    expect(url.hash).toContain('#access_token=')
  })

  test('allow to execute a graphql query', async () => {
    const query = '{ allFactSheets { edges { node { id type name } } } }'
    const accessToken = await getAccessToken(credentials)
    const data = await executeGraphQL({ query, variables: {}, accessToken })
    expect(Array.isArray(data?.allFactSheets?.edges)).toBe(true)
  })
})
