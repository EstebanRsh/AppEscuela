from sqlalchemy.exc import IntegrityError  
# clase de excepción específica que se lanza cuando se viola una restricción de integridad en la base de datos (p. ej., insertar un valor duplicado en una columna única)
# muy útil para manejar errores de bases de datos de manera controlada 
from fastapi import APIRouter, Request, Header, File, UploadFile
# APIRouter (clase de FastAPI que permite organizar la API en módulos separados y reutilizables, agrupa rutas relacionadas)
# Request (representa la solicitud HTTP entrante, permite acceder a cuerpo, encabezado, parámetros de ruta, etc.)
# Header (función para declarar parámetros de encabezado HTTP)
# File (función para declarar que un parámetro de ruta o de cuerpo es un archivo)
# UploadFile (clase que proporciona una interfaz para manejar archivos subidos)
from fastapi.responses import JSONResponse   # clase que permite devolver respuestas HTTP con un cuerpo JSON de forma explícita
from models.modelo import session, User, UserDetail, PivoteUserCareer, InputUser, InputLogin, InputUserAddCareer, InputUserUpdate, InputPasswordChange, InputAdminPasswordReset
# importa una sesión, modelos de sqlalchemy y modelos de pydantic
from sqlalchemy.orm import joinedload, subqueryload   # técnicas de carga ansiosa (eager loading)
# joinedload (Permite cargar datos de relaciones (por ejemplo, los UserDetail de un User) en la misma consulta SQL utilizando un JOIN)
# Esto evita el problema de las "N+1 consultas" donde se haría una consulta separada para cada objeto relacionado.
# subqueryload (Carga los datos de las relaciones utilizando una subconsulta separada en lugar de un JOIN principal)
# alternativa a joinedload 
from auth.security import Security   # importa la clase Security
import shutil  # módulo de utilidad de alto nivel para operaciones de archivos y directorios (para copiar, mover, eliminar archivos o directorios, etc.)
import os   # módulo proporciona una forma de interactuar con el sistema operativo (operaciones como crear un directorio, listar el contenido de un directorio, etc.)
import uuid # módulo para generar Identificadores Únicos Universales (UUIDs)(muy útiles para generar nombres de archivo únicos para los archivos subidos, evitando colisiones de nombres)
import traceback   # muy útil para la depuración, ya que proporciona información detallada sobre dónde ocurrió un error en el código

user = APIRouter()


@user.get("/")
def helloUser():
    return "Hello User!!!"

@user.get("/users/all")   
def getAllUsers(req: Request):   
    """
    Endpoint para obtener la lista de todos los usuarios registrados.
    Requiere autenticación JWT. Devuelve los detalles del usuario y las carreras asociadas.
    """
    try:
        # Verifica el token de autorización presente en los encabezados de la solicitud.
        # Si el token no es válido (expirado, firma inválida, etc.),
        # Security.verify_token devolverá un diccionario de error.
        has_access = Security.verify_token(req.headers)

        # Si el payload decodificado del token no contiene la clave "iat" (issued at),
        # significa que la verificación del token falló.
        if "iat" not in has_access:
            # Devuelve una respuesta JSON con un código de estado 401 (Unauthorized)
            # y el mensaje de error proporcionado por Security.verify_token.
            return JSONResponse(status_code=401, content=has_access)
        
        # Realiza una consulta a la base de datos para obtener todos los objetos User.
        # joinedload(User.userdetail): Carga ansiosamente los detalles del usuario (UserDetail)
        # utilizando un JOIN en la misma consulta para evitar el problema N+1.
        # subqueryload(User.pivoteusercareer).joinedload(PivoteUserCareer.career):
        # Carga ansiosamente las relaciones de carrera del usuario. Primero, carga la tabla pivote
        # (PivoteUserCareer) con una subconsulta, y luego carga los detalles de la carrera (Career)
        # mediante un JOIN dentro de esa subconsulta.
        users_query = session.query(User).options(
            joinedload(User.userdetail),
            subqueryload(User.pivoteusercareer).joinedload(PivoteUserCareer.career)
        ).all()
        
        result_list = []
        # Itera sobre cada objeto User obtenido de la consulta.
        for user_item in users_query:
            # Crea una lista de los nombres de las carreras asociadas a este usuario.
            # Itera a través de los objetos PivoteUserCareer y extrae el nombre de la carrera.
            user_careers = [p.career.name for p in user_item.pivoteusercareer if p.career]

            # Agrega un diccionario a la lista de resultados con la información formateada del usuario.
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
        # Devuelve una respuesta JSON con un código de estado 200 (OK)
        # y la lista de usuarios formateada.
        return JSONResponse(status_code=200, content=result_list)

    except Exception as ex:
        # Imprime el rastreo completo de la excepción en la consola del servidor para depuración.
        traceback.print_exc()
        # Devuelve una respuesta JSON con un código de estado 500 (Internal Server Error)
        # y un mensaje genérico de error.
        return JSONResponse(status_code=500, content={"message": "Error interno al obtener los usuarios"})
    finally:
        # Asegura que la sesión de la base de datos se cierre, liberando los recursos de conexión.
        session.close()

