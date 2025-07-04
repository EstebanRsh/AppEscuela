import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import InfoContainer from "../../components/common/InfoContainer";
import { toast } from "react-toastify";

// Definimos el tipo para una Carrera
type Career = {
  id: number;
  name: string;
};

function CareersDashboard() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCareers = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token") || "";
    const CAREERS_URL = "http://localhost:8000/career/all";

    try {
      const res = await fetch(CAREERS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al cargar las carreras.");
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setCareers(data);
      } else {
        throw new Error("La respuesta del servidor no es un formato esperado.");
      }
    } catch (err: any) {
      console.error("Error fetching careers:", err);
      toast.error(err.message || "No se pudieron obtener los datos del servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, []);

  return (
    <InfoContainer>
      <div className="container mt-4">
        <div className="card card-custom shadow-lg">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h1 className="m-0 h3">
              <i className="bi bi-diagram-3-fill text-warning me-2"></i>
              Gestión de Carreras
            </h1>
            <div className="d-flex gap-2">
              <Link
                to="/admin/careers/assign"
                className="btn btn-outline-warning d-flex align-items-center"
              >
                <i className="bi bi-person-plus-fill me-2"></i>
                Asignar Usuario
              </Link>
              <Link
                to="/admin/careers/enrollments"
                className="btn btn-outline-info d-flex align-items-center"
              >
                <i className="bi bi-search me-2"></i>
                Consultar Inscritos
              </Link>
              <Link
                to="/admin/careers/add"
                className="btn btn-outline-success d-flex align-items-center"
              >
                <i className="bi bi-plus-lg me-2"></i>
                Añadir Carrera
              </Link>
            </div>
          </div>
          <div className="card-body">
            <p className="lead mb-4">
              Aquí puedes ver, crear y administrar las carreras del sistema.
            </p>
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-warning" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2">Cargando carreras...</p>
              </div>
            ) : (
              <div className="table-responsive">
                {/* Se añade la clase 'table-responsive-cards' */}
                <table className="table table-hover align-middle table-responsive-cards">
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">NOMBRE DE LA CARRERA</th>
                      <th scope="col" className="text-end">
                        ACCIONES
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {careers.length > 0 ? (
                      careers.map((career) => (
                        <tr key={career.id}>
                          {/* Se añaden los 'data-label' */}
                          <td data-label="ID">{career.id}</td>
                          <td data-label="Nombre">{career.name}</td>
                          <td
                            data-label="Acciones"
                            className="text-end actions-cell"
                          >
                            <Link
                              to={`/admin/careers/${career.id}/edit`}
                              className="btn btn-outline-primary btn-sm"
                            >
                              <i className="bi bi-pencil-square me-1"></i>
                              Editar
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3}>
                          <div className="empty-state">
                            <i className="bi bi-exclamation-circle-fill"></i>
                            <h4 className="mt-3">
                              No hay carreras para mostrar
                            </h4>
                            <p>¡Comienza añadiendo la primera carrera!</p>
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

export default CareersDashboard;
