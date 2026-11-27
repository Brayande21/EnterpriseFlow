import logging

from fastapi import Request
from fastapi.responses import JSONResponse
from psycopg import Error

logger = logging.getLogger(__name__)


async def database_exception_handler(
    request: Request,
    exc: Error
):
    logger.error(
        "Error en la base de datos",
        exc_info=exc
    )

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Error interno de la base de datos"
        }
    )
