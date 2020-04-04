const http = require('http')
const https = require('https')
const fs = require('fs')

const Up = (config) => {
    config.forEach(c => {
        let server;
        if (c.tls) {
            server = https.createServer({
                key: fs.readFileSync(c.tls.key),
                cert: fs.readFileSync(c.tls.cert)
            }, (req, res) => {
                res.statusCode = c.statusCode || 200
                req.headers.haribote_name = c.name || 'haribote-server'
                const resMessage = c.resMessage || JSON.stringify(req.headers, null, 4)
                res.end(resMessage)
            })
        } else {
            server = http.createServer((req, res) => {
                res.statusCode = c.statusCode || 200
                req.headers.haribote_name = c.name || 'haribote-server'
                const resMessage = c.resMessage || JSON.stringify(req.headers, null, 4)
                res.end(resMessage)
            })
        }
        server.listen(c.port, () => {
            const schema = c.tls ? 'HTTPS' : 'HTTP'
            console.log(`${schema} Server ${c.name} is listening on PORT ${c.port}`)
        })

        server.on('error', (e) => {
            console.log(e)
            process.exit(1)
        })
    });
}

module.exports = Up