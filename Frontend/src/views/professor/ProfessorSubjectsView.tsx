import { useNavigate } from 'react-router-dom';
import InfoContainer from '../../components/common/InfoContainer';

function ProfessorSubjectsView() {

  const navigate = useNavigate();

  return (
    <InfoContainer>
      <div className="container mt-4">
        <div className="card card-custom shadow-lg">
          <div className="card-header">
            <h1 className="m-0 h3">
              <i className="bi bi-book-half text-warning me-2"></i>
              Materias de la Carrera 
            </h1>
          </div>
          <div className="card-body">
            <p className="lead">
              Esta sección mostrará la lista de materias asignadas al profesor para esta carrera.
            </p>
            
            <div className="alert alert-info mt-4">
              <i className="bi bi-tools me-2"></i>
              <strong>Funcionalidad en desarrollo...</strong>
                <br />
                Actualmente, esta vista está en construcción. Pronto podrás ver las materias asignadas a tu carrera y subir contenido para tus alumnos.
            </div>

            <div className="mt-4">
              <button 
                className="btn btn-outline-secondary" 
                // Usamos navigate(-1) para volver a la página anterior de forma sencilla
                onClick={() => navigate(-1)} 
              >
                <i className="bi bi-arrow-left me-2"></i>
                Volver a Carreras
              </button>
            </div>
          </div>
        </div>
      </div>
    </InfoContainer>
  );
}

export default ProfessorSubjectsView;