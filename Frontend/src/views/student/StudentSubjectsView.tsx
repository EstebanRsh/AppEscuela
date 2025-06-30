import { useParams, useNavigate } from 'react-router-dom';
import InfoContainer from '../../components/common/InfoContainer';

function StudentSubjectsView() {
  const { careerId } = useParams<{ careerId: string }>();
  const navigate = useNavigate();

  return (
    <InfoContainer>
      <div className="container mt-4">
        <div className="card card-custom shadow-lg">
          <div className="card-header">
            <h1 className="m-0 h3">
              <i className="bi bi-collection-fill text-warning me-2"></i>
              Materias de la Carrera (ID: {careerId})
            </h1>
          </div>
          <div className="card-body">
            <p className="lead">
              Aquí podrás ver las materias de la carrera, tu progreso y el material de estudio.
            </p>
            <div className="alert alert-info mt-4">
              <i className="bi bi-tools me-2"></i>
              <strong>Funcionalidad en desarrollo. </strong>
              Esta sección está en construcción y pronto podrás acceder a las materias y recursos de estudio.
            </div>
            <div className="mt-4">
              <button 
                className="btn btn-outline-secondary" 
                onClick={() => navigate(-1)} 
              >
                <i className="bi bi-arrow-left me-2"></i>
                Volver a Mis Carreras
              </button>
            </div>
          </div>
        </div>
      </div>
    </InfoContainer>
  );
}

export default StudentSubjectsView;