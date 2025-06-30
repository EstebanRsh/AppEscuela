from fastapi import APIRouter, Header
from fastapi.responses import JSONResponse
from models.modelo import Career, InputCareer, session, User, PivoteUserCareer, UserDetail
from sqlalchemy import func
from auth.security import Security
from sqlalchemy.orm import joinedload

career = APIRouter()

@career.get("/career/all")
def get_careers():
    return session.query(Career).all()

@career.post("/career/add")
def add_career(ca: InputCareer, authorization: str | None = Header(default=None)):
    """
    Añade una nueva carrera.
    Solo accesible por administradores.
    """
    # 1. Capa de Seguridad
    headers = {"authorization": authorization}
    token_data = Security.verify_token(headers)
    if "username" not in token_data:
        return JSONResponse(status_code=401, content={"message": "Token inválido o no proporcionado."})

    db_session = session
    try:
        admin_user = db_session.query(User).filter(User.username == token_data['username']).first()
        if not admin_user or admin_user.userdetail.type != 'administrador':
            return JSONResponse(status_code=403, content={"message": "Permiso denegado."})

        # 2. Tu lógica original para añadir la carrera
        newCareer = Career(ca.name)
        db_session.add(newCareer)
        db_session.commit()
        res = f"Carrera '{ca.name}' guardada correctamente!"
        print(res)
        return JSONResponse(status_code=201, content={"message": res})
        
    except Exception as ex:
        db_session.rollback()
        print("Error al agregar career --> ", ex)
        return JSONResponse(status_code=500, content={"message": "Error interno al añadir la carrera."})
    finally:
        db_session.close()
@career.get("/career/{career_id}")
def get_career_by_id(career_id: int, authorization: str | None = Header(default=None)):
    """
    Obtiene los datos de una carrera específica por su ID.
    """
    headers = {"authorization": authorization}
    token_data = Security.verify_token(headers)
    if "username" not in token_data:
        return JSONResponse(status_code=401, content={"message": "Token inválido."})

    db_session = session
    try:
        career_data = db_session.query(Career).filter(Career.id == career_id).first()
        if not career_data:
            return JSONResponse(status_code=404, content={"message": "Carrera no encontrada."})
        return {"id": career_data.id, "name": career_data.name}
    finally:
        db_session.close()


@career.put("/career/update/{career_id}")
def update_career(career_id: int, career_update: InputCareer, authorization: str | None = Header(default=None)):
    """
    Actualiza el nombre de una carrera.
    Solo para administradores.
    """
    headers = {"authorization": authorization}
    token_data = Security.verify_token(headers)
    if "username" not in token_data:
        return JSONResponse(status_code=401, content={"message": "Token inválido."})
        
    db_session = session
    try:
        admin_user = db_session.query(User).filter(User.username == token_data['username']).first()
        if not admin_user or admin_user.userdetail.type != 'administrador':
            return JSONResponse(status_code=403, content={"message": "Permiso denegado."})

        career_to_update = db_session.query(Career).filter(Career.id == career_id).first()
        if not career_to_update:
            return JSONResponse(status_code=404, content={"message": "Carrera no encontrada."})

        career_to_update.name = career_update.name
        db_session.commit()
        return JSONResponse(status_code=200, content={"message": "Carrera actualizada con éxito."})
    except Exception as e:
        db_session.rollback()
        return JSONResponse(status_code=500, content={"message": f"Error interno: {e}"})
    finally:
        db_session.close()


@career.delete("/career/delete/{career_id}")
def delete_career(career_id: int, authorization: str | None = Header(default=None)):
    """
    Elimina una carrera.
    Solo para administradores.
    """
    headers = {"authorization": authorization}
    token_data = Security.verify_token(headers)
    if "username" not in token_data:
        return JSONResponse(status_code=401, content={"message": "Token inválido."})

    db_session = session
    try:
        admin_user = db_session.query(User).filter(User.username == token_data['username']).first()
        if not admin_user or admin_user.userdetail.type != 'administrador':
            return JSONResponse(status_code=403, content={"message": "Permiso denegado."})

        career_to_delete = db_session.query(Career).filter(Career.id == career_id).first()
        if not career_to_delete:
            return JSONResponse(status_code=404, content={"message": "Carrera no encontrada."})

        db_session.delete(career_to_delete)
        db_session.commit()
        return JSONResponse(status_code=200, content={"message": "Carrera eliminada con éxito."})
    except Exception as e:
        db_session.rollback()
        # Este error puede ocurrir si un alumno está inscrito en la carrera que intentas borrar.
        print("Error al eliminar carrera:", e)
        return JSONResponse(status_code=409, content={"message": f"Error: No se puede eliminar la carrera, es posible que esté en uso."})
    finally:
        db_session.close()

