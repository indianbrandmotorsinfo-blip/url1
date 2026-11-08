"""FastAPI application entry point."""

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.bootstrap import init_database
from app.config import get_settings
from app.logging_config import configure_logging
from app.routers import auth, health, urls

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    configure_logging(get_settings().log_level)
    init_database()
    logger.info("URL Management Dashboard API started")
    yield


# Interactive docs are disabled: this API is private to the dashboard frontend.
app = FastAPI(
    title="URL Management Dashboard",
    lifespan=lifespan,
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_request: Request, exc: RequestValidationError) -> JSONResponse:
    messages = []
    for error in exc.errors():
        field = str(error["loc"][-1]) if error["loc"] else "request"
        message = str(error["msg"]).removeprefix("Value error, ")
        messages.append(f"{field}: {message}")
    return JSONResponse(status_code=422, content={"detail": "; ".join(messages)})


app.include_router(health.router)
app.include_router(auth.router)
app.include_router(urls.router)
