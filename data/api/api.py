#!/usr/bin/python3

from aiohttp import web

import json
import os
import ssl
from urllib.parse import urlparse

async def handle(request):
    name = request.match_info.get('username', 'Anonymous')

    result = {}
    for k, v in request.headers.items():
        result[k] = v

    response = web.json_response(result)

    if 'Origin' in request.headers:
        hostname = urlparse(request.headers['Origin']).hostname
        response.headers['Access-Control-Allow-Origin'] = 'https://' + hostname
        response.headers['Access-Control-Allow-Headers'] = 'authorization'
        print(json.dumps(dict(response.headers), indent=4))
    else:
        return web.HTTPNotFound()

    return response

app = web.Application()

app.router.add_options('/{username}', handle)
app.router.add_get('/{username}', handle)

base_dir = os.path.dirname(__file__)

ssl_context = ssl.create_default_context(
    ssl.Purpose.CLIENT_AUTH,
    cafile='%s/ca.cert' % (base_dir)
)

ssl_context.load_cert_chain(
    '%s/api.cert' % (base_dir),
    '%s/api.key' % (base_dir)
)

if __name__ == "__main__":
    web.run_app(app, host='0.0.0.0', port=443, ssl_context=ssl_context)
