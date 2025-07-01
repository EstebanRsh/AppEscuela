from datetime import datetime
from fastapi import APIRouter, Header, status, Request, HTTPException
from fastapi.responses import JSONResponse
from models.modelo import Payment, InputPayment, User, Message, session
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

@payment.get("/payment/user")
def payament_user(req: Request):
    try:
        token_data = Security.verify_token(req.headers)
        if "message" in token_data:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=token_data["message"])
        username = token_data["username"]
        user_encontrado = session.query(User).filter(User.username == username).first()
        if not user_encontrado:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
        array_salida = []
        for pay in user_encontrado.payments:
            payment_detail = {
                "id": pay.id,
                "amount": pay.amount,
                "fecha_pago": pay.created_at,
                "carrera": pay.career.name,
                "mes_afectado": pay.affected_month
            }
            array_salida.append(payment_detail)
        return array_salida
    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        print(f"Error inesperado en payament_user: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error interno al procesar la solicitud.")
    finally:
        session.close()

@payment.post("/payment/add")
def add_payment(pay: InputPayment, req: Request):
    """
    Registra un nuevo pago y envía una notificación al usuario.
    Requiere permisos de administrador.
    """
    try:
        token_data = Security.verify_token(req.headers)
        if token_data.get("role") != "administrador":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para registrar pagos.")
        admin_sender_id = token_data.get("user_id")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido o expirado.")

    db_session = session
    try:
        user_recipient = db_session.query(User).options(joinedload(User.userdetail)).filter(User.id == pay.id_user).first()
        if not user_recipient:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"El alumno con ID {pay.id_user} no existe.")

        try:
            affected_date_obj = datetime.strptime(pay.affected_month, '%Y-%m-%d').date()
        except ValueError:
            raise HTTPException(status_code=400, detail="El formato de la fecha es inválido. Debe ser YYYY-MM-DD.")

        new_payment = Payment(
            id_career=pay.id_career, 
            id_user=pay.id_user, 
            amount=pay.amount, 
            affected_month=affected_date_obj
        )
        db_session.add(new_payment)
        
        month_str = affected_date_obj.strftime("%B de %Y")
        payment_date_str = datetime.now().strftime('%d/%m/%Y a las %H:%M')
        content = (f"Se ha registrado un pago de ${new_payment.amount} "
                   f"correspondiente al mes de {month_str}. "
                   f"Fecha de registro: {payment_date_str}.")
        
        new_message = Message(sender_id=admin_sender_id, recipient_id=pay.id_user, content=content)
        db_session.add(new_message)
        
        db_session.commit()

        res = f"Pago para el alumno {user_recipient.userdetail.first_name} guardado y notificado con éxito."
        return JSONResponse(status_code=201, content={"message": res})

    except HTTPException as http_ex:
        db_session.rollback()
        raise http_ex
    except Exception as e:
        db_session.rollback()
        print(f"Error detallado en backend: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar el pago.")
    finally:
        db_session.close()

@payment.get("/payment/{payment_id}")
def get_payment_by_id(payment_id: int, authorization: str | None = Header(default=None)):
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

        return {
            "id": payment_data.id,
            "id_user": payment_data.id_user,
            "id_career": payment_data.id_career,
            "amount": payment_data.amount,
            "affected_month": payment_data.affected_month.strftime('%Y-%m-%d')
        }
    finally:
        db_session.close()

@payment.put("/payment/update/{payment_id}")
def update_payment(payment_id: int, payment_update: InputPayment, authorization: str | None = Header(default=None)):
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