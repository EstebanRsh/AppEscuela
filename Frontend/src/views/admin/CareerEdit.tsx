import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InfoContainer from "../../components/common/InfoContainer";

function CareerEdit() {
  const { careerId } = useParams<{ careerId: string }>();
  const navigate = useNavigate();

  const [careerName, setCareerName] = useState("");
  const [originalCareerName, setOriginalCareerName] = useState(""); // Para el diálogo de confirmación
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
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
        setMessage({ type: "error", text: err.message });
      }
    };
    fetchCareerData();
  }, [careerId]);

  const handleUpdateCareer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const token = localStorage.getItem("token") || "";
    const UPDATE_URL = `http://localhost:8000/career/update/${careerId}`;

    try {
      const res = await fetch(UPDATE_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: careerName }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Error al actualizar.");
      }
      alert(data.message);
      navigate("/admin/careers");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCareer = async () => {
    if (
      !window.confirm(
        `¿Estás seguro de que quieres eliminar la carrera "${originalCareerName}"? Esta acción es irreversible.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setMessage(null);
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
      alert(data.message);
      navigate("/admin/careers");
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <InfoContainer>
      <div className="container mt-4">
        <div
          className="card card-custom shadow-lg mx-auto"
          style={{ maxWidth: "700px" }}
        >
          <div className="card-header">
            <h1 className="m-0 h3">
              <i className="bi bi-pencil-fill text-warning me-2"></i>
              Editando Carrera
            </h1>
          </div>
          <div className="card-body p-4">
            <p className="lead mb-4">
              Modifica el nombre de la carrera{" "}
              <span className="text-warning fw-bold"></span> o elimínala del
              sistema.
            </p>
            <form onSubmit={handleUpdateCareer}>
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

              {message && (
                <div
                  className={`alert mt-3 alert-${
                    message.type === "error" ? "alert-danger" : "alert-success"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="d-flex justify-content-between mt-4 form-actions-responsive">
                <button
                  type="submit"
                  className="btn btn-outline-success"
                  disabled={isLoading}
                >
                  {isLoading ? (
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
                    onClick={() => navigate("/admin/careers")}
                  >
                    Cancelar
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
