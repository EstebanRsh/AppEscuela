import { useEffect, useState } from 'react';
import InfoContainer from '../../components/common/InfoContainer';

// Definimos los tipos de datos que esperamos
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
        // Preparamos las dos peticiones a la API
        const myCareersPromise = fetch(`http://localhost:8000/user/career/${user.username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allCareersPromise = fetch(`http://localhost:8000/career/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Ejecutamos ambas peticiones en paralelo para más eficiencia
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

  return (
  <InfoContainer>
    <div className="container mt-4">
      <div className="card card-custom shadow-lg">
        <div className="card-header">
          <h1 className="m-0 h3">
            <i className="bi bi-mortarboard-fill text-warning me-2"></i>
            Gestión de Carreras
          </h1>
        </div>
        <div className="card-body">
          {/* [CAMBIO AQUÍ] Se añade la clase 'equal-height-row' a la fila */}
          <div className="row g-4 equal-height-row">
            {/* Columna para "Mis Carreras" */}
            <div className="col-md-6 d-flex flex-column">
              <h4>Mis Inscripciones</h4>
              <p className="text-white-50">Las carreras en las que estás inscrito actualmente.</p>
              {isLoading ? (
                <p>Cargando...</p>
              ) : (
                myCareers.length > 0 ? (
                  <ul className="list-group">
                    {myCareers.map((career) => (
                      <li key={career.carrera} className="list-group-item list-group-item-dark d-flex justify-content-between align-items-center">
                        {career.carrera}
                        <span className="badge bg-success">Inscrito</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  // Este div ahora crecerá para llenar el espacio
                  <div className="empty-career-box">
                    No estás inscrito en ninguna carrera.
                  </div>
                )
              )}
            </div>

            {/* Columna para "Carreras Disponibles" */}
            <div className="col-md-6 d-flex flex-column">
              <h4>Oferta Académica</h4>
              <p className="text-white-50">Todas las carreras disponibles en la institución.</p>
              {isLoading ? (
                <p>Cargando...</p>
              ) : (
                <ul className="list-group">
                  {allCareers.map((career) => (
                    <li key={career.id} className="list-group-item list-group-item-dark">
                      {career.name}
                    </li>
                  ))}
                </ul>
              )}
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