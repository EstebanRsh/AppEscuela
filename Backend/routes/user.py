from sqlalchemy.exc import IntegrityError
from fastapi import APIRouter, Request, Header, File, UploadFile
from fastapi.responses import JSONResponse
from models.modelo import session, User, UserDetail, PivoteUserCareer, InputUser, InputLogin, InputUserAddCareer, InputUserUpdate, InputPasswordChange, InputAdminPasswordReset
from sqlalchemy.orm import joinedload, subqueryload
from auth.security import Security
import shutil
import os
import uuid 
import traceback

user = APIRouter()


@user.get("/")
def helloUser():
    return "Hello User!!!"

@user.get("/users/all")
def getAllUsers(req: Request):
    try:
        has_access = Security.verify_token(req.headers)
        if "iat" not in has_access:
            return JSONResponse(status_code=401, content=has_access)
        
        users_query = session.query(User).options(
            joinedload(User.userdetail),
            subqueryload(User.pivoteusercareer).joinedload(PivoteUserCareer.career)
        ).all()
        
        result_list = []
        for user_item in users_query:
            user_careers = [p.career.name for p in user_item.pivoteusercareer if p.career]
            result_list.append({
                "id": user_item.id,
                "username": user_item.username,
                "first_name": user_item.userdetail.first_name,
                "last_name": user_item.userdetail.last_name,
                "dni": user_item.userdetail.dni,
                "type": user_item.userdetail.type,
                "email": user_item.userdetail.email,
                "careers": user_careers
            })
        return JSONResponse(status_code=200, content=result_list)

    except Exception as ex:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"message": "Error interno al obtener los usuarios"})
    finally:
        session.close()

@user.post("/users/add")
def create_user(us: InputUser, authorization: str | None = Header(default=None)):
    headers = {"authorization": authorization}
    token_data = Security.verify_token(headers)

    if "username" not in token_data:
        return JSONResponse(status_code=401, content={"message": "No estás autorizado o el token es inválido."})

    requesting_user_username = token_data["username"]
    requesting_user = session.query(User).filter(User.username == requesting_user_username).options(joinedload(User.userdetail)).first()

    if not requesting_user or requesting_user.userdetail.type != 'administrador':
        return JSONResponse(status_code=403, content={"message": "Permiso denegado. Se requiere rol de administrador."})

    try:
        newUser = User(us.username, us.password)
        newUserDetail = UserDetail(us.firstname, us.lastname, us.dni, us.type, us.email)
        newUser.userdetail = newUserDetail
        session.add(newUser)
        session.commit()
        return JSONResponse(status_code=201, content={"message": "Usuario creado con éxito!"})
    
    # --- INICIO DE LA CORRECCIÓN ---
    except IntegrityError:
        # Esta excepción se dispara si se viola una restricción UNIQUE (username o email)
        session.rollback()
        return JSONResponse(status_code=409, content={"message": "El nombre de usuario o el email ya existen."})
    except Exception as ex:
        # El resto de los errores inesperados
        session.rollback()
        print("Error ---->> ", ex)
        return JSONResponse(status_code=500, content={"message": "Error interno al crear el usuario."})
    # --- FIN DE LA CORRECCIÓN ---
    finally:
        session.close()

@user.post("/user/upload-photo")
def upload_profile_photo(authorization: str | None = Header(default=None), file: UploadFile = File(...)):
    """
    Permite a un usuario logueado subir o cambiar su foto de perfil.
    """
    headers = {"authorization": authorization}
    token_data = Security.verify_token(headers)
    username = token_data.get("username")
    if not username:
        return JSONResponse(status_code=401, content={"message": "Token inválido."})

    db_session = session
    try:
        user_to_update = db_session.query(User).options(joinedload(User.userdetail)).filter(User.username == username).first()
        if not user_to_update:
            return JSONResponse(status_code=404, content={"message": "Usuario no encontrado."})
        
        # Generar un nombre de archivo único para evitar colisiones
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = f"static/profile_pics/{unique_filename}"
        
        # Guardar el archivo en el servidor
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Guardar la URL en la base de datos
        # La URL debe ser accesible desde el frontend
        image_url = f"/static/profile_pics/{unique_filename}"
        user_to_update.userdetail.profile_image_url = image_url
        db_session.commit()

        return JSONResponse(status_code=200, content={"message": "Foto de perfil actualizada con éxito.", "image_url": image_url})

    except Exception as e:
        db_session.rollback()
        print("--- OCURRIÓ UN ERROR INTERNO DETALLADO ---")
        # Esta línea imprimirá el traceback completo en tu consola de uvicorn
        traceback.print_exc()
        print("-----------------------------------------")
        return JSONResponse(status_code=500, content={"message": f"Error interno: {e}"})
    finally:
        db_session.close()
