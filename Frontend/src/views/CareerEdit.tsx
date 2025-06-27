import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InfoContainer from '../components/common/InfoContainer';

function CareerEdit() {
  const { careerId } = useParams<{ careerId: string }>();
  const navigate = useNavigate();

  const [careerName, setCareerName] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  // useEffect para cargar el nombre actual de la carrera
  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    fetch(`http://localhost:8000/career/${careerId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.name) {
          setCareerName(data.name);
        } else {
          setMessage(data.message || "Error al cargar la carrera.");
        }
      });
  }, [careerId]);

  const handleUpdateCareer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("token") || "";
    const UPDATE_URL = `http://localhost:8000/career/update/${careerId}`;

    fetch(UPDATE_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: careerName }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message.includes("éxito")) {
          alert(data.message);
          navigate("/careers");
        } else {
          setMessage(data.message);
        }
      })
      .catch((err) => {
        console.error("Error al actualizar carrera:", err);
        setMessage("Ocurrió un error en el servidor.");
      });
  };

  const handleDeleteCareer = () => {
    if (
      !window.confirm(
        `¿Estás seguro de que quieres eliminar la carrera "${careerName}"?`
      )
    ) {
      return;
    }

    const token = localStorage.getItem("token") || "";
    const DELETE_URL = `http://localhost:8000/career/delete/${careerId}`;

    fetch(DELETE_URL, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(err.message || "Error al eliminar");
          });
        }
        return response.json();
      })
      .then((data) => {
        alert(data.message);
        navigate("/careers");
      })
      .catch((error) => {
        setMessage(`Error: ${error.message}`);
        console.error("Error al eliminar:", error);
      });
  };
  return (
  <InfoContainer>
    <div className="container mt-4">
      {/* Sección del título, similar al dashboard */}
      <h1>
        <span className="text-warning">Editando Carrera</span>
      </h1>
      <p className="lead">
        Modifica el nombre de la carrera o elimina el registro existente.
      </p>
      <hr
        className="my-4"
        style={{ borderColor: "rgba(255, 255, 255, 0.5)" }}
      />

      <div
        className="card p-4 shadow-lg"
        style={{ maxWidth: "600px", margin: "auto" }}
      >
        {/* Se eliminó el <h2> aquí ya que ahora es parte del h1 anterior */}
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
          <button type="submit" className="btn btn-success">
            Actualizar Carrera
          </button>
          <button
            type="button"
            className="btn btn-danger ms-2"
            onClick={handleDeleteCareer}
          >
            Eliminar Carrera
          </button>
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={() => navigate("/careers")}
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

export default CareerEdit;