@user.post("/users/add")   
def create_user(us: InputUser, authorization: str | None = Header(default=None)):
    """
    Endpoint para crear un nuevo usuario.
    Requiere autenticación JWT y que el usuario que realiza la solicitud sea un 'administrador'.
    """
    # Construye un diccionario de encabezados para pasarlo a la función de verificación del token.
    headers = {"authorization": authorization}
    # Verifica la validez del token JWT proporcionado en los encabezados.
    token_data = Security.verify_token(headers)

    # Si el payload del token no contiene la clave 'username', significa que el token es inválido o falta.
    if "username" not in token_data:
        # Retorna un error de no autorizado.
        return JSONResponse(status_code=401, content={"message": "No estás autorizado o el token es inválido."})

    # Extrae el nombre de usuario del token decodificado para identificar al usuario que hace la solicitud.
    requesting_user_username = token_data["username"]
    # Consulta la base de datos para obtener los detalles del usuario que está haciendo la solicitud.
    # joinedload(User.userdetail) carga ansiosamente los detalles del usuario para evitar consultas adicionales.
    requesting_user = session.query(User).filter(User.username == requesting_user_username).options(joinedload(User.userdetail)).first()

    # Verifica si el usuario que solicita la creación existe y si su tipo de usuario es 'administrador'.
    # Si no cumple alguna de estas condiciones, se deniega el permiso.
    if not requesting_user or requesting_user.userdetail.type != 'administrador':
        return JSONResponse(status_code=403, content={"message": "Permiso denegado. Se requiere rol de administrador."})

    try:
        # Crea una nueva instancia de User con el nombre de usuario y contraseña proporcionados.
        newUser = User(us.username, us.password)
        # Crea una nueva instancia de UserDetail con la información detallada del usuario.
        newUserDetail = UserDetail(us.firstname, us.lastname, us.dni, us.type, us.email)
        # Asocia los detalles del usuario con el nuevo usuario.
        newUser.userdetail = newUserDetail
        # Añade el nuevo usuario (y sus detalles, gracias a la relación) a la sesión de la base de datos.
        session.add(newUser)
        # Confirma la transacción, guardando el nuevo usuario en la base de datos.
        session.commit()
        # Retorna una respuesta de éxito con el código de estado 201 (Created).
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
    # Construye un diccionario de encabezados a partir del parámetro 'authorization'.
    headers = {"authorization": authorization}
    # Llama al método estático verify_token de la clase Security para decodificar y validar el token JWT.
    # Si el token es válido, token_data contendrá el payload del token (un diccionario).
    token_data = Security.verify_token(headers)
    # Intenta obtener el 'username' del payload del token.
    username = token_data.get("username")

    # Si 'username' es None (lo que significa que no se encontró en el payload del token, o si es una cadena vacía)
    # Devuelve una respuesta JSON
    if not username:
        return JSONResponse(status_code=401, content={"message": "Token inválido."})

    # Renombra la variable 'session' a 'db_session' para mayor claridad y para evitar posibles confusiones
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
                        "message":"Logueado exitosamente!"
                    }
                return JSONResponse(status_code=200, content=res)
        else:
            res= {"message": "Usuario o contraseña inválidos"}
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
    """
    Endpoint para obtener las carreras asociadas a un usuario específico por su nombre de usuario.
    La ruta incluye un parámetro de ruta '_username' para identificar al usuario.
    """
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

# =================================================================================
# --- RUTAS DE GESTIÓN DE CARRERAS (Refactorizadas y funcionales) ---
# =================================================================================

@user.post("/users/{user_id}/careers")
def assign_career_to_user(user_id: int, career_data: dict, authorization: str | None = Header(default=None)):
    """
    Endpoint para asignar una carrera a un usuario específico.
    Requiere autenticación JWT y que el usuario que realiza la solicitud sea un 'administrador'.
    
    Args:
        user_id (int): El ID del usuario al que se asignará la carrera.
        career_data (dict): Un diccionario que debe contener el 'id' de la carrera a asignar.
        authorization (str | None): El token JWT en el encabezado 'Authorization'.
    """
    headers = {"authorization": authorization}
    token_data = Security.verify_token(headers)
    if "username" not in token_data: return JSONResponse(status_code=401, content={"message": "Token inválido."})
    
    db_session = session
    try:
        # Busca al usuario administrador que está realizando la solicitud por su nombre de usuario del token.
        admin_user = db_session.query(User).filter(User.username == token_data['username']).first()
        if not admin_user or admin_user.userdetail.type != 'administrador':
            return JSONResponse(status_code=403, content={"message": "Permiso denegado."})

        career_id = career_data.get("id")
        if not career_id: return JSONResponse(status_code=400, content={"message": "Falta el ID de la carrera."})

        # Verifica si el usuario ya está inscrito en esta carrera.
        existing = db_session.query(PivoteUserCareer).filter_by(id_user=user_id, id_career=career_id).first()
        if existing: return JSONResponse(status_code=409, content={"message": "El usuario ya está inscrito en esta carrera."})

        # Crea una nueva entrada en la tabla PivoteUserCareer con los IDs de usuario y carrera.
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

@user.delete("/user/delete/{user_id}")
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
        
        if admin_user.id == user_id:
            return JSONResponse(status_code=400, content={"message": "No puedes eliminar tu propia cuenta."})

        user_to_delete = db_session.query(User).filter(User.id == user_id).first()
        if not user_to_delete:
            return JSONResponse(status_code=404, content={"message": "Usuario no encontrado."})

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
    """
    Endpoint para desasignar (quitar) una carrera de un usuario específico.
    Requiere autenticación JWT y que el usuario que realiza la solicitud sea un 'administrador'.
    
    Args:
        user_id (int): El ID del usuario al que se le quitará la carrera.
        career_id (int): El ID de la carrera a quitar del usuario.
        authorization (str | None): El token JWT en el encabezado 'Authorization'.
    """
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

