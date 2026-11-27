import os
import psycopg
from dotenv import load_dotenv

load_dotenv()


def conectar():

    database_url = os.getenv("DATABASE_URL")

    # Conexión a PostgreSQL en la nube

    if database_url:
        return psycopg.connect(
            database_url,
            sslmode="require",
            connect_timeout=15
        )

    # Conexión a PostgreSQL local

    return psycopg.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        connect_timeout=15
    )