from models.modelo import User, UserDetail, session

def create_first_admin():
    """
    Script para crear el usuario administrador inicial.
    Pide los datos por consola.
    """
    print("--- Creación del Usuario Administrador Inicial ---")

    # Verificamos si ya existe algún administrador para no crear duplicados
    existing_admin = session.query(UserDetail).filter(UserDetail.type == 'administrador').first()
    if existing_admin:
        print(f"Error: Ya existe un administrador en el sistema ({existing_admin.email}).")
        print("No se creará un nuevo usuario.")
        return

    # Pedimos los datos por consola
    username = input("Ingrese el nombre de usuario del admin: ")
    password = input("Ingrese la contraseña del admin: ")
    first_name = input("Ingrese el nombre: ")
    last_name = input("Ingrese el apellido: ")
    email = input(f"Ingrese el email (ej: {username}@escuela.com): ")
    try:
        dni = int(input("Ingrese el DNI: "))
    except ValueError:
        print("Error: El DNI debe ser un número.")
        return

    # Creamos las instancias de los modelos
    try:
        print("Creando usuario...")
        new_user = User(username=username, password=password)
        new_user_detail = UserDetail(
            first_name=first_name,
            last_name=last_name,
            dni=dni,
            type='administrador',  # Forzamos el tipo a 'administrador'
            email=email
        )

        # Asociamos el detalle con el usuario
        new_user.userdetail = new_user_detail

        # Guardamos en la base de datos
        session.add(new_user)
        session.commit()
        
        print("\n¡Éxito! El usuario administrador ha sido creado.")
        print(f"Username: {username}")
        print("Ya puedes iniciar el servidor y loguearte con esta cuenta.")

    except Exception as e:
        session.rollback()
        print(f"\nOcurrió un error al intentar crear el usuario: {e}")
        print("Por favor, inténtalo de nuevo.")
    finally:
        session.close()


if __name__ == "__main__":
    create_first_admin()

# ejecutar en la terminal python create_admin.py