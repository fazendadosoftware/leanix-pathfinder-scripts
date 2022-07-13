import {
  AccessToken,
  createLeanIXCredentials,
  executeGraphQL,
  getAccessToken
} from '../../lib/leanix'
import requireGql from '../../lib/requireGql'
import { resolve, join } from 'path'
import { writeFileSync, mkdirSync, existsSync } from 'fs'

const OUTPUT_DIR = join(process.cwd(), '.output')

describe('LeanIX subscription tasks', () => {
  let accessToken: AccessToken | null = null

  beforeAll(async () => {
    // If the output dir doesn't exist, create it
    if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR)
    // build our credentials object from the environment variables
    const credentials = createLeanIXCredentials(process.env.LEANIX_HOST, process.env.LEANIX_APITOKEN)
    // we start our test by getting a bearer token
    accessToken = await getAccessToken(credentials)
    expect(accessToken).not.toBeNull()
  })

  test('fetch all subscription roles and save it into a file', async () => {
    const query = requireGql(resolve(__dirname, '../../graphql/QUERY_ALLSUBSCRIPTIONROLES.gql'))
    const subscriptionRoles = await executeGraphQL({ query, accessToken })
      .then(({ allSubscriptionRoles: { edges } }) => edges.map(({ node }) => node))
    writeFileSync(join(OUTPUT_DIR, 'subscriptionRoles.json'), JSON.stringify(subscriptionRoles, null, 2))
  })

  test('fetches all factsheets with a specific subscription role and save it into a file', async () => {
    const query = requireGql(resolve(__dirname, '../../graphql/QUERY_ALLFACTSHEETS.gql'))
    const variables = {
      filter: {
        facetFilters: [
          // we exclude from our query factsheets without any subscription
          { facetKey: 'Subscriptions', keys: ['__missing__'], operator: 'NOR' }
        ]
      }
    }

    // We want to filter factsheets having at least a subscription with the following role id
    // TODO: change this id according your case
    const FILTERING_ROLE_ID = '20a7d0c4-ab62-4a6a-974c-f48d7818f3b9'

    const factSheetsSubscribedWithRole = await executeGraphQL({ query, variables, accessToken })
      .then(data => {
        const factSheetsSubscribedWithRole = data.allFactSheets.edges
          .reduce((accumulator, edge) => {
            const factSheet = edge.node
            const subscriptions = factSheet.subscriptions.edges
              .map(edge => edge.node)
              .filter(node => node.roles.map(role => role.id).includes(FILTERING_ROLE_ID))
            if (subscriptions.length > 0) accumulator.push({ ...factSheet, subscriptions })
            return accumulator
          }, [])
        return factSheetsSubscribedWithRole
      })
    writeFileSync(join(OUTPUT_DIR, 'factSheetsWithSubscriptionRole.json'), JSON.stringify(factSheetsSubscribedWithRole, null, 2))
  })

  test('fetches all factsheets with a specific subscription role', async () => {
    // TYPINGS FOR OUR MUTATION VARIABLES
    interface MutationVariables {
      subscriptionId: string
      userId: string
      subscriptionType: 'ACCOUNTABLE' | 'RESPONSIBLE' | 'OBSERVER'
      roleId: string
    }
    const query = requireGql(resolve(__dirname, '../../graphql/MUTATION_UPDATESUBSCRIPTION.gql'))
    // we load the json file from our last test, containing the factsheets
    // with the targeted subscription role
    const factSheets = require(join(OUTPUT_DIR, 'factSheetsWithSubscriptionRole.json'))
    for (const factSheet of factSheets) {
      for (const subscription of factSheet.subscriptions) {
        // task:
        // execute the mutation UPDATESUBSCRIPTION for updating the subscription role.
        const variables: MutationVariables = {
          subscriptionId: '',
          userId: '',
          subscriptionType: 'ACCOUNTABLE', // replace it according your subscription
          roleId: ''
        }
        console.log('TODO: RUN YOUR GRAPHQL HERE', query, variables, subscription)
        // await executeGraphQL({ query, variables, accessToken })
      }
    }
  })
})
