import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Gestión de Carreras</h2>
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
  );
}

export default CareersDashboard;