@user.post("/users/login")
def login_user(us: InputLogin):
    try:
        # Buscamos al usuario y cargamos su detalle en la misma consulta
        user = session.query(User).options(joinedload(User.userdetail)).filter(User.username == us.username).first()
        
        if user and user.password == us.password:
            tkn = Security.generate_token(user)
            if not tkn:
                return JSONResponse(status_code=500, content={"message":"Error en la generación del token!"})
            else:
                # Construimos el objeto de usuario explícitamente para la respuesta
                user_details = {
                    "id": user.userdetail.id,
                    "username": user.username,
                    "first_name": user.userdetail.first_name,
                    "last_name": user.userdetail.last_name,
                    "dni": user.userdetail.dni,
                    "type": user.userdetail.type,  # Clave para la lógica del frontend
                    "email": user.userdetail.email,
                    "profile_image_url": user.userdetail.profile_image_url
                }
                
                res = {
                        "status": "success",
                        "token": tkn,
                        "user": user_details, # Enviamos el diccionario que creamos
                        "message":"User logged in successfully!"
                    }
                return JSONResponse(status_code=200, content=res)
        else:
            res= {"message": "Invalid username or password"}
            return JSONResponse(status_code=401, content=res)
    except Exception as ex:
        print("Error ---->> ", ex)
        return JSONResponse(status_code=500, content={"message":"Error interno en el servidor."})
    finally:
        session.close()   
@user.post("/user/addcareer")
def addCareer(ins: InputUserAddCareer, authorization: str | None = Header(default=None)):
    """
    Inscribe un alumno a una carrera.
    Solo accesible por administradores.
    """
    headers = {"authorization": authorization}
    token_data = Security.verify_token(headers)
    if "username" not in token_data:
        return JSONResponse(status_code=401, content={"message": "Token inválido o no proporcionado."})
    db_session = session
    try:
        admin_user = db_session.query(User).filter(User.username == token_data['username']).first()
        if not admin_user or admin_user.userdetail.type != 'administrador':
            return JSONResponse(status_code=403, content={"message": "Permiso denegado. Se requiere rol de administrador."})
        newInsc = PivoteUserCareer(ins.id_user, ins.id_career)
        db_session.add(newInsc)
        db_session.commit()
        res = f"{newInsc.user.userdetail.first_name} {newInsc.user.userdetail.last_name} fue inscripto correctamente a {newInsc.career.name}"
        print(res)
        return JSONResponse(status_code=201, content={"message": res})

    except Exception as ex:
        db_session.rollback()
        print("Error al inscribir al alumno:", ex)
        return JSONResponse(status_code=500, content={"message": "Error interno al procesar la inscripción."})
    finally:
        db_session.close()
@user.get("/user/career/{_username}")
def get_career_user(_username: str):
    db_session = session
    try:
        user_found = db_session.query(User).filter(User.username == _username).first()
        if not user_found:
            return JSONResponse(status_code=404, content=[]) # Devuelve array vacío si no se encuentra
        
        # Devuelve siempre un array, incluso si está vacío.
        user_careers = [{"carrera": p.career.name} for p in user_found.pivoteusercareer if p.career]
        return user_careers
    except Exception:
        return JSONResponse(status_code=500, content={"message": "Error al traer las carreras del usuario"})
    finally:
        db_session.close()

# --- RUTAS DE GESTIÓN DE CARRERAS (Refactorizadas y funcionales) ---

@user.post("/users/{user_id}/careers")
def assign_career_to_user(user_id: int, career_data: dict, authorization: str | None = Header(default=None)):
    headers = {"authorization": authorization}
    token_data = Security.verify_token(headers)
    if "username" not in token_data: return JSONResponse(status_code=401, content={"message": "Token inválido."})
    
    db_session = session
    try:
        admin_user = db_session.query(User).filter(User.username == token_data['username']).first()
        if not admin_user or admin_user.userdetail.type != 'administrador':
            return JSONResponse(status_code=403, content={"message": "Permiso denegado."})

        career_id = career_data.get("id")
        if not career_id: return JSONResponse(status_code=400, content={"message": "Falta el ID de la carrera."})

        existing = db_session.query(PivoteUserCareer).filter_by(id_user=user_id, id_career=career_id).first()
        if existing: return JSONResponse(status_code=409, content={"message": "El usuario ya está inscrito en esta carrera."})

        new_enrollment = PivoteUserCareer(id_user=user_id, id_career=career_id)
        db_session.add(new_enrollment)
        db_session.commit()
        return JSONResponse(status_code=201, content={"message": "Carrera asignada con éxito."})

    except Exception:
        db_session.rollback()
        return JSONResponse(status_code=500, content={"message": "Error interno al asignar la carrera."})
    finally:
        db_session.close()
