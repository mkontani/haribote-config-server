# haribote-config-server
![Docker](https://github.com/mkontani/haribote-config-server/workflows/Docker/badge.svg)


🏢 Simple configurable multi process web server.

You can easily up multi server processes by just only editting configfile.

- [haribote-config-server](#haribote-config-server)
  - [Usage](#usage)
  - [Configuration](#configuration)

## Usage

You can run docker image like below.

```
$ docker run --rm -p 9997:9997 -p 9998:9998 -p 9999:9999 mkontani/haribote-config-server
```

To start server from this repo, run the following commands.

```:bash
# build image
$ docker build -t haribote .

# run the haribote server
$ docker run -p 9997:9997 -p 9998:9998 -p 9999:9999 -p 10000:10000 -v $PWD/settings.json:/app/settings.json:ro  haribote

> haribote-config-server@1.0.0 start /app
> node server.js

HTTP Server sample1 is listening on PORT 9997
HTTP Server sample2 is listening on PORT 9998
HTTPS Server sample3-tls is listening on PORT 9999
```

By default config, 3 server processes up like above output.

Using Defualt config, when access to `http://<server>:9997`, 
request headers info is returned like below.

```
{
    "host": "localhost:9997",
    "connection": "keep-alive",
    "upgrade-insecure-requests": "1",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.158 Safari/537.36",
    "sec-fetch-dest": "document",
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "sec-fetch-site": "none",
    "sec-fetch-mode": "navigate",
    "sec-fetch-user": "?1",
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "ja,en-US;q=0.9,en;q=0.8",
    "haribote_name": "sample1"
}
```

when access to `http://<server>:9998`, 
a message `Hello world` is returned.

when access to ssl `https://<server>:9999`, 
request headers info is returned same as port 9997.

You can customize by overwrite config `settings.json`.

## Configuration

|property|desc|
|:--:|:--|
|**name**| server app name (default is `haribote-server`) |
|**port**| server listening port (mandatory) |
|**statusCode**| response statusCode (default is `200`) |
|**resMessage**| response message (default is `requestHeaders`) |
|**tls.key**| tls keyfile path (Only needed for https) |
|**tls.cert**| tls certfile path (Only needed for https) |

You can specify Json Array format.
Default example config is like following.

```
[
    {
        "name": "sample1",
        "port": 9997,
        "statusCode": 200
    },
    {
        "name": "sample2",
        "port": 9998,
        "resMessage": "Hello world",
        "statusCode": 503 
    },
    {
        "name": "sample3-tls",
        "port": 9999,
        "tls": {
            "key": "certs/server.key",
            "cert": "certs/server.crt"
        },
        "statusCode": 200
    }
]
```