@career.get("/career/{career_id}/students")
def get_students_in_career(career_id: int, authorization: str | None = Header(default=None)):
    """
    Obtiene todos los alumnos inscritos en una carrera específica.
    Solo para administradores.
    """
    headers = {"authorization": authorization}
    token_data = Security.verify_token(headers)
    if "username" not in token_data:
        return JSONResponse(status_code=401, content={"message": "Token inválido."})

    db_session = session
    try:
        # Verificamos que el que pide es admin
        admin_user = db_session.query(User).filter(User.username == token_data['username']).first()
        if not admin_user or admin_user.userdetail.type != 'administrador':
            return JSONResponse(status_code=403, content={"message": "Permiso denegado."})

        # Buscamos la carrera para asegurarnos de que existe
        career_info = db_session.query(Career).filter(Career.id == career_id).first()
        if not career_info:
            return JSONResponse(status_code=404, content={"message": "Carrera no encontrada."})

        # Buscamos todas las inscripciones para esa carrera
        enrollments = db_session.query(PivoteUserCareer).filter(PivoteUserCareer.id_career == career_id).all()
        
        student_list = []
        for enrollment in enrollments:
            if enrollment.user and enrollment.user.userdetail and enrollment.user.userdetail.type == 'alumno':
                student_data = {
                    "id": enrollment.user.id,
                    "first_name": enrollment.user.userdetail.first_name,
                    "last_name": enrollment.user.userdetail.last_name,
                    "email": enrollment.user.userdetail.email,
                    "dni": enrollment.user.userdetail.dni
                }
                student_list.append(student_data)
        
        return {"career": career_info.name, "students": student_list}

    except Exception as e:
        db_session.rollback()
        return JSONResponse(status_code=500, content={"message": f"Error interno: {e}"})
    finally:
        db_session.close()
    
@career.get("/professor/careers-data")
def get_professor_dashboard_data(authorization: str | None = Header(default=None)):
    """
    Endpoint para el dashboard del profesor.
    Devuelve las carreras asignadas al profesor y el número de alumnos en cada una.
    """
    headers = {"authorization": authorization}
    token_data = Security.verify_token(headers)
    username = token_data.get("username")

    if not username:
        return JSONResponse(status_code=401, content={"message": "Token inválido."})

    db_session = session
    try:
        professor_user = db_session.query(User).options(joinedload(User.userdetail)).filter(User.username == username).first()
        if not professor_user or professor_user.userdetail.type != 'profesor':
            return JSONResponse(status_code=403, content={"message": "Acceso denegado. Se requiere rol de profesor."})

        professor_careers = db_session.query(PivoteUserCareer).filter(PivoteUserCareer.id_user == professor_user.id).all()

        if not professor_careers:
            return []

        dashboard_data = []
        for prof_career in professor_careers:
            enrollments_in_career = db_session.query(PivoteUserCareer).options(
                joinedload(PivoteUserCareer.user).joinedload(User.userdetail)
            ).filter(PivoteUserCareer.id_career == prof_career.id_career).all()
            
            student_count = 0
            for enrollment in enrollments_in_career:
                if enrollment.user and enrollment.user.userdetail and enrollment.user.userdetail.type == 'alumno':
                    student_count += 1

            dashboard_data.append({
                "career_id": prof_career.career.id,
                "career_name": prof_career.career.name,
                "student_count": student_count
            })
            
        return dashboard_data

    except Exception as e:
        db_session.rollback()
        print(f"Error en dashboard de profesor: {e}")
        return JSONResponse(status_code=500, content={"message": "Error interno al obtener los datos del dashboard."})
    finally:
        db_session.close()