import json

from tornado.httpclient import HTTPClientError
import pytest


async def test_hello(jp_fetch):
    response = await jp_fetch("jupyterlab-advanced-code-viewer-extension", "hello")

    assert response.code == 200
    payload = json.loads(response.body)
    assert payload == {
        "data": (
            "Hello, world!"
            " This is the '/jupyterlab-advanced-code-viewer-extension/hello' endpoint."
            " Try visiting me in your browser!"
        ),
    }


async def test_hello_refuses_an_unauthenticated_request(jp_fetch):
    # jp_fetch adds the token to each request; the header is sent empty here,
    # so the route answers as it would to a browser without a session.
    with pytest.raises(HTTPClientError) as refused:
        await jp_fetch(
            "jupyterlab-advanced-code-viewer-extension",
            "hello",
            headers={"Authorization": ""},
        )
    assert refused.value.code == 403
