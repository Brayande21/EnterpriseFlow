
from database.conexion import conectar

print("Iniciando conexión con PostgreSQL...")

try:
    with conectar() as conexion:
        print("¡Conexión exitosa con PostgreSQL!")

except Exception as error:
    print("Error de conexión:")
    print(type(error).__name__)
    print(error)
