import datetime
from models.modelo import User, UserDetail, Career, Payment, PivoteUserCareer, session, Base, engine

def populate_db():
    """
    Script para poblar la base de datos con datos de ejemplo.
    """
    # Crea las tablas si no existen
    print("Verificando y creando tablas si es necesario...")
    Base.metadata.create_all(bind=engine)
    print("¡Tablas listas!")

    print("\n--- Creación de Datos de Ejemplo ---")

    try:
        # --- 1. CREAR CARRERAS ---
        if session.query(Career).count() == 0:
            print("Creando carreras...")
            careers = [
                Career(name="Tecnicatura en Programación"),
                Career(name="Licenciatura en Diseño Gráfico"),
                Career(name="Analista en Marketing Digital")
            ]
            session.add_all(careers)
            session.commit()
            print(f"{len(careers)} carreras creadas.")
        else:
            print("Las carreras ya existen.")
            careers = session.query(Career).all()

        # --- 2. CREAR USUARIOS: ALUMNOS Y PROFESORES ---
        if session.query(User).count() <= 1: # Asumiendo que solo existe el admin
            print("Creando usuarios (alumnos y profesores)...")
            
            # Crear 10 Alumnos
            for i in range(1, 11):
                student_user = User(username=f'alumno{i}', password=f'pass{i}')
                student_detail = UserDetail(
                    first_name=f'NombreAlumno{i}',
                    last_name=f'Apellido{i}',
                    dni=10000000 + i,
                    type='alumno',
                    email=f'alumno{i}@escuela.com'
                )
                student_user.userdetail = student_detail
                session.add(student_user)
                session.commit() # Commit para obtener el ID del usuario

                # Inscribir alumno a carreras
                # El primer alumno se inscribe en las 3 carreras, el resto en una.
                if i == 1:
                    for career in careers:
                        enrollment = PivoteUserCareer(id_user=student_user.id, id_career=career.id)
                        session.add(enrollment)
                else:
                    enrollment = PivoteUserCareer(id_user=student_user.id, id_career=careers[(i-1) % len(careers)].id)
                    session.add(enrollment)
            
            # Crear 10 Profesores
            for i in range(1, 11):
                teacher_user = User(username=f'profesor{i}', password=f'profe{i}')
                teacher_detail = UserDetail(
                    first_name=f'NombreProfesor{i}',
                    last_name=f'ApellidoProfe{i}',
                    dni=20000000 + i,
                    type='profesor',
                    email=f'profesor{i}@escuela.com'
                )
                teacher_user.userdetail = teacher_detail
                session.add(teacher_user)

            session.commit()
            print("20 usuarios (10 alumnos, 10 profesores) creados.")
        else:
            print("Los usuarios de ejemplo ya existen.")

        # --- 3. CREAR PAGOS PARA ALUMNOS ---
        if session.query(Payment).count() == 0:
            print("Creando pagos de ejemplo...")
            students = session.query(User).join(UserDetail).filter(UserDetail.type == 'alumno').all()
            for student in students[:5]: # Crear pagos para los primeros 5 alumnos
                # Asumimos que el pago es para la primera carrera en la que está inscrito
                first_enrollment = session.query(PivoteUserCareer).filter(PivoteUserCareer.id_user == student.id).first()
                if first_enrollment:
                    new_payment = Payment(
                        id_user=student.id,
                        id_career=first_enrollment.id_career,
                        amount=15000,
                        affected_month=datetime.date(2024, 5, 1) # Mes de Mayo 2024
                    )
                    session.add(new_payment)
            session.commit()
            print("Pagos de ejemplo creados.")
        else:
            print("Los pagos de ejemplo ya existen.")

        print("\n¡Éxito! La base de datos ha sido poblada con datos de ejemplo.")

    except Exception as e:
        session.rollback()
        print(f"\nOcurrió un error: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    populate_db()

# python populate_db.py