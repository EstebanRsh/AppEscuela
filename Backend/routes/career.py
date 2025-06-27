from fastapi import APIRouter, Header, JSONResponse
from models.modelo import Career, InputCareer, session, User
from auth.security import Security

career = APIRouter()

@career.get("/career/all")
# Esta ruta puede ser accedida por cualquier usuario logueado, no necesita seguridad de admin.
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
