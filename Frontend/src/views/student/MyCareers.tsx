import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import InfoContainer from '../../components/common/InfoContainer';

// Tipos de datos que esperamos
type UserCareer = {
  carrera: string;
};

type AllCareers = {
  id: number;
  name: string;
};

function MyCareers() {
  const [myCareers, setMyCareers] = useState<UserCareer[]>([]);
  const [allCareers, setAllCareers] = useState<AllCareers[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const userString = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!userString || !token) {
        setMessage("No se pudo verificar la sesión.");
        setIsLoading(false);
        return;
      }

      try {
        const user = JSON.parse(userString);
        const myCareersPromise = fetch(`http://localhost:8000/user/career/${user.username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allCareersPromise = fetch(`http://localhost:8000/career/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const [myCareersRes, allCareersRes] = await Promise.all([myCareersPromise, allCareersPromise]);

        if (!myCareersRes.ok || !allCareersRes.ok) {
          throw new Error("No se pudo cargar la información de las carreras.");
        }

        const myCareersData = await myCareersRes.json();
        const allCareersData = await allCareersRes.json();

        setMyCareers(myCareersData);
        setAllCareers(allCareersData);

      } catch (err: any) {
        setMessage(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtramos las carreras en las que el alumno está inscrito para obtener sus IDs
  const enrolledCareers = allCareers.filter(ac => myCareers.some(mc => mc.carrera === ac.name));

  return (
    <InfoContainer>
      <div className="container mt-4">
        <div className="card card-custom shadow-lg">
          <div className="card-header">
            <h1 className="m-0 h3">
              <i className="bi bi-mortarboard-fill text-warning me-2"></i>
              Mis Carreras
            </h1>
          </div>
          <div className="card-body p-4">
            <h4 className="mb-3">Mis Inscripciones</h4>
            <p className="text-white-50 lead mb-4">
              Selecciona una carrera para ver las materias y el material de estudio.
            </p>

            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-warning" role="status"></div>
              </div>
            ) : (
              enrolledCareers.length > 0 ? (
                <div className="row g-4">
                  {enrolledCareers.map((career) => (
                    <div key={career.id} className="col-md-6 col-lg-4">
                      <Link
                        to={`/student/career/${career.id}/subjects`}
                        className="text-decoration-none"
                        title={`Ver materias de ${career.name}`}
                      >
                        <div className="card card-custom dashboard-card h-100">
                          <div className="card-body text-center d-flex flex-column justify-content-center align-items-center">
                            <i className="bi bi-folder-check display-4 text-warning mb-3"></i>
                            <h5 className="card-title flex-grow-1">{career.name}</h5>
                            <div className="mt-3">
                              <span className="btn btn-outline-warning btn-sm">
                                <i className="bi bi-arrow-right-circle me-2"></i>
                                Acceder
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
                  Aún no estás inscrito en ninguna carrera.
                </div>
              )
            )}

            <hr className="hr-custom my-5" />
            
            <div className="accordion" id="accordionOffer">
              <div className="accordion-item card-custom">
                <h2 className="accordion-header" id="headingOne">
                  <button className="accordion-button collapsed bg-dark text-white" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOffer" aria-expanded="false" aria-controls="collapseOffer">
                    Ver Oferta Académica Completa
                  </button>
                </h2>
                <div id="collapseOffer" className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordionOffer">
                  <div className="accordion-body">
                    <p className="text-white-50">
                      Estas son todas las carreras disponibles en la institución.
                    </p>
                    <ul className="list-group">
                      {allCareers.map((career) => (
                        <li key={career.id} className="list-group-item list-group-item-dark">
                          {career.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {message && <div className="alert alert-danger mt-4">{message}</div>}
          </div>
        </div>
      </div>
    </InfoContainer>
  );
}

export default MyCareers;
