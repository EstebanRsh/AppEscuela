import sys
# Limita el rastreo de errores (traceback) a una sola línea.
# Esto puede ser útil en producción para no exponer demasiada información interna en caso de errores,
# pero puede dificultar la depuración durante el desarrollo.
sys.tracebacklimit = 1
from fastapi import FastAPI
# Importa los routers (grupos de rutas) definidos en los módulos correspondientes.
# Cada uno de estos archivos (user.py, career.py, etc.) contendrá las definiciones de las rutas
# relacionadas con esa entidad (usuarios, carreras, pagos, mensajes).
from routes.user import user
from routes.career import career
from routes.payment import payment
from routes.message import message
from fastapi.middleware.cors import CORSMiddleware  # Importa el middleware CORS para manejar solicitudes de origen cruzado.
from fastapi.staticfiles import StaticFiles  # Importa StaticFiles para servir archivos estáticos.

# Crea una instancia de la aplicación FastAPI.
# Esta es la aplicación principal que orquesta todas las rutas y funcionalidades.
api_escu = FastAPI()

# Monta un directorio para servir archivos estáticos.
# Las solicitudes a "/static" servirán archivos desde el directorio "static" en el sistema de archivos.
# Por ejemplo, si tienes "static/image.png", se accederá a través de "http://tu_dominio/static/image.png".
api_escu.mount("/static", StaticFiles(directory="static"), name="static")

# Incluye los routers importados en la aplicación principal.
# Esto organiza las rutas de la API en módulos separados, mejorando la modularidad y el orden del código.
api_escu.include_router(user)
api_escu.include_router(career)
api_escu.include_router(payment)
api_escu.include_router(message)

# Añade el middleware CORS (Cross-Origin Resource Sharing) a la aplicación.
# Esto permite que los clientes de diferentes orígenes (dominios) realicen solicitudes a esta API.
api_escu.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Permite solicitudes desde cualquier origen ("*"). En producción, se recomienda especificar los orígenes permitidos.
    allow_credentials=True,  # Permite el envío de credenciales (cookies, encabezados de autorización) en las solicitudes de origen cruzado.
    allow_methods=["*"],   # Permite todos los métodos HTTP (GET, POST, PUT, DELETE, etc.).
    allow_headers=["*"],   # Permite todos los encabezados HTTP en las solicitudes de origen cruzado.
)

# uvicorn app:api_escu --reload