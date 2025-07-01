import { useEffect, useState } from 'react';
import InfoContainer from '../../components/common/InfoContainer';

// Define la estructura de un pago
interface Payment {
  id: number;
  amount: number;
  fecha_pago: string;
  carrera: string;
  mes_afectado: string;
}

function MyPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchPayments = async () => {
      if (!token) {
        setError("No se pudo verificar la sesión. Por favor, inicie sesión de nuevo.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/payment/user', { // <-- Llama a la nueva ruta segura
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'No se pudieron cargar los pagos.');
        }

        const data = await response.json();
        setPayments(data);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [token]);

  // Funciones para formatear los datos y que se vean mejor
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
    date.setDate(date.getDate() + 1); // Evita problemas con la zona horaria
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
              Aquí puedes ver todos los pagos que has realizado.
            </p>

            {isLoading && (
              <div className="text-center py-5">
                <div className="spinner-border text-warning" role="status"></div>
              </div>
            )}
            {error && <div className="alert alert-danger">{error}</div>}
            
            {!isLoading && !error && (
              payments.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle table-responsive-cards">
                    <thead>
                      <tr>
                        <th>Carrera</th>
                        <th>Mes Correspondiente</th>
                        <th>Fecha de Pago</th>
                        <th className="text-end">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((pay) => (
                        <tr key={pay.id}>
                          <td data-label="Carrera">{pay.carrera}</td>
                          <td data-label="Mes Correspondiente">{formatMonth(pay.mes_afectado)}</td>
                          <td data-label="Fecha de Pago">{formatDate(pay.fecha_pago)}</td>
                          <td data-label="Monto" className="text-end fw-bold">{formatCurrency(pay.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert alert-info">No tienes pagos registrados.</div>
              )
            )}
          </div>
        </div>
      </div>
    </InfoContainer>
  );
}

export default MyPayments;