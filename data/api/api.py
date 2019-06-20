#!/usr/bin/python3

import json
from urllib.parse import urlparse

from quart import current_app
from quart import Quart
from quart import request
from quart.wrappers import Response
from quart import websocket

app = Quart(__name__)

@app.route('/')
async def hello():
    return 'hello'

@app.route('/<username>', methods=['GET', 'OPTIONS'])
async def username(username):
    if 'Origin' in request.headers:
        hostname = urlparse(request.headers['Origin']).hostname

        response = Response(
            "{}",
            headers={
                'Access-Control-Allow-Origin': 'https://' + hostname,
                'Access-Control-Allow-Headers': 'authorization'
            }
        )

        return response

    return 'hello {}'.format(username)

@app.websocket('/ws')
async def ws():
    while True:
        await websocket.send('hello')
