# pyright: reportUnusedFunction=false

import hashlib
import hmac
from functools import cache
from html import escape
from pathlib import Path
from string import Template
from typing import Annotated

from fastapi import FastAPI, Form, Request, Response
from fastapi.openapi.docs import get_redoc_html, get_swagger_ui_html
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse

from shared.config import settings

COOKIE_NAME = "docs_session"
LOGIN_URL = "/docs/login"
SESSION_MAX_AGE = 60 * 60 * 8
_TEMPLATE_PATH = Path(__file__).parent / "docs_login.html"


def _session_token() -> str:
    return hashlib.sha256(settings.DOCS_PASSWORD.encode("utf-8")).hexdigest()


def _verify_session(cookie: str | None) -> bool:
    return bool(cookie) and hmac.compare_digest(cookie, _session_token())


def _check_credentials(username: str, password: str) -> bool:
    username_ok = hmac.compare_digest(username, settings.DOCS_USERNAME)
    password_ok = hmac.compare_digest(password, settings.DOCS_PASSWORD)
    return username_ok and password_ok


@cache
def _login_template() -> Template:
    return Template(_TEMPLATE_PATH.read_text(encoding="utf-8"))


def _login_page(title: str, action: str, error: str | None = None) -> str:
    return _login_template().substitute(
        title=escape(title),
        action=escape(action, quote=True),
        error_message=escape(error) if error else "",
        error_hidden="" if error else " hidden",
    )


def register_docs_auth(app: FastAPI) -> None:
    if not settings.DOCS_ENABLED:
        return

    if not settings.DOCS_PASSWORD:
        raise RuntimeError("DOCS_ENABLED is set but DOCS_PASSWORD is empty")

    def _redirect_to_login() -> RedirectResponse:
        return RedirectResponse(LOGIN_URL, status_code=303)

    @app.get("/docs/login", include_in_schema=False)
    async def docs_login_page(request: Request) -> Response:
        if _verify_session(request.cookies.get(COOKIE_NAME)):
            return RedirectResponse("/docs", status_code=303)
        return HTMLResponse(_login_page(app.title, LOGIN_URL))

    @app.post("/docs/login", include_in_schema=False)
    async def docs_login(
        username: Annotated[str, Form()],
        password: Annotated[str, Form()],
    ) -> Response:
        if not _check_credentials(username, password):
            return HTMLResponse(
                _login_page(app.title, LOGIN_URL, "Incorrect username or password"),
                status_code=401,
            )
        response = RedirectResponse("/docs", status_code=303)
        response.set_cookie(
            COOKIE_NAME,
            _session_token(),
            max_age=SESSION_MAX_AGE,
            path="/",
            httponly=True,
            samesite="lax",
            secure=settings.ENVIRONMENT != "local",
        )
        return response

    @app.get("/docs/logout", include_in_schema=False)
    async def docs_logout() -> Response:
        response = RedirectResponse(LOGIN_URL, status_code=303)
        response.delete_cookie(COOKIE_NAME, path="/")
        return response

    @app.get("/docs", include_in_schema=False)
    async def docs(request: Request) -> Response:
        if not _verify_session(request.cookies.get(COOKIE_NAME)):
            return _redirect_to_login()
        return get_swagger_ui_html(openapi_url="/openapi.json", title=f"{app.title} - Swagger UI")

    @app.get("/redoc", include_in_schema=False)
    async def redoc(request: Request) -> Response:
        if not _verify_session(request.cookies.get(COOKIE_NAME)):
            return _redirect_to_login()
        return get_redoc_html(openapi_url="/openapi.json", title=f"{app.title} - ReDoc")

    @app.get("/openapi.json", include_in_schema=False)
    async def openapi(request: Request) -> Response:
        if not _verify_session(request.cookies.get(COOKIE_NAME)):
            return JSONResponse({"detail": "Not authenticated"}, status_code=401)
        return JSONResponse(app.openapi())
