# haribote-config-server

[![Docker](https://github.com/mkontani/haribote-config-server/workflows/Docker/badge.svg)](https://github.com/mkontani/haribote-config-server/actions?query=workflow%3ADocker)
[![npm](https://img.shields.io/npm/v/haribote-config-server)](https://www.npmjs.com/package/haribote-config-server)
[![GitHub](https://img.shields.io/github/license/mkontani/haribote-config-server)](https://github.com/mkontani/haribote-config-server/blob/master/LICENSE)
[![codecov](https://codecov.io/gh/mkontani/haribote-config-server/branch/master/graph/badge.svg?token=WJCXSQXUDR)](https://codecov.io/gh/mkontani/haribote-config-server/)
[![DockerHub](https://img.shields.io/badge/DockerHub-haribote--config--server-pink.svg?logo=docker)](https://hub.docker.com/r/mkontani/haribote-config-server)

🏢 Simple light configurable multi process web server without dependencies.

For each server, all you do is defining request routing and corresponding to response like [default example](./settings.json).

You can easily up multi server processes with flexible routing by just editing config file.

- [haribote-config-server](#haribote-config-server)
  - [Usage](#usage)
    - [Use as Container](#use-as-container)
    - [Use as NPM module](#use-as-npm-module)
    - [Use as exec binary](#use-as-exec-binary)
  - [Configuration](#configuration)

## Usage

```sh
Usage:
Specify configfile path by argv or env (HARIBOTE_CONF)
ARGV Case:
  e.g.) $ haribote-config-server ./settings.json
ENV Case:
  e.g.) $ HARIBOTE_CONF=./settings.json haribote-config-server
Docker CLI Case:
  e.g.) $ docker run -p <host-port>:<container-port> -v $PWD/settings.json:/app/settings.json:ro mkontani/haribote-config-server
```

### Use as Container

You can run [docker image](https://hub.docker.com/r/mkontani/haribote-config-server) like below.

```sh
$ docker run --rm -p 9997:9997 -p 9998:9998 -p 9999:9999 mkontani/haribote-config-server
```

To start server from this repo, run the following commands.

```sh
# build image
$ docker build -t haribote .

# run the haribote server
$ docker run -p 9997:9997 -p 9998:9998 -p 9999:9999 -v $PWD/settings.json:/app/settings.json:ro  haribote

HTTP Server minimal setting example is listening on PORT 9997
HTTP Server various routing example is listening on PORT 9998
HTTPS Server TLS example is listening on PORT 9999
```

By Using [default config](./settings.json), 3 server processes up like above output.

When access to `http://<server>:9997` (`GET`) which is not configured, 
request headers info is returned like below.

```sh
ᐅ curl -X 'GET' http://localhost:9997       
{
  "host": "localhost:9997",
  "user-agent": "curl/7.58.0",
  "accept": "*/*",
  "haribote_name": "sample1"
}
```

When `POST` request to `http://<server>:9998/foo`, 
a message `success` is returned which `content-type` is `text/plain`.

```sh
ᐅ curl -X 'POST' http://localhost:9998/foo
"success"
```

When request `http://<server>:9998/bar` with other than `PUT` method, a json response is returned.
If request to `http://<server>:9998/bar` with `PUT` method, 
a response is returned which `content-type` is `text/plain` which is set bigger priority number.

```sh
ᐅ curl -X 'GET' http://localhost:9998/bar
{"response": "/bar accessed."}

ᐅ curl -X 'PUT' http://localhost:9998/bar
"PUT /bar requested."
```

When access to ssl `https://<server>:9999`, 
request headers info is returned same as port 9997.

You can customize by overwrite config `settings.json`.

### Use as NPM module

You can use as npm module like below.

With config file case:

```javascript
// import module
const serverUP = require('haribote-config-server')

// get configfile
const config = require('<your config path>')

// up server process with configfile
serverUP(config)
```

Directly set config object case:

```javascript
// import module
const serverUP = require('haribote-config-server')

// up server process with config object
serverUP([{name: "sample-server", port: 9999}])
```

### Use as exec binary

You can exec as binary like below.

```sh
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

| property                     | desc                                                                                                                                                                                                                                                                                                                      |
| :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **name**                     | server app name (default is `haribote-server`)                                                                                                                                                                                                                                                                            |
| **port**                     | server listening port (mandatory)                                                                                                                                                                                                                                                                                         |
| **defaultStatusCode**        | default response HTTP status code. If undefined, `200` is set as default value.                                                                                                                                                                                                                                           |
| **defaultContentType**       | default response `Content-Type`. If undefined, `text/plain` is set as default value.                                                                                                                                                                                                                                      |
| **defaultResHeaders**           | default response headers. If undefined, `request header` is set as default value.                                                                                                                                                                                                                                            |
| **defaultResBody**           | default response body. If undefined, `request header` is set as default value.                                                                                                                                                                                                                                            |
| **mappings**                 | set request and response conditions                                                                                                                                                                                                                                                                                       |
| **mappings.priority**        | routing priority. If request condition matches multiple mappings, the mapping which has the biggest number is applied.                                                                                                                                                                                                    |
| **mappings.req**             | request condition (If mappings defined, this is mandatory.)                                                                                                                                                                                                                                                               |
| **mappings.req.method**      | request method condition (e.g. "GET", "POST", "PUT",...). If `req.path` is not defined, this is mandatory. This supports wildcard (all methods) with `*`.                                                                                                                                                                 |
| **mappings.req.path**        | request url pathname (e.g. "/foo"). If `req.method` is not defined, this is mandatory. This supports wildcard with single "`*`" which matches any character except "`/`"(e.g. "`wild*`" matches "`wildcard`") and deep "`**`" which matches any character include "`/`"(e.g. "`/wild/**end`" matches "`/wild/card/end`"). |
| **mappings.res**             | response condition (If mappings defined, this is mandatory.)                                                                                                                                                                                                                                                              |
| **mappings.res.statusCode**  | response HTTP status code. If request condition matched, this code is applied.                                                                                                                                                                                                                                            |
| **mappings.res.contentType** | response HTTP `Content-Type`. If request condition matched, this Content-Type is applied.                                                                                                                                                                                                                                 |
| **mappings.res.headers**        | responses headers. If request condition matched, this headers are applied.                                                                                                                                                                                                                                                       |
| **mappings.res.body**        | responses body. If request condition matched, this body is applied.                                                                                                                                                                                                                                                       |
| **tls**                      | tls settings (Only needed for https)                                                                                                                                                                                                                                                                                      |
| **tls.key**                  | tls keyfile path                                                                                                                                                                                                                                                                                                          |
| **tls.cert**                 | tls certfile path                                                                                                                                                                                                                                                                                                         |

You can specify JSON Array format.
Default example config is below.

```json
[
  {
    "name": "minimal setting example"
    "port": 9997
  },
  {
    "name": "various routing example"
    "port": 9998,
    "defaultStatusCode": 404,
    "defaultContentType": "application/json",
    "defaultResBody": {
      "message": "This is default response."
    },
    "mappings": [
      {
        "req": {
          "method": "POST",
          "path": "/foo"
        },
        "res": {
          "statusCode": 201,
          "contentType": "text/plain",
          "body": "success"
        }
      },
      {
        "priority": 1,
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
        "priority": 2,
        "req": {
          "path": "/bar",
          "method": "PUT"
        },
        "res": {
          "statusCode": 200,
          "contentType": "text/plain",
          "body": "PUT /bar requested."
        }
      },
      {
        "req": {
          "path": "/wild/v*/foo"
        },
        "res": {
          "statusCode": 200,
          "contentType": "text/plain",
          "headers": {
            "X-TEST1-HEADER": "test1-header-value",
            "X-TEST2-HEADER": "test2-header-value"
          },
          "body": "single wildcard path used."
        }
      },
      {
        "req": {
          "path": "/wild/**end"
        },
        "res": {
          "statusCode": 200,
          "contentType": "text/plain",
          "body": "deep wildcard path used."
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
