import { useEffect, useState } from "react";
import InfoContainer from "../../components/common/InfoContainer";

// Definimos el tipo para la estructura de un pago de estudiante
type StudentPayment = {
  id: number;
  amount: number;
  fecha_pago: string;
  carrera: string;
  mes_afectado: string;
};

function MyPayments() {
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyPayments = async () => {
      setIsLoading(true);
      setMessage(null);
      const userString = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!userString || !token) {
        setMessage("No se pudo verificar la sesión. Por favor, inicie sesión de nuevo.");
        setIsLoading(false);
        return;
      }
      
      const user = JSON.parse(userString);
      const FETCH_URL = `http://localhost:8000/payment/user/${user.username}`;

      try {
        const res = await fetch(FETCH_URL, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Error del servidor.");
        }
        const data = await res.json();
        // Ordenamos los pagos del más reciente al más antiguo
        const sortedPayments = data.sort(
          (a: StudentPayment, b: StudentPayment) =>
            new Date(b.fecha_pago).getTime() - new Date(a.fecha_pago).getTime()
        );
        setPayments(sortedPayments);

      } catch (err: any) {
        console.error("Error fetching my payments:", err);
        setMessage(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyPayments();
  }, []);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const formatMonth = (dateString: string) => {
    const date = new Date(dateString);
    // Sumamos 1 día para evitar problemas de zona horaria que puedan mostrar el mes anterior
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString("es-ES", {
        year: 'numeric', month: 'long',
    });
};

  return (
  <InfoContainer>
    <div className="container mt-4">
      <div className="card card-custom shadow-lg">
        <div className="card-header">
          <h1 className="m-0 h3">
            <i className="bi bi-wallet2 text-warning me-2"></i>
            Mi Historial de Pagos
          </h1>
        </div>
        <div className="card-body">
          <p className="lead mb-4">
            Aquí puedes ver todos los pagos que has realizado, ordenados del más reciente al más antiguo.
          </p>

          {message && <div className="alert alert-danger">{message}</div>}

          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2">Cargando tu historial...</p>
            </div>
          ) : (
            <div className="table-responsive">
              {/* Se añade la clase 'table-responsive-cards' */}
              <table className="table table-hover align-middle table-responsive-cards">
                <thead>
                  <tr>
                    <th>CARRERA</th>
                    <th>MES CORRESPONDIENTE</th>
                    <th>FECHA DE PAGO</th>
                    <th className="text-end">MONTO</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length > 0 ? (
                    payments.map((payment) => (
                      <tr key={payment.id}>
                        {/* Se añaden los 'data-label' */}
                        <td data-label="Carrera">{payment.carrera}</td>
                        <td data-label="Mes Correspondiente">{formatMonth(payment.mes_afectado)}</td>
                        <td data-label="Fecha de Pago">{formatDate(payment.fecha_pago)}</td>
                        <td data-label="Monto" className="text-end fw-bold">{formatCurrency(payment.amount)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>
                        <div className="empty-state">
                          <i className="bi bi-emoji-frown"></i>
                          <h4 className="mt-3">Aún no tienes pagos</h4>
                          <p>Cuando realices tu primer pago, lo verás reflejado aquí.</p>
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

export default MyPayments;