from sqlalchemy.exc import IntegrityError
from fastapi import APIRouter, Request, Header, File, UploadFile
from fastapi.responses import JSONResponse
from models.modelo import session, User, UserDetail, PivoteUserCareer, InputUser, InputLogin, InputUserAddCareer, InputUserUpdate, InputPasswordChange
from sqlalchemy.orm import joinedload
from auth.security import Security
import shutil
import os
import uuid 
import traceback

user = APIRouter()


@user.get("/")
### funcion helloUer documentacion
def helloUser():
    return "Hello User!!!"

@user.get("/users/all")
### funcion helloUer documentacion
def getAllUsers(req: Request):
    try:
        has_access = Security.verify_token(req.headers)
        if "iat" in has_access:
            usersWithDetail = session.query(User).options(joinedload(User.userdetail)).all()
            usuarios_con_detalle = []
            for user in usersWithDetail:
                user_con_detalle = {
                    "id": user.id,
                    "username": user.username,
                    "password": user.password,
                    "first_name": user.userdetail.first_name,
                    "last_name": user.userdetail.last_name,
                    "dni": user.userdetail.dni,
                    "type": user.userdetail.type,
                    "email": user.userdetail.email,
                }
                usuarios_con_detalle.append(user_con_detalle)
            return JSONResponse(status_code=200, content=usuarios_con_detalle)
        else: 
            return JSONResponse(
                status_code=401,
                content=has_access
            )
    except Exception as ex:
        print("Error ---->> ", ex)
        return {"message": "Error al obtener los usuarios"}
    
@user.get("/users/{us}/{pw}")
### funcion helloUer documentacion
def loginUser(us:str, pw:str):
    usu = session.query(User).filter(User.username==us).first()
    if usu is None:
        return "Usuario no encontrado!"
    if usu.password==pw: 
        return "Usuario logueado con éxito!"
    else:
        return "Contraseña incorrecta!"

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


## Inscribir un alumno a una carrera      
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
    try:
        userEncontrado = session.query(User).filter(User.username == _username ).first()
        arraySalida = []
        if(userEncontrado):
            pivoteusercareer = userEncontrado.pivoteusercareer
            for pivote in pivoteusercareer:
                career_detail = {
                    "usuario": f"{pivote.user.userdetail.first_name} {pivote.user.userdetail.last_name}",
                    "carrera": pivote.career.name,
                }
                arraySalida.append(career_detail)
            return arraySalida
        else:
            return "Usuario no encontrado!"
    except Exception as ex:
        session.rollback()
        print("Error al traer usuario y/o pagos")
    finally:
        session.close()

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
            "email": user_data.userdetail.email
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