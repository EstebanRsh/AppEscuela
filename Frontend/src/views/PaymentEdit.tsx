import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InfoContainer from '../components/common/InfoContainer';

// Tipos para los datos que cargaremos
type User = { id: number; first_name: string; last_name: string };
type Career = { id: number; name: string };
type PaymentData = {
  id_user: number;
  id_career: number;
  amount: number;
  affected_month: string;
};

function PaymentEdit() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();

  // Estados para el formulario y los desplegables
  const [formData, setFormData] = useState<PaymentData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  // useEffect para cargar toda la información necesaria
  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const headers = { Authorization: `Bearer ${token}` };

    // Cargar datos del pago específico
    fetch(`http://localhost:8000/payment/${paymentId}`, { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.message) {
          setFormData(data);
        } else {
          setMessage(data.message || "Error al cargar el pago.");
        }
      });

    // Cargar todos los alumnos
    fetch("http://localhost:8000/users/all", { headers })
      .then((res) => res.json())
      .then((data) => {
        const studentUsers = data.filter(
          (user: User & { type: string }) => user.type === "alumno"
        );
        setUsers(studentUsers);
      });

    // Cargar todas las carreras
    fetch("http://localhost:8000/career/all", { headers })
      .then((res) => res.json())
      .then((data) => setCareers(data));
  }, [paymentId]);

  // Manejador para los cambios en el formulario
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prevData) => (prevData ? { ...prevData, [id]: value } : null));
  };

  // Manejador para el envío del formulario de actualización
  const handleUpdatePayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData) return;

    const token = localStorage.getItem("token") || "";
    const UPDATE_URL = `http://localhost:8000/payment/update/${paymentId}`;

    fetch(UPDATE_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...formData,
        amount: Number(formData.amount), // Aseguramos que el monto sea número
        id_user: Number(formData.id_user),
        id_career: Number(formData.id_career),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message.includes("éxito")) {
          alert(data.message);
          navigate("/payments");
        } else {
          setMessage(data.message);
        }
      })
      .catch((err) => setMessage(err.message || "Error al actualizar."));
  };
  const handleDeletePayment = () => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas eliminar este pago? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    const token = localStorage.getItem("token") || "";
    const DELETE_URL = `http://localhost:8000/payment/delete/${paymentId}`;

    fetch(DELETE_URL, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message.includes("éxito")) {
          alert(data.message);
          navigate("/payments"); // Volver al listado de pagos
        } else {
          setMessage(data.message);
        }
      })
      .catch((error) => {
        setMessage(error.message || "Error al eliminar el pago.");
      });
  };

  if (!formData) {
    return <div className="container mt-4">Cargando pago...</div>;
  }

  return (
  <InfoContainer>
    <div className="container mt-4">
      {/* Sección del título, similar al dashboard */}
      <h1>
        <span className="text-warning">Editando Pago</span>
      </h1>
      <p className="lead">
        Modifica los campos necesarios para actualizar este registro de pago.
      </p>
      <hr
        className="my-4"
        style={{ borderColor: "rgba(255, 255, 255, 0.5)" }}
      />

      <div className="card p-4 shadow-lg">
        {/* Se eliminó el <h2> aquí ya que ahora es parte del h1 anterior */}
        <form onSubmit={handleUpdatePayment}>
          <div className="mb-3">
            <label htmlFor="id_user" className="form-label">
              Alumno
            </label>
            <select
              id="id_user"
              className="form-select"
              value={formData.id_user}
              onChange={handleInputChange}
              required
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="id_career" className="form-label">
              Carrera
            </label>
            <select
              id="id_career"
              className="form-select"
              value={formData.id_career}
              onChange={handleInputChange}
              required
            >
              {careers.map((career) => (
                <option key={career.id} value={career.id}>
                  {career.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="amount" className="form-label">
              Monto
            </label>
            <input
              type="number"
              id="amount"
              className="form-control"
              value={formData.amount}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="affected_month" className="form-label">
              Mes Afectado
            </label>
            <input
              type="date"
              id="affected_month"
              className="form-control"
              value={formData.affected_month}
              onChange={handleInputChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-success">
            Actualizar Pago
          </button>
          <button
            type="button"
            className="btn btn-danger ms-2"
            onClick={handleDeletePayment}
          >
            Eliminar Pago
          </button>
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={() => navigate("/payments")}
          >
            Cancelar
          </button>
          {message && <div className="alert alert-danger mt-3">{message}</div>}
        </form>
      </div>
    </div>
  </InfoContainer>
);
}

export default PaymentEdit;
