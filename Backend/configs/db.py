from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
# create_engine crea una instancia de un motor que conecta con la base de datos
# declarative_base es una función que devuelve una clase base de la cual tus clases de modelo (Python) heredarán

# Crea una instancia del motor de la base de datos (engine).
# La cadena de conexión especifica el dialecto (postgresql), las credenciales (usuario:postgres, contraseña:1234),
# el host (localhost), el puerto (5432) y el nombre de la base de datos (escuela).
engine = create_engine("postgresql://postgres:1234@localhost:5432/escuela" )

# Crea una instancia de `declarative_base()`.
# `Base` es la clase base declarativa de la cual tus clases de modelo (tablas) heredarán.
# Esto permite que SQLAlchemy mapee tus clases Python a tablas de la base de datos de forma declarativa.
Base = declarative_base()
