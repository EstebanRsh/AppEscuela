# =================================================================================
# region 1. IMPORTACIONES
# Aquí se importan todas las herramientas necesarias de las librerías.
# =================================================================================

# De tu archivo de configuración, traes el 'engine' (la conexión a la BD)
# y 'Base' (el molde para crear las tablas).
from configs.db import engine, Base

# De SQLAlchemy, importas todo lo necesario para definir la estructura de las tablas.
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Date

# De SQLAlchemy.orm, traes las herramientas para interactuar con la BD a través de objetos.
# 'sessionmaker' crea la fábrica de sesiones y 'relationship' define cómo se conectan las tablas.
from sqlalchemy.orm import sessionmaker, relationship

# De Pydantic, importas 'BaseModel', que es el molde para crear validadores de datos.
from pydantic import BaseModel

# Importas la librería estándar de Python para manejar fechas y horas.
import datetime

# endregion

# =================================================================================
# region 2. MODELOS SQLAlchemy (DEFINICIÓN DE TABLAS DE LA BASE DE DATOS)
# Cada clase en esta sección representa una tabla en tu base de datos PostgreSQL.
# Heredan de 'Base', que les da la capacidad de ser mapeadas a una tabla.
# =================================================================================

class User(Base):
    """
    Modelo para la tabla 'user'.
    Es la tabla principal, contiene las credenciales de acceso y las conexiones
    (relaciones) con casi todas las demás tablas.
    """

    # Nombre exacto de la tabla en la base de datos.
    __tablename__ = "user"

    # --- Columnas de la tabla ---
    id = Column(Integer, primary_key =True)  # Clave primaria, autoincremental.
    username = Column( String(50), nullable=False, unique=True)  # No puede ser nulo y debe ser único.
    password = Column(String(40))   # Contraseña del usuario.
    id_userdetail = Column(Integer, ForeignKey("userdetail.id"))    # Clave foránea que la conecta con UserDetail.

    # --- Relaciones con otras tablas ---
    # Estas no son columnas, son "atajos" que SQLAlchemy crea para navegar entre tablas.

    # Relaciones para la mensajería (funcionalidad extra).
    # back_populates establece una relación bidireccional entre dos modelos (en este caso User y Message)
    sent_messages = relationship("Message", foreign_keys="[Message.sender_id]", back_populates="sender", cascade="all, delete-orphan")
    received_messages = relationship("Message", foreign_keys="[Message.recipient_id]", back_populates="recipient", cascade="all, delete-orphan")

    # Relación uno a uno con UserDetail.
    # uselist=False: Indica que un User solo tiene un UserDetail.
    # cascade="all, delete-orphan": Si borras un User, se borra su UserDetail asociado. ¡Muy importante!
    userdetail = relationship("UserDetail", uselist=False, cascade="all, delete-orphan", single_parent=True)

    # Relación uno a muchos con Payment.
    # Un User puede tener una lista de muchos Payments (pagos).
    payments= relationship("Payment", uselist=True, cascade="all, delete-orphan")

    # Relación con la tabla intermedia para las carreras.
    pivoteusercareer = relationship("PivoteUserCareer", cascade="all, delete-orphan")

    # Constructor de la clase. Se llama al crear una nueva instancia: `nuevo_usuario = User(...)`
    def __init__(self, username, password):
        self.username = username
        self.password = password

class UserDetail(Base):
    """
    Modelo para la tabla 'userdetail'.
    Guarda información extra del usuario para mantener la tabla 'user' ligera y optimizada.
    """

    __tablename__="userdetail"
    id = Column(Integer, primary_key =True)
    first_name = Column(String(50))
    last_name = Column(String(50))
    dni = Column(Integer)
    type = Column(String(50))   # Rol del usuario: "alumno", "profesor", "administrador".
    email = Column(String(50), nullable=False, unique=True)
    profile_image_url = Column(String(255), nullable=True)   # El 'nullable=True' permite que este campo esté vacío.

    def __init__(self, first_name, last_name, dni, type, email):
        self.first_name = first_name
        self.last_name = last_name
        self.dni = dni
        self.type = type
        self.email = email

class Career(Base):
    """Modelo para la tabla 'career'. Almacena las carreras disponibles."""

    __tablename__="career"
    id = Column(Integer, primary_key=True)
    name = Column(String(50))

    def __init__(self, name):
        self.name= name

