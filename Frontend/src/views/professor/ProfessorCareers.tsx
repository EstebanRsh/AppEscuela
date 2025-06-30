import { useEffect, useState } from "react";
import InfoContainer from "../../components/common/InfoContainer";

// Tipo para los datos que esperamos de la API
type CareerData = {
  career_id: number;
  career_name: string;
  student_count: number;
};

function ProfessorDashboard() {
  const [dashboardData, setDashboardData] = useState<CareerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token") || "";
      const PROF_DASHBOARD_URL = "http://localhost:8000/professor/dashboard-data";

      try {
        const response = await fetch(PROF_DASHBOARD_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "No se pudieron cargar los datos.");
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (error: any) {
        setMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
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
              Dashboard de Profesor
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
                    <div className="card card-custom h-100">
                      <div className="card-body text-center">
                        <h5 className="card-title text-warning">{career.career_name}</h5>
                        <p className="display-4 fw-bold">{career.student_count}</p>
                        <p className="card-text text-white-50">Alumnos Inscritos</p>
                      </div>
                    </div>
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

export default ProfessorDashboard;