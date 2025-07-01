from fastapi import APIRouter, status, Request, HTTPException
from fastapi.responses import JSONResponse
from models.modelo import session, User, Message, InputMessage, MessageResponse
from auth.security import Security
from typing import List

message = APIRouter()

# --- 3. RUTA PARA ENVIAR UN MENSAJE (SOLO ADMINS) ---
# @message.post("/messages") indica que esta función se ejecuta cuando se recibe una petición POST a /api/messages.
# Un POST se usa para CREAR algo nuevo, en este caso, un mensaje.
@message.post("/messages", status_code=status.HTTP_201_CREATED, summary="Enviar un nuevo mensaje (Solo Admin)")
def send_message(msg_input: InputMessage, req: Request):
    """
    Permite que un Administrador envíe un mensaje a otro usuario.
    - msg_input (InputMessage): Son los datos que vienen en el cuerpo de la petición (el JSON).
      FastAPI automáticamente valida que el JSON tenga 'recipient_id' y 'content'.
    - req (Request): Es la petición completa, la usamos para obtener el token de las cabeceras.
    """

    # PASO A: Verificar que el usuario sea un Administrador.
    try:
        # Decodificamos el token para ver quién está haciendo la petición.
        token_data = Security.verify_token(req.headers)
        print("DEBUG TOKEN:", token_data)

        # En el token guardamos el rol del usuario cuando hizo login.
        # Si el rol no es "Administrador", no lo dejamos continuar.
        if token_data.get("role") != "administrador":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, # 403 Forbidden significa "Sé quién eres, pero no tienes permiso".
                detail="No tienes permiso para enviar mensajes."
            )
        
        # Si es un admin, guardamos su ID. Será el remitente (sender).
        sender_id = token_data["user_id"]

    except Exception:
        # Si `verify_token` falla (token inválido, expirado, etc.), devolvemos un error de autenticación.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, # 401 Unauthorized significa "No sé quién eres, identifícate".
            detail="Token inválido o expirado."
        )

    # PASO B: Crear y guardar el mensaje en la Base de Datos.
    try:
        # Buscamos en la tabla User si existe un usuario con el ID que nos enviaron.
        recipient = session.query(User).filter(User.id == msg_input.recipient_id).first()
        if not recipient:
            # Si no encontramos al destinatario, devolvemos un error 404 Not Found.
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"El usuario destinatario con ID {msg_input.recipient_id} no existe."
            )
        
        # Si todo está bien, creamos el objeto del mensaje con los datos.
        new_message = Message(
            sender_id=sender_id,
            recipient_id=msg_input.recipient_id,
            content=msg_input.content
        )

        session.add(new_message) # Preparamos el mensaje para guardarlo.
        session.commit() # Confirmamos y guardamos el mensaje en la base de datos.

        # Devolvemos una respuesta de éxito.
        return {"detail": "Mensaje enviado correctamente."}

    except Exception as e:
        # Si algo falla al interactuar con la base de datos, deshacemos cualquier cambio pendiente.
        session.rollback()
        # Devolvemos un error genérico del servidor.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ocurrió un error interno al guardar el mensaje."
        )
    finally:
        # Este bloque se ejecuta SIEMPRE (con éxito o con error).
        # Es una buena práctica cerrar la sesión para liberar la conexión a la base de datos.
        session.close()


# --- 4. RUTA PARA OBTENER LOS MENSAJES DE UN USUARIO ---
# @message.get() maneja peticiones GET. Un GET se usa para LEER o solicitar datos.
@message.get("/messages", response_model=List[MessageResponse], summary="Obtener mis mensajes recibidos")
def get_user_messages(req: Request):
    """
    Devuelve todos los mensajes que ha recibido el usuario que hace la petición.
    """
    # PASO A: Verificar quién es el usuario.
    try:
        token_data = Security.verify_token(req.headers)
        if "user_id" not in token_data:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")
        
        # Obtenemos el ID del usuario que está pidiendo sus mensajes.
        user_id = token_data["user_id"] 
    
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido o expirado.")

    # PASO B: Consultar sus mensajes en la Base de Datos.
    try:
        # Buscamos en la tabla 'Message' todos los registros donde el 'recipient_id' sea el nuestro.
        # Los ordenamos del más nuevo al más viejo (descendente).
        messages = session.query(Message).filter(Message.recipient_id == user_id).order_by(Message.timestamp.desc()).all()
        
        # Devolvemos la lista de mensajes. FastAPI la convertirá a JSON automáticamente.
        return messages

    finally:
        session.close()


# --- 5. RUTA PARA MARCAR UN MENSAJE COMO LEÍDO ---
# @message.put() maneja peticiones PUT. Un PUT se usa para ACTUALIZAR un recurso que ya existe.
# {message_id} en la URL es una variable. El número que ponga el cliente (ej: /api/messages/15/read) 
# se pasará como argumento a nuestra función.
@message.put("/messages/{message_id}/read", status_code=status.HTTP_204_NO_CONTENT, summary="Marcar un mensaje como leído")
def mark_as_read(message_id: int, req: Request):
    """
    Actualiza un mensaje para marcarlo como leído (is_read = True).
    """
    # PASO A: Verificar quién es el usuario.
    try:
        token_data = Security.verify_token(req.headers)
        user_id = token_data.get("user_id")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido o expirado.")

    # PASO B: Buscar el mensaje y actualizarlo.
    try:
        # Buscamos el mensaje específico por su ID.
        message_to_update = session.query(Message).filter(Message.id == message_id).first()

        if not message_to_update:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mensaje no encontrado.")
        
        # ¡MUY IMPORTANTE! Verificamos que el mensaje le pertenezca al usuario.
        # Esto evita que un usuario pueda marcar como leídos los mensajes de otra persona.
        if message_to_update.recipient_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para modificar este mensaje.")

        # Actualizamos el campo 'is_read' a True y guardamos.
        message_to_update.is_read = True
        session.commit()

        # El código 204 significa "Todo salió bien, pero no te devuelvo ningún contenido".
        # Es perfecto para una operación como esta. FastAPI se encarga de que la respuesta vaya vacía.
        return

    finally:
        session.close()