class Payment(Base):
    """Modelo para la tabla 'payment'. Registra los pagos de los usuarios."""

    __tablename__="payment"
    id = Column(Integer, primary_key=True)
    id_career=Column(Integer, ForeignKey("career.id"))   # FK para saber a qué carrera corresponde el pago.
    id_user=Column(Integer, ForeignKey("user.id"))   # FK para saber qué usuario realizó el pago.
    amount = Column(Integer)
    affected_month = Column(Date)   # El mes y año de la cuota pagada.
    created_at = Column(DateTime, default=datetime.datetime.now)    # La fecha y hora exactas del registro.

    # Relaciones inversas para navegar "hacia atrás".
    user = relationship("User", uselist=False, back_populates="payments")
    career = relationship("Career", uselist=False)

    # Constructor corregido para aceptar argumentos por nombre
    def __init__(self, id_career, id_user, amount, affected_month):
        self.id_career = id_career
        self.id_user = id_user
        self.amount = amount
        self.affected_month = affected_month

class PivoteUserCareer(Base):
    """
    Tabla intermedia para la relación MUCHOS-A-MUCHOS entre User y Career.
    Cada fila significa: "Este usuario está inscrito en esta carrera".
    """

    __tablename__="pivote_user_career"
    id = Column(Integer, primary_key=True)
    id_career = Column(ForeignKey("career.id"))
    id_user = Column(ForeignKey("user.id"))

    # Relaciones para poder obtener los detalles de la carrera y el usuario desde una inscripción.
    career = relationship("Career", uselist=False)
    user = relationship("User", uselist=False, back_populates="pivoteusercareer")

    def __init__(self, id_user, id_career):
        self.id_user = id_user
        self.id_career = id_career

class Message(Base):
    """Modelo para la tabla 'message', para la funcionalidad extra de mensajería."""

    __tablename__ = "message"
    id = Column(Integer, primary_key=True)
    sender_id = Column(Integer, ForeignKey("user.id"), nullable=False)   # ID de quien envía.
    recipient_id = Column(Integer, ForeignKey("user.id"), nullable=False)   # ID de quien recibe.
    content = Column(String(500), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.now)
    is_read = Column(Boolean, default=False, nullable=False)   # Para marcar si el mensaje fue leído.

    # Relaciones para poder acceder a los objetos User completos del emisor y receptor.
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="received_messages")

    def __init__(self, sender_id, recipient_id, content):
        self.sender_id = sender_id
        self.recipient_id = recipient_id
        self.content = content
# endregion

# =================================================================================
# region 3. MODELOS PYDANTIC (VALIDACIÓN DE DATOS DE ENTRADA/SALIDA)
# Estas clases NO son tablas. Definen la "forma" que deben tener los datos (JSON)
# que se envían a la API. FastAPI los usa para validar automáticamente las peticiones.
# =================================================================================

class InputUser(BaseModel):
    """Define los campos necesarios para crear un nuevo usuario."""
    username:str
    password:str
    firstname:str
    lastname:str
    dni:int
    type:str
    email:str

class InputLogin(BaseModel):
    """Define los campos necesarios para el login."""
    username:str
    password:str

class InputUserDetail(BaseModel):
    first_name:str
    last_name:str
    dni:int
    type:str
    email:str

class InputCareer(BaseModel):
    """Define el campo necesario para crear una carrera."""
    name: str

class InputPayment(BaseModel):
    """Define los campos necesarios para registrar un pago."""
    id_career: int
    id_user: int
    amount: int
    affected_month: str

class InputUserAddCareer(BaseModel):
    """Define los campos para inscribir un usuario a una carrera."""
    id_user: int
    id_career: int

class InputUserUpdate(BaseModel):
    """Define los campos que se pueden actualizar de un usuario."""
    first_name: str
    last_name: str
    dni: int
    type: str
    email: str
    
class InputPasswordChange(BaseModel):
    """Define los campos para que un usuario cambie su propia contraseña."""
    current_password: str
    new_password: str
    
class InputAdminPasswordReset(BaseModel):
    """Define el campo para que un admin restablezca la contraseña de otro usuario."""
    new_password: str

class InputMessage(BaseModel):
    """Define los campos para enviar un mensaje."""
    recipient_id: int
    content: str

class MessageResponse(BaseModel):
    """Define la forma de la respuesta al pedir los mensajes."""
    id: int
    sender_id: int
    content: str
    timestamp: datetime.datetime
    is_read: bool
    
    class Config:
        # Permite que Pydantic cree este modelo a partir de un objeto SQLAlchemy.
        from_attributes = True
# endregion

# =================================================================================
# region 4. CONFIGURACIÓN Y CREACIÓN DE LA SESIÓN
# Código que se ejecuta una sola vez para preparar la base de datos.
# =================================================================================

# Esta línea revisa todos los modelos definidos arriba y crea las tablas en la
# base de datos si es que no existen. Si ya existen, no hace nada. 
Base.metadata.create_all(bind=engine)

# Crea una "fábrica" de sesiones, que sabe cómo conectarse a la base de datos.
Session = sessionmaker(bind=engine)

# Crea una instancia de sesión. Este es el objeto que usarás en tus rutas
# para hacer consultas, añadir datos, etc. (`session.query(...)`, `session.add(...)`).
session = Session()
# endregion