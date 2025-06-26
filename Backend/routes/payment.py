from fastapi import APIRouter, Header
from fastapi.responses import JSONResponse
from models.modelo import Payment, InputPayment, User ,session
from sqlalchemy.orm import joinedload
from auth.security import Security

payment = APIRouter()


@payment.get("/payment/all/detailled")
def get_payments():
    paymentsDetailled = []
    allPayments =  session.query(Payment).all()
    for pay in allPayments:
        result = {
            "id_pago" : pay.id,
            "monto": pay.amount,
            "afecha de pago" : pay.created_at,
            "mes_pagado" : pay.affected_month,
            "alumno": f"{pay.user.userdetail.first_name} {pay.user.userdetail.last_name}",
            "carrera afectada": pay.career.name
        }
        paymentsDetailled.append(result)
    return paymentsDetailled
    ##return session.query(Payment).options(joinedload(Payment.user)).userdetail

@payment.get("/payment/user/{_username}")
def payament_user(_username: str):
    try:
        userEncontrado = session.query(User).filter(User.username == _username ).first()
        arraySalida = []
        if(userEncontrado):
            payments = userEncontrado.payments
            for pay in payments:
                payment_detail = {
                    "id": pay.id,
                    "amount": pay.amount,
                    "fecha_pago": pay.created_at,
                    "usuario": f"{pay.user.userdetail.first_name} {pay.user.userdetail.last_name}",
                    "carrera": pay.career.name,
                    "mes_afectado":pay.affected_month
                }
                arraySalida.append(payment_detail)
            return arraySalida
        else:
            return "Usuario no encontrado!"
    except Exception as ex:
        session.rollback()
        print("Error al traer usuario y/o pagos")
    finally:
        session.close()

@payment.post("/payment/add")
def add_payment(pay:InputPayment):
    try:
        newPayment = Payment(pay.id_career, pay.id_user, pay.amount, pay.affected_month)
        session.add(newPayment)
        session.commit()
        res = f"Pago para el alumno {newPayment.user.userdetail.first_name} {newPayment.user.userdetail.last_name}, aguardado!"
        print(res)
        return res
    except Exception as ex:
        session.rollback()
        print("Error al guardar un pago --> ", ex)
    finally:
        session.close()

@payment.get("/payment/{payment_id}")
def get_payment_by_id(payment_id: int, authorization: str | None = Header(default=None)):
    """
    Obtiene los detalles de un pago específico por su ID.
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

        payment_data = db_session.query(Payment).filter(Payment.id == payment_id).first()
        if not payment_data:
            return JSONResponse(status_code=404, content={"message": "Pago no encontrado."})

        # Devolvemos los datos del pago para el formulario de edición
        return {
            "id": payment_data.id,
            "id_user": payment_data.id_user,
            "id_career": payment_data.id_career,
            "amount": payment_data.amount,
            "affected_month": payment_data.affected_month.strftime('%Y-%m-%d') # Formateamos la fecha
        }
    finally:
        db_session.close()


@payment.put("/payment/update/{payment_id}")
def update_payment(payment_id: int, payment_update: InputPayment, authorization: str | None = Header(default=None)):
    """
    Actualiza los detalles de un pago.
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

        payment_to_update = db_session.query(Payment).filter(Payment.id == payment_id).first()
        if not payment_to_update:
            return JSONResponse(status_code=404, content={"message": "Pago no encontrado."})

        # Actualizamos los campos
        payment_to_update.id_user = payment_update.id_user
        payment_to_update.id_career = payment_update.id_career
        payment_to_update.amount = payment_update.amount
        payment_to_update.affected_month = payment_update.affected_month
        
        db_session.commit()
        return JSONResponse(status_code=200, content={"message": "Pago actualizado con éxito."})
    except Exception as e:
        db_session.rollback()
        return JSONResponse(status_code=500, content={"message": f"Error interno: {e}"})
    finally:
        db_session.close()

@payment.delete("/payment/delete/{payment_id}")
def delete_payment(payment_id: int, authorization: str | None = Header(default=None)):
    """
    Elimina un pago específico por su ID.
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

        payment_to_delete = db_session.query(Payment).filter(Payment.id == payment_id).first()
        if not payment_to_delete:
            return JSONResponse(status_code=404, content={"message": "Pago no encontrado."})

        db_session.delete(payment_to_delete)
        db_session.commit()
        return JSONResponse(status_code=200, content={"message": "Pago eliminado con éxito."})

    except Exception as e:
        db_session.rollback()
        return JSONResponse(status_code=500, content={"message": f"Error al eliminar el pago: {e}"})
    finally:
        db_session.close()