@user.get("/user/{user_id}")
def get_user_by_id(user_id: int, authorization: str | None = Header(default=None)):
    """
    Obtiene los detalles de un usuario específico por su ID.
    Solo accesible por administradores.
    """
    # 1. Seguridad: Verificamos que quien pide la info sea un admin
    headers = {"authorization": authorization}
    token_data = Security.verify_token(headers)
    if "username" not in token_data:
        # Reemplazamos HTTPException con JSONResponse
        return JSONResponse(status_code=401, content={"message": "Token inválido o no proporcionado."})

    db_session = session
    try:
        admin_user = db_session.query(User).filter(User.username == token_data['username']).first()
        if not admin_user or admin_user.userdetail.type != 'administrador':
            # Reemplazamos HTTPException con JSONResponse
            return JSONResponse(status_code=403, content={"message": "Permiso denegado."})

        # 2. Búsqueda del usuario solicitado
        user_data = db_session.query(User).options(joinedload(User.userdetail)).filter(User.id == user_id).first()

        if not user_data:
            # Reemplazamos HTTPException con JSONResponse
            return JSONResponse(status_code=404, content={"message": "Usuario no encontrado."})

        # 3. Preparamos y devolvemos los datos
        user_details = {
            "id": user_data.id, # Usamos el id del User, no del UserDetail para consistencia
            "first_name": user_data.userdetail.first_name,
            "last_name": user_data.userdetail.last_name,
            "dni": user_data.userdetail.dni,
            "type": user_data.userdetail.type,
            "email": user_data.userdetail.email,
            "username": user_data.username
        }
        return JSONResponse(status_code=200, content=user_details)

    except Exception as ex:
        print(f"Error al obtener usuario: {ex}")
        # Reemplazamos HTTPException con JSONResponse
        return JSONResponse(status_code=500, content={"message": "Error interno del servidor."})
    finally:
        db_session.close()  
@user.put("/user/update/{user_id}")
def update_user(user_id: int, user_update: InputUserUpdate, authorization: str | None = Header(default=None)):
    """
    Actualiza los detalles de un usuario.
    Solo accesible por administradores.
    """
    headers = {"authorization": authorization}
    token_data = Security.verify_token(headers)
    if "username" not in token_data:
        return JSONResponse(status_code=401, content={"message": "Token inválido o no proporcionado."})

    db_session = session
    try:
        admin_user = db_session.query(User).filter(User.username == token_data['username']).first()
        if not admin_user or admin_user.userdetail.type != 'administrador':
            return JSONResponse(status_code=403, content={"message": "Permiso denegado."})

        # Buscamos al usuario que se quiere actualizar y su detalle
        user_to_update = db_session.query(User).options(joinedload(User.userdetail)).filter(User.id == user_id).first()
        
        if not user_to_update:
            return JSONResponse(status_code=404, content={"message": "Usuario a actualizar no encontrado."})

        # Actualizamos los campos del UserDetail asociado
        user_detail = user_to_update.userdetail
        user_detail.first_name = user_update.first_name
        user_detail.last_name = user_update.last_name
        user_detail.dni = user_update.dni
        user_detail.type = user_update.type
        user_detail.email = user_update.email
        
        db_session.commit()
        return JSONResponse(status_code=200, content={"message": "Usuario actualizado con éxito."})

    except IntegrityError:
        # Esto ocurre si el nuevo email ya está en uso por otro usuario
        db_session.rollback()
        return JSONResponse(status_code=409, content={"message": "El email ya está en uso por otro usuario."})
    except Exception as ex:
        db_session.rollback()
        print(f"Error al actualizar usuario: {ex}")
        return JSONResponse(status_code=500, content={"message": "Error interno del servidor."})
    finally:
        db_session.close()
@user.get("/user/delete/{user_id}")
def delete_user(user_id: int, authorization: str | None = Header(default=None)):
    """
    Elimina un usuario y sus datos asociados.
    Solo accesible por administradores.
    """
    headers = {"authorization": authorization}
    token_data = Security.verify_token(headers)
    if "username" not in token_data:
        return JSONResponse(status_code=401, content={"message": "Token inválido o no proporcionado."})

    db_session = session
    try:
        admin_user = db_session.query(User).filter(User.username == token_data['username']).first()
        if not admin_user or admin_user.userdetail.type != 'administrador':
            return JSONResponse(status_code=403, content={"message": "Permiso denegado."})
        
        # Un admin no se puede eliminar a sí mismo
        if admin_user.id == user_id:
            return JSONResponse(status_code=400, content={"message": "No puedes eliminar tu propia cuenta."})

        # Lógica de borrado simplificada
        user_to_delete = db_session.query(User).filter(User.id == user_id).first()
        if not user_to_delete:
            return JSONResponse(status_code=404, content={"message": "Usuario no encontrado."})

        # Gracias al 'cascade', solo necesitamos borrar el usuario principal.
        db_session.delete(user_to_delete)
        db_session.commit()
        
        return JSONResponse(status_code=200, content={"message": "Usuario eliminado con éxito."})

    except Exception as ex:
        db_session.rollback()
        print(f"Error al eliminar usuario: {ex}")
        return JSONResponse(status_code=500, content={"message": "Error interno del servidor."})
    finally:
        db_session.close()
