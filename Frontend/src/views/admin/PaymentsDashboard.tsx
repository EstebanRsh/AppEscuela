import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import InfoContainer from '../../components/common/InfoContainer';

// Definimos un tipo para la estructura de un pago
type Payment = {
  id_pago: number;
  monto: number;
  "afecha de pago": string;
  mes_pagado: string;
  alumno: string;
  "carrera afectada": string;
};

function PaymentsDashboard() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Estado para la carga

  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = loggedInUser.type === "administrador";

  const fetchAllPayments = async () => {
    setIsLoading(true);
    setMessage(null);
    const token = localStorage.getItem("token") || "";
    const PAYMENTS_URL = "http://localhost:8000/payment/all/detailled";

    try {
      const res = await fetch(PAYMENTS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al cargar los pagos");
      }

      const data = await res.json();
      setPayments(data);

    } catch (err: any) {
      console.error("Error fetching payments:", err);
      setMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPayments();
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  };

  const formatMonth = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  }

return (
  <InfoContainer>
    <div className="container mt-4">
      <div className="card card-custom shadow-lg">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h1 className="m-0 h3">
            <i className="bi bi-cash-coin text-warning me-2"></i>
            Gestión de Pagos
          </h1>
          <Link to="/admin/payments/add" className="btn btn-outline-success d-flex align-items-center">
            <i className="bi bi-plus-lg me-2"></i>
            Registrar Pago
          </Link>
        </div>
        <div className="card-body">
          <p className="lead mb-4">
            Aquí puedes ver y administrar todos los registros de pagos del sistema.
          </p>

          {message && <div className="alert alert-danger">{message}</div>}

          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2">Cargando pagos...</p>
            </div>
          ) : (
            <div className="table-responsive">
              {/* Se añade la clase 'table-responsive-cards' */}
              <table className="table table-hover align-middle table-responsive-cards">
                <thead>
                  <tr>
                    <th>ALUMNO</th>
                    <th>CARRERA</th>
                    <th>MONTO</th>
                    <th>MES PAGADO</th>
                    <th>FECHA DE PAGO</th>
                    {isAdmin && <th className="text-end">ACCIONES</th>}
                  </tr>
                </thead>
                <tbody>
                  {payments.length > 0 ? (
                    payments.map((payment) => (
                      <tr key={payment.id_pago}>
                        {/* Se añaden los 'data-label' */}
                        <td data-label="Alumno">{payment.alumno}</td>
                        <td data-label="Carrera">{payment["carrera afectada"]}</td>
                        <td data-label="Monto">${payment.monto.toLocaleString('es-AR')}</td>
                        <td data-label="Mes Pagado">{formatMonth(payment.mes_pagado)}</td>
                        <td data-label="Fecha de Pago">{formatDate(payment["afecha de pago"])}</td>
                        {isAdmin && (
                          <td data-label="Acciones" className="text-end actions-cell">
                            <Link
                              to={`/admin/payments/${payment.id_pago}/edit`}
                              className="btn btn-outline-primary btn-sm"
                            >
                              <i className="bi bi-pencil-square me-1"></i>
                              Editar
                            </Link>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 5}>
                        <div className="empty-state">
                          <i className="bi bi-wallet2"></i>
                          <h4 className="mt-3">No se encontraron pagos</h4>
                          <p>Todavía no se han registrado pagos en el sistema.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  </InfoContainer>
);
}

export default PaymentsDashboard;