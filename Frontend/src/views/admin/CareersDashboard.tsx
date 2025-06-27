import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import InfoContainer from '../../components/common/InfoContainer';
// Definimos el tipo para una Carrera
type Career = {
  id: number;
  name: string;
};

function CareersDashboard() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const fetchCareers = () => {
    const token = localStorage.getItem("token") || "";
    const CAREERS_URL = "http://localhost:8000/career/all";

    fetch(CAREERS_URL, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setCareers(data);
      } else {
        setMessage("Error al cargar las carreras.");
      }
    })
    .catch(err => {
      console.error("Error fetching careers:", err);
      setMessage("No se pudieron obtener los datos del servidor.");
    });
  };

  useEffect(() => {
    fetchCareers();
  }, []);

return (
  <InfoContainer>
    <div className="container mt-4">
      {/* Sección del título, similar al dashboard */}
      <h1>
        <span className="text-warning">Gestión de Carreras</span>
      </h1>
      <p className="lead">
        Aquí puedes ver y administrar todas las carreras disponibles en el sistema.
      </p>
      <hr
        className="my-4"
        style={{ borderColor: "rgba(255, 255, 255, 0.5)" }}
      />

      <div className="d-flex justify-content-between align-items-center mb-3">
        {/* Se eliminó el <h2> aquí ya que ahora es parte del h1 anterior */}
        <Link to="/career/add" className="btn btn-success">
          Añadir Nueva Carrera
        </Link>
      </div>

      {message && <div className="alert alert-danger">{message}</div>}

      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>NOMBRE DE LA CARRERA</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {careers.length > 0 ? (
            careers.map((career) => (
              <tr key={career.id}>
                <td>{career.id}</td>
                <td>{career.name}</td>
                <td>
                  <Link to={`/career/edit/${career.id}`} className="btn btn-primary btn-sm">
                    Editar
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="text-center">
                No hay carreras para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </InfoContainer>
);
}

export default CareersDashboard;