@user.post("/user/change-password/self")
def change_own_password(pass_data: InputPasswordChange, authorization: str | None = Header(default=None)):
    """
    Permite a un usuario logueado cambiar su propia contraseña,
    verificando primero la contraseña actual.
    """
    headers = {"authorization": authorization}
    token_data = Security.verify_token(headers)
    username = token_data.get("username")
    if not username:
        return JSONResponse(status_code=401, content={"message": "Token inválido."})

    db_session = session
    try:
        # 1. Buscamos al usuario por el username del token
        user_to_update = db_session.query(User).filter(User.username == username).first()
        if not user_to_update:
            return JSONResponse(status_code=404, content={"message": "Usuario no encontrado."})
        
        # 2. Verificamos que la contraseña actual sea correcta
        if user_to_update.password != pass_data.current_password:
            return JSONResponse(status_code=403, content={"message": "La contraseña actual es incorrecta."})

        # 3. Si todo es correcto, actualizamos a la nueva contraseña
        user_to_update.password = pass_data.new_password
        db_session.commit()
        
        return JSONResponse(status_code=200, content={"message": "Contraseña actualizada con éxito."})

    except Exception as e:
        db_session.rollback()
        return JSONResponse(status_code=500, content={"message": f"Error interno: {e}"})
    finally:
        db_session.close()
@user.post("/user/reset-password/admin/{user_id}")
def admin_reset_password(user_id: int, pass_data: InputAdminPasswordReset, authorization: str | None = Header(default=None)):
    """
    Permite a un administrador restablecer la contraseña de cualquier usuario.
    """
    headers = {"authorization": authorization}
    token_data = Security.verify_token(headers)
    
    # 1. Verificar que el solicitante es un administrador
    requesting_user_username = token_data.get("username")
    if not requesting_user_username:
        return JSONResponse(status_code=401, content={"message": "Token inválido."})

    db_session = session
    try:
        admin_user = db_session.query(User).options(joinedload(User.userdetail)).filter(User.username == requesting_user_username).first()
        if not admin_user or admin_user.userdetail.type != 'administrador':
            return JSONResponse(status_code=403, content={"message": "Permiso denegado. Se requiere rol de administrador."})

        # 2. No permitir que un admin se cambie la contraseña a sí mismo por esta vía
        if admin_user.id == user_id:
            return JSONResponse(status_code=400, content={"message": "Usa la opción 'Mi Perfil' para cambiar tu propia contraseña."})

        # 3. Encontrar y actualizar al usuario objetivo
        user_to_update = db_session.query(User).filter(User.id == user_id).first()
        if not user_to_update:
            return JSONResponse(status_code=404, content={"message": "Usuario no encontrado."})
        
        # 4. Actualizar la contraseña
        user_to_update.password = pass_data.new_password
        db_session.commit()
        
        return JSONResponse(status_code=200, content={"message": f"La contraseña para {user_to_update.username} ha sido actualizada con éxito."})

    except Exception as e:
        db_session.rollback()
        return JSONResponse(status_code=500, content={"message": f"Error interno: {e}"})
    finally:
        db_session.close()

@user.delete("/users/{user_id}/careers/{career_id}")
def unassign_career_from_user(user_id: int, career_id: int, authorization: str | None = Header(default=None)):
    headers = {"authorization": authorization}
    token_data = Security.verify_token(headers)
    if "username" not in token_data: return JSONResponse(status_code=401, content={"message": "Token inválido."})
    
    db_session = session
    try:
        admin_user = db_session.query(User).filter(User.username == token_data['username']).first()
        if not admin_user or admin_user.userdetail.type != 'administrador':
            return JSONResponse(status_code=403, content={"message": "Permiso denegado."})

        enrollment = db_session.query(PivoteUserCareer).filter_by(id_user=user_id, id_career=career_id).first()
        if not enrollment: return JSONResponse(status_code=404, content={"message": "Inscripción no encontrada."})

        db_session.delete(enrollment)
        db_session.commit()
        return JSONResponse(status_code=200, content={"message": "Carrera quitada con éxito."})

    except Exception:
        db_session.rollback()
        return JSONResponse(status_code=500, content={"message": "Error interno al quitar la carrera."})
    finally:
        db_session.close()