# haribote-config-server
[![Docker](https://github.com/mkontani/haribote-config-server/workflows/Docker/badge.svg)](https://github.com/mkontani/haribote-config-server/actions?query=workflow%3ADocker)
[![npm](https://img.shields.io/npm/v/haribote-config-server)](https://www.npmjs.com/package/haribote-config-server)
[![GitHub](https://img.shields.io/github/license/mkontani/haribote-config-server)](https://github.com/mkontani/haribote-config-server/blob/master/LICENSE)

🏢 Simple configurable multi process web server.

For each server, all you do is defining request routing and corresponding to response.

You can easily up multi server processes by just only editing configfile.

- [haribote-config-server](#haribote-config-server)
  - [Usage](#usage)
    - [Use as Container](#use-as-container)
    - [Use as NPM module](#use-as-npm-module)
    - [Use as exec binary](#use-as-exec-binary)
  - [Configuration](#configuration)

## Usage

### Use as Container

You can run [docker image](https://hub.docker.com/r/mkontani/haribote-config-server) like below.

```
$ docker run --rm -p 9997:9997 -p 9998:9998 -p 9999:9999 mkontani/haribote-config-server
```

To start server from this repo, run the following commands.

```:bash
# build image
$ docker build -t haribote .

# run the haribote server
$ docker run -p 9997:9997 -p 9998:9998 -p 9999:9999 -v $PWD/settings.json:/app/settings.json:ro  haribote

> haribote-config-server@1.0.0 start /app
> node server.js

HTTP Server sample1 is listening on PORT 9997
HTTP Server sample2 is listening on PORT 9998
HTTPS Server sample3-tls is listening on PORT 9999
```

By Using [default config](./settings.json), 3 server processes up like above output.

When access to `http://<server>:9997` (`GET`), 
request headers info is returned like below.

```
ᐅ curl -X 'GET' http://localhost:9997       
{
  "host": "localhost:9997",
  "user-agent": "curl/7.58.0",
  "accept": "*/*",
  "haribote_name": "sample1"
}
```

When `POST` request to `http://<server>:9998/foo`, 
a message `success` is returned which `content-type` is `plain/text`.

When access to ssl `https://<server>:9999`, 
request headers info is returned same as port 9997.

You can customize by overwrite config `settings.json`.

### Use as NPM module

You can use as npm module like below.

```
// import module
const serverUP = require('haribote-config-server')

// get configfile
const config = require('<your config path>')

// up server process
serverUP(config)
```

### Use as exec binary

You can exec as binary like below.

```
// install binary module
$ npm install -g haribote-config-server

// or local install
$ npm install haribote-config-server


// up server process with configfile
$ haribote-config-server ./config.json

// or local exec
$ ./node_modules/.bin/haribote-config-server ./config.json
```

## Configuration

You can set config file path by setting file on default position (`${__dirname}/settings.json`) or env var (`HARIBOTE_CONF`) or command-line arg.

The priority is following order

1. ARGV
2. ENV (`HARIBOTE_CONF`)
3. default file position (`${__dirname}/settings.json` [`/app/settings.json` (if container env)])

The Config properties detail is following.

| property                     | desc                                                                                                                                           |
| :--------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| **name**                     | server app name (default is `haribote-server`)                                                                                                 |
| **port**                     | server listening port (mandatory)                                                                                                              |
| **mappings**                 | set request and response conditions                                                                                                            |
| **mappings.req**             | request condition (If mappings defined, this is mandatory.)                                                                                    |
| **mappings.req.method**      | request method condition (e.g. "GET", "POST", "PUT",...). If `req.path` is not defined, this is mandatory.                                     |
| **mappings.req.path**        | request url pathname (e.g. "/foo"). If `req.method` is not defined, this is mandatory.                                                         |
| **mappings.res**             | response condition (If mappings defined, this is mandatory.)                                                                                   |
| **mappings.res.statusCode**  | response HTTP status code (If mappings is not defined, default is `200`, otherwise `404`). If request condition matched, this code is applied. |
| **mappings.res.contentType** | response HTTP `Content-Type` (default is `plain/text`). If request condition matched, this Content-Type is applied.                            |
| **mappings.res.body**        | responses body (default is request header). If request condition matched, this body is applied.                                                |
| **tls.key**                  | tls keyfile path (Only needed for https)                                                                                                       |
| **tls.cert**                 | tls certfile path (Only needed for https)                                                                                                      |

You can specify JSON Array format.
Default example config is below.

```
[
  {
    "name": "minimal setting."
    "port": 9997
  },
  {
    "name": "various routing examples."
    "port": 9998,
    "mappings": [
      {
        "req": {
          "method": "POST",
          "path": "/foo"
        },
        "res": {
          "statusCode": 201,
          "contentType": "plain/text",
          "body": "success"
        }
      },
      {
        "req": {
          "path": "/bar"
        },
        "res": {
          "statusCode": 202,
          "contentType": "application/json",
          "body": {
            "response": "/bar accessed."
          }
        }
      },
      {
        "req": {
          "method": "GET"
        },
        "res": {
          "statusCode": 200,
          "contentType": "application/json",
          "body": {
            "result": "OK"
          }
        }
      }
    ]
  },
  {
    "name": "TLS example",
    "port": 9999,
    "tls": {
      "key": "certs/server.key",
      "cert": "certs/server.crt"
    }
  }
]
```