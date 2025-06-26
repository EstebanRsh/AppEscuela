import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Definimos un tipo para la estructura de un pago
type Payment = {
  id_pago: number;
  monto: number;
  "afecha de pago": string; // La clave viene así del backend
  mes_pagado: string;
  alumno: string;
  "carrera afectada": string; // La clave viene así del backend
};

function PaymentsDashboard() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = loggedInUser.type === "administrador";

  const fetchAllPayments = () => {
    const token = localStorage.getItem("token") || "";
    const PAYMENTS_URL = "http://localhost:8000/payment/all/detailled";

    fetch(PAYMENTS_URL, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(err => { throw new Error(err.message || "Error al cargar los pagos"); });
      }
      return res.json();
    })
    .then(data => {
      setPayments(data);
    })
    .catch(err => {
      console.error("Error fetching payments:", err);
      setMessage(err.message);
    });
  };

  useEffect(() => {
    fetchAllPayments();
  }, []);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Gestión de Pagos</h2>
        {/* Aquí podría ir un botón para "Registrar Nuevo Pago" en el futuro */}
      </div>

      {message && <div className="alert alert-danger">{message}</div>}

      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            <th>ALUMNO</th>
            <th>CARRERA</th>
            <th>MONTO</th>
            <th>MES PAGADO</th>
            <th>FECHA DE PAGO</th>
            {isAdmin && <th>ACCIONES</th>}
          </tr>
        </thead>
        <tbody>
          {payments.length > 0 ? (
            payments.map((payment) => (
              <tr key={payment.id_pago}>
                <td>{payment.alumno}</td>
                <td>{payment["carrera afectada"]}</td>
                <td>${payment.monto}</td>
                <td>{new Date(payment.mes_pagado).toLocaleDateString()}</td>
                <td>{new Date(payment["afecha de pago"]).toLocaleString()}</td>
                {isAdmin && (
                  <td>
                    <Link to={`/payment/edit/${payment.id_pago}`} className="btn btn-primary btn-sm">
                      Editar
                    </Link>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={isAdmin ? 6 : 5} className="text-center">
                No hay pagos para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default PaymentsDashboard;