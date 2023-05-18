import express from 'express'
import path from 'path'

export const createStaticServer = () => {
  const app = express()
  const publicPath = path.resolve(__dirname, '..', '..', 'public')

  app.use(express.static(publicPath))

  const port = 3000

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })
}
