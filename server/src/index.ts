import { connectDatabase } from './configs/database'
import { createServer } from './configs/server'
import { createStaticServer } from './configs/static'

async function main() {
  await connectDatabase()
  createServer()
  createStaticServer()
}

main()
