import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import InfoContainer from "../../components/common/InfoContainer";

// Tipo para los datos que esperamos de la API
type CareerData = {
  career_id: number;
  career_name: string;
  student_count: number;
};

function ProfessorCareersOverview() {
  const [dashboardData, setCareerData] = useState<CareerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCareerData = async () => {
      const token = localStorage.getItem("token") || "";
      const PROF_CAREERS_URL = "http://localhost:8000/professor/careers-data";

      try {
        const response = await fetch(PROF_CAREERS_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "No se pudieron cargar los datos.");
        }

        const data = await response.json();
        setCareerData(data);
      } catch (error: any) {
        setMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCareerData();
  }, []);

  if (isLoading) {
    return (
      <InfoContainer>
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </InfoContainer>
    );
  }

  return (
    <InfoContainer>
      <div className="container mt-4">
        <div className="card card-custom shadow-lg">
          <div className="card-header">
            <h1 className="m-0 h3">
              <i className="bi bi-person-video3 text-warning me-2"></i>
              Carreras Asignadas
            </h1>
          </div>
          <div className="card-body">
            <p className="lead mb-4">
              Aquí puedes ver un resumen de los alumnos inscritos en las carreras que tienes asignadas.
            </p>

            {message && <div className="alert alert-danger">{message}</div>}

            {dashboardData.length > 0 ? (
              <div className="row g-4">
                {dashboardData.map((career) => (
                  <div key={career.career_id} className="col-md-6 col-lg-4">
                    {/* Envolvemos toda la tarjeta en un Link */}
                    <Link 
                      to={`/professor/career/${career.career_id}/subjects`} 
                      className="text-decoration-none"
                      title={`Ver materias de ${career.career_name}`}
                    >
                      <div className="card card-custom dashboard-card h-100">
                        {/* Usamos d-flex y flex-column para que el botón se vaya al fondo
                        */}
                        <div className="card-body text-center d-flex flex-column justify-content-between">
                          {/* Contenido principal de la tarjeta */}
                          <div>
                            <h5 className="card-title text-warning">{career.career_name}</h5>
                            <p className="display-4 fw-bold">{career.student_count}</p>
                            <p className="card-text text-white-50">Alumnos Inscritos</p>
                          </div>
                          
                          {/* Botón añadido en la parte inferior */}
                          <div className="mt-3">
                            <span className="btn btn-outline-warning btn-sm">
                              <i className="bi bi-book-half me-2"></i>
                              Ver Materias
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-info">
                {message ? message : "Aún no tienes carreras asignadas. Contacta a un administrador."}
              </div>
            )}
          </div>
        </div>
      </div>
    </InfoContainer>
  );
}

export default ProfessorCareersOverview;