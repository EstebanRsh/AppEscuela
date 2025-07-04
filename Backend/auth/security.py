# Importación de módulos necesarios
# para trabajar con fechas y horas(datetime), para manejar zonas horarias (pytz), para codificar y decodificar tokens (jwt)
import datetime, pytz, jwt

class Security:
    # Clave secreta utilizada para firmar y verificar los tokens JWT.
    # Es crucial que esta clave sea robusta y se mantenga segura en un entorno de producción.
    secret = "cualquier cosa"

    @classmethod
    def hoy(cls):
        """
        Método de clase que devuelve la fecha y hora actual,
        localizada en la zona horaria de "America/Buenos_Aires".
        Esto es importante para que los 'iat' (issued at) y 'exp' (expiration)
        de los tokens sean consistentes con la hora del servidor.
        """
        return datetime.datetime.now(pytz.timezone("America/Buenos_Aires"))


    @classmethod
    def generate_token(cls, authUser):
        """
        Método de clase para generar un token JWT.
        Recibe un objeto 'authUser' que se espera que contenga información del usuario autenticado.
        """
        payload = {
            # 'iat' (issued at): Marca de tiempo de cuándo se emitió el token.
            "iat": cls.hoy(), 
            # 'exp' (expiration time): Marca de tiempo de cuándo expira el token.
            # Se establece 480 minutos (8 horas) después de la hora de emisión.
            "exp": cls.hoy() + datetime.timedelta(minutes=480),
            # Nombre de usuario del usuario autenticado.
            "username" : authUser.username,
            # ID del usuario autenticado.
            "user_id": authUser.id,
            # Rol del usuario, convertido a minúsculas (ej., "administrador", "alumno").
            # Se asume que authUser tiene un atributo userdetail que a su vez tiene un atributo type.
            "role": authUser.userdetail.type.lower() 
        }
        try:
            # Codifica el payload usando la clave secreta y el algoritmo de firma HS256.
            return jwt.encode(payload, cls.secret, algorithm="HS256")
        except Exception:
            # Si ocurre alguna excepción durante la codificación, el método devuelve None.
            return None
        
    @classmethod
    def verify_token(cls, headers):  
        """
        Método de clase para verificar un token JWT.
        Recibe un diccionario 'headers' que se espera que contenga el encabezado 'Authorization'.
        """
        if headers["authorization"]:  # Verifica si el encabezado Authorization existe
            try:
                # Extrae el token. Se asume que el token viene en el formato 'Bearer <token>',
                # por lo que se hace un split(" ") y se toma la segunda parte.
                tkn = headers["authorization"].split(" ")[1]
                # Intenta decodificar el token usando la clave secreta y el algoritmo HS256.
                # Si la decodificación es exitosa, devuelve el payload.
                payload = jwt.decode(tkn, cls.secret, algorithms=["HS256"])
                return payload
            except jwt.ExpiredSignatureError:  # Captura el error si el token ha expirado
                return {"message":"El token ha expirado!"}
            except jwt.InvalidSignatureError:  # Captura el error si la firma del token no es válida
                return {"message":"Error de firma invalida!"}
            except jwt.DecodeError:  # Captura errores generales de decodificación del token
                return {"message":"Error de decodificación de token!"}
            except Exception:  # Captura cualquier otra excepción inesperada durante la validación del token
                return {"message":"Error desconocido durante la validación del token!"}
        else:
            # Si el encabezado 'Authorization' no existe, devuelve un mensaje de error.
            return {"message" : "Error, header inexistente!"}
