import { useEffect, useState } from "react";
import InfoContainer from "../../components/common/InfoContainer";
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
  // Añadimos un estado para saber si estamos cargando los datos
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    const token = localStorage.getItem("token");

    if (!user || !user.username || !token) {
      setMessage(
        "No se pudo verificar la sesión. Por favor, inicie sesión de nuevo."
      );
      setIsLoading(false); // Dejamos de cargar
      return;
    }

    const FETCH_URL = `http://localhost:8000/payment/user/${user.username}`;

    fetch(FETCH_URL, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(err.message || "Error del servidor.");
          });
        }
        return res.json();
      })
      .then((data) => {
        const sortedPayments = data.sort(
          (a: StudentPayment, b: StudentPayment) =>
            new Date(b.fecha_pago).getTime() - new Date(a.fecha_pago).getTime()
        );
        setPayments(sortedPayments);
      })
      .catch((err) => {
        console.error("Error fetching payments:", err);
        setMessage(err.message);
      })
      .finally(() => {
        // Esta línea se ejecuta siempre, haya éxito o error
        setIsLoading(false);
      });
  }, []);

  return (
    <InfoContainer>
      <div className="container mt-4">
        {/* Sección del título principal, similar al dashboard */}
        <h1>
          <span className="text-warning">Mi Historial de Pagos</span>
        </h1>
        <p className="lead">
          Aquí puedes ver todos los pagos que has realizado, ordenados del más
          reciente al más antiguo.
        </p>
        <hr
          className="my-4"
          style={{ borderColor: "rgba(255, 255, 255, 0.5)" }}
        />

        {/* Si hay un error, lo mostramos */}
        {message && <div className="alert alert-danger">{message}</div>}

        {/* Mientras carga, mostramos un mensaje */}
        {isLoading ? (
          <p>Cargando pagos...</p>
        ) : (
          // Cuando termina de cargar, mostramos la tabla
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>CARRERA</th>
                <th>MONTO</th>
                <th>MES DEL PAGO</th>
                <th>FECHA DE REALIZACIÓN</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.carrera}</td>
                    <td>${payment.amount}</td>
                    <td>
                      {new Date(payment.mes_afectado).toLocaleDateString(
                        "es-ES",
                        { year: "numeric", month: "long" }
                      )}
                    </td>
                    <td>
                      {new Date(payment.fecha_pago).toLocaleString("es-ES")}
                    </td>
                  </tr>
                ))
              ) : (
                // Este mensaje solo se muestra si NO estamos cargando y NO hay pagos
                <tr>
                  <td colSpan={4} className="text-center">
                    Aún no has realizado ningún pago.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </InfoContainer>
  );
}

export default MyPayments;
