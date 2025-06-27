from models.modelo import User, UserDetail, session, Base, engine # <-- Importamos Base y engine

def create_first_admin():
    """
    Script para crear el usuario administrador inicial.
    También se asegura de que todas las tablas de la DB existan.
    """
    # --- INICIO DE LA CORRECCIÓN ---
    # Esta línea crea todas las tablas definidas en tus modelos si no existen.
    # Es el paso que faltaba.
    print("Verificando y creando tablas si es necesario...")
    Base.metadata.create_all(bind=engine)
    print("¡Tablas listas!")
    # --- FIN DE LA CORRECCIÓN ---

    print("\n--- Creación del Usuario Administrador Inicial ---")

    # Verificamos si ya existe algún administrador para no crear duplicados
    existing_admin = session.query(UserDetail).filter(UserDetail.type == 'administrador').first()
    if existing_admin:
        print(f"Error: Ya existe un administrador en el sistema ({existing_admin.email}).")
        print("No se creará un nuevo usuario.")
        session.close() # Cerramos la sesión aquí también
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
        session.close() # Cerramos la sesión aquí también
        return

    # Creamos las instancias de los modelos
    try:
        print("Creando usuario...")
        new_user = User(username=username, password=password)
        new_user_detail = UserDetail(
            first_name=first_name,
            last_name=last_name,
            dni=dni,
            type='administrador',
            email=email
        )
        new_user.userdetail = new_user_detail
        session.add(new_user)
        session.commit()
        
        print("\n¡Éxito! El usuario administrador ha sido creado.")
        print("Ya puedes iniciar el servidor y loguearte con esta cuenta.")

    except Exception as e:
        session.rollback()
        print(f"\nOcurrió un error al intentar crear el usuario: {e}")
        print("Por favor, inténtalo de nuevo.")
    finally:
        session.close()


if __name__ == "__main__":
    create_first_admin()