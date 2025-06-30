import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InfoContainer from "../../components/common/InfoContainer";

// Tipos para los datos
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

  const [formData, setFormData] = useState<PaymentData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState({
    page: true,
    update: false,
    delete: false,
  });

  // Carga inicial de todos los datos
  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async () => {
      try {
        const [paymentRes, usersRes, careersRes] = await Promise.all([
          fetch(`http://localhost:8000/payment/${paymentId}`, { headers }),
          fetch("http://localhost:8000/users/all", { headers }),
          fetch("http://localhost:8000/career/all", { headers }),
        ]);

        if (!paymentRes.ok || !usersRes.ok || !careersRes.ok) {
          throw new Error(
            "Error al cargar los datos necesarios para la edición."
          );
        }

        const paymentData = await paymentRes.json();
        const allUsers = await usersRes.json();
        const careersData = await careersRes.json();

        setFormData(paymentData);
        setUsers(
          allUsers.filter(
            (user: User & { type: string }) => user.type === "alumno"
          )
        );
        setCareers(careersData);
      } catch (err: any) {
        setMessage({ type: "error", text: err.message });
      } finally {
        setIsLoading((prev) => ({ ...prev, page: false }));
      }
    };

    fetchData();
  }, [paymentId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [id]: value } : null));
  };

  const handleUpdatePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData) return;

    setIsLoading((prev) => ({ ...prev, update: true }));
    setMessage(null);

    const token = localStorage.getItem("token") || "";
    const UPDATE_URL = `http://localhost:8000/payment/update/${paymentId}`;

    try {
      const res = await fetch(UPDATE_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
          id_user: Number(formData.id_user),
          id_career: Number(formData.id_career),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al actualizar.");

      alert(data.message);
      navigate("/payments");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsLoading((prev) => ({ ...prev, update: false }));
    }
  };

  const handleDeletePayment = async () => {
    if (!window.confirm("¿Estás seguro? Esta acción no se puede deshacer."))
      return;

    setIsLoading((prev) => ({ ...prev, delete: true }));
    setMessage(null);

    const token = localStorage.getItem("token") || "";
    const DELETE_URL = `http://localhost:8000/payment/delete/${paymentId}`;

    try {
      const res = await fetch(DELETE_URL, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al eliminar.");

      alert(data.message);
      navigate("/payments");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  if (isLoading.page) {
    return (
      <InfoContainer>
        <div className="container mt-4 text-center">
          <div className="spinner-border text-warning" role="status"></div>
        </div>
      </InfoContainer>
    );
  }

  if (!formData) {
    return (
      <InfoContainer>
        <div className="container mt-4">
          <div className="alert alert-danger">
            No se pudieron cargar los datos del pago. Por favor, vuelve a
            intentarlo.
          </div>
        </div>
      </InfoContainer>
    );
  }

  return (
    <InfoContainer>
      <div className="container mt-4">
        <div
          className="card card-custom shadow-lg mx-auto"
          style={{ maxWidth: "800px" }}
        >
          <div className="card-header">
            <h1 className="m-0 h3">
              <i className="bi bi-pencil-square text-warning me-2"></i>
              Editando Registro de Pago
            </h1>
          </div>
          <div className="card-body p-4">
            <p className="lead mb-4">
              Modifica los campos necesarios para actualizar este pago.
            </p>
            <form onSubmit={handleUpdatePayment}>
              <div className="row g-3">
                <div className="col-md-6">
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
                <div className="col-md-6">
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
                <div className="col-md-6">
                  <label htmlFor="amount" className="form-label">
                    Monto (ARS)
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
                <div className="col-md-6">
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
              </div>

              {message && (
                <div className={`alert mt-4 alert-${message.type}`}>
                  {message.text}
                </div>
              )}

              {/* [CAMBIO AQUÍ] Se añade la clase 'form-actions-responsive' */}
              <div className="d-flex justify-content-between mt-4 form-actions-responsive">
                <button
                  type="submit"
                  className="btn btn-outline-success"
                  disabled={isLoading.update}
                >
                  {isLoading.update ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    ""
                  )}
                  Guardar Cambios
                </button>
                <div className="d-flex">
                  <button
                    type="button"
                    className="btn btn-outline-secondary me-2"
                    onClick={() => navigate("/payments")}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={handleDeletePayment}
                    disabled={isLoading.delete}
                  >
                    {isLoading.delete ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      <>
                        <i className="bi bi-trash-fill me-2"></i>Eliminar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </InfoContainer>
  );
}

export default PaymentEdit;
