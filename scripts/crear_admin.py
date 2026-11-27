from getpass import getpass
from pydantic import EmailStr, TypeAdapter, ValidationError
from psycopg.errors import UniqueViolation

from database.conexion import conectar
from core.security import generar_hash


def crear_admin():

    print("\n=== EnterpriseFlow - Crear administrador ===\n")

    nombre = input("Nombre: ").strip()
    email = input("Correo electrónico: ").strip().lower()

    if not 3 <= len(nombre) <= 100:
        print("El nombre debe tener entre 3 y 100 caracteres.")
        return

    try:
        email = TypeAdapter(EmailStr).validate_python(email)
    except ValidationError:
        print("El correo electrónico no es válido.")
        return

    if len(email) > 150:
        print("El correo electrónico es demasiado largo.")
        return

    password = getpass("Contraseña: ")
    confirmar = getpass("Confirmar contraseña: ")

    if not 8 <= len(password) <= 128:
        print("La contraseña debe tener entre 8 y 128 caracteres.")
        return

    if password != confirmar:
        print("Las contraseñas no coinciden.")
        return

    try:
        with conectar() as conexion:
            with conexion.cursor() as cursor:

                cursor.execute(
                    """
                    INSERT INTO usuarios
                    (nombre, email, password_hash, rol, activo)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (
                        nombre,
                        email,
                        generar_hash(password),
                        "admin",
                        True
                    )
                )

        print("\nAdministrador creado correctamente.")

    except UniqueViolation:
        print("\nEl correo electrónico ya está registrado.")

    except Exception:
        print("\nNo se pudo crear el administrador.")


if __name__ == "__main__":
    crear_admin()