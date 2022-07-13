import { readFileSync } from 'fs'
import gql from 'graphql-tag'

const requireGql = (path: string) => gql(readFileSync(path, 'utf8')).loc.source.body.replace(/\s\s+/g, ' ')

export default requireGql
