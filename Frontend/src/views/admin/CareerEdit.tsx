import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InfoContainer from "../../components/common/InfoContainer";
import { toast } from "react-toastify";

// Componente reutilizable para el toast de confirmación.
const ConfirmationToast = ({ onConfirm, onCancel, message }: { onConfirm: () => void; onCancel: () => void; message: string; }) => (
  <div>
    <p className="mb-2">{message}</p>
    <div className="d-flex justify-content-end gap-2">
      <button onClick={onConfirm} className="btn btn-sm btn-danger">Confirmar</button>
      <button onClick={onCancel} className="btn btn-sm btn-secondary">Cancelar</button>
    </div>
  </div>
);

function CareerEdit() {
  const { careerId } = useParams<{ careerId: string }>();
  const navigate = useNavigate();

  const [careerName, setCareerName] = useState("");
  const [originalCareerName, setOriginalCareerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const fetchCareerData = async () => {
      try {
        const res = await fetch(`http://localhost:8000/career/${careerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Error al cargar la carrera.");
        }
        const data = await res.json();
        setCareerName(data.name);
        setOriginalCareerName(data.name);
      } catch (err: any) {
        toast.error(err.message);
        navigate("/admin/careers");
      }
    };
    fetchCareerData();
  }, [careerId, navigate]);

  const handleUpdateCareer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem("token") || "";
    const UPDATE_URL = `http://localhost:8000/career/update/${careerId}`;

    try {
      const res = await fetch(UPDATE_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: careerName }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Error al actualizar.");
      }
      toast.success(data.message || "Carrera actualizada con éxito.");
      navigate("/admin/careers");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCareer = () => {
    const performDelete = async () => {
      setIsDeleting(true);
      const token = localStorage.getItem("token") || "";
      const DELETE_URL = `http://localhost:8000/career/delete/${careerId}`;
      try {
        const response = await fetch(DELETE_URL, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Error al eliminar");
        }
        toast.success(data.message || "Carrera eliminada con éxito.");
        navigate("/admin/careers");
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsDeleting(false);
      }
    };

    toast.warning(
      <ConfirmationToast
        message={`¿Eliminar la carrera "${originalCareerName}"? Esta acción es irreversible.`}
        onConfirm={() => { toast.dismiss(); performDelete(); }}
        onCancel={() => toast.dismiss()}
      />, { autoClose: false, closeOnClick: false }
    );
  };

  return (
    <InfoContainer>
      <div className="container mt-4">
        <div className="card card-custom shadow-lg mx-auto" style={{ maxWidth: "700px" }}>
          <div className="card-header">
            <h1 className="m-0 h3">
              <i className="bi bi-pencil-fill text-warning me-2"></i>
              Editando Carrera
            </h1>
          </div>
          <div className="card-body p-4">
            <p className="lead mb-4">
              Modifica el nombre de la carrera o elimínala del sistema.
            </p>
            <form onSubmit={handleUpdateCareer} noValidate>
              <div className="mb-3">
                <label htmlFor="careerName" className="form-label">
                  Nombre de la Carrera
                </label>
                <input
                  type="text"
                  id="careerName"
                  className="form-control"
                  value={careerName}
                  onChange={(e) => setCareerName(e.target.value)}
                  required
                />
              </div>

              <div className="d-flex justify-content-between mt-4 form-actions-responsive">
                <button
                  type="submit"
                  className="btn btn-outline-success"
                  disabled={isLoading}
                >
                  {isLoading && <span className="spinner-border spinner-border-sm me-2"></span>}
                  Guardar Cambios
                </button>
                <div className="d-flex">
                   <button
                    type="button"
                    className="btn btn-outline-secondary me-2"
                    onClick={() => navigate("/admin/careers")}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={handleDeleteCareer}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (<span className="spinner-border spinner-border-sm me-2"></span>) : (<i className="bi bi-trash-fill me-2"></i>)}
                    Eliminar
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

export default CareerEdit;