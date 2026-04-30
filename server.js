const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

// Hostinger sets NODE_ENV to production automatically, but we check just in case
const dev = process.env.NODE_ENV !== 'production'

// Next.js uses localhost internally, but the Hostinger reverse proxy binds to the assigned PORT
const hostname = 'localhost'
const port = process.env.PORT || 3000

// Initialize the Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('Internal Server Error')
    }
  })
    .once('error', (err) => {
      console.error('Server error:', err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
