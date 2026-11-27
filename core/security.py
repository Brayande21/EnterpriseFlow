
import os
import jwt

from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from pwdlib import PasswordHash

load_dotenv()

SECRET_KEY = os.environ["JWT_SECRET_KEY"]
ALGORITHM = os.environ["JWT_ALGORITHM"]
EXPIRATION_MINUTES = int(os.environ["JWT_EXPIRATION_MINUTES"])

password_hash = PasswordHash.recommended()


def generar_hash(password: str) -> str:
    return password_hash.hash(password)


def verificar_password(
    password: str,
    hash_guardado: str
) -> bool:
    return password_hash.verify(
        password,
        hash_guardado
    )


def crear_token(usuario_id: int) -> str:
    ahora = datetime.now(timezone.utc)

    expiracion = ahora + timedelta(
        minutes=EXPIRATION_MINUTES
    )

    datos = {
        "sub": str(usuario_id),
        "iat": ahora,
        "exp": expiracion
    }

    token = jwt.encode(
        datos,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


def verificar_token(token: str) -> int | None:
    try:
        datos = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={
                "require": ["sub", "iat", "exp"]
            }
        )

        usuario_id = int(datos["sub"])

        if usuario_id <= 0:
            return None

        return usuario_id

    except (jwt.InvalidTokenError, ValueError, TypeError):
        return None
