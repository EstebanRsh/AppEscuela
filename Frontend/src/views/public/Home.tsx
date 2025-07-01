import InfoContainer from '../../components/common/InfoContainer';

function Home() {
  return (
    <InfoContainer>
      <div className="container mt-4">
        <div className="card card-custom shadow-lg">
          <div className="card-body p-lg-5">

            {/* Bienvenida */}
            <div className="mb-5 text-center">
              <h1 className="display-4 fw-bold text-warning">Bienvenido a App Escuela</h1>
              <p className="lead">
                Tu espacio digital para gestionar tu vida académica con eficiencia, claridad y confianza.
              </p>
            </div>

            {/* Qué ofrece la plataforma */}
            <div className="row text-center my-5">
              <div className="col-md-4">
                <h4 className="text-warning">Gestión Académica</h4>
                <p>
                  Consultá tus materias, docentes, horarios y plan de estudios desde un solo lugar.
                </p>
              </div>
              <div className="col-md-4">
                <h4 className="text-warning">Notificaciones en Tiempo Real</h4>
                <p>
                  Recibí mensajes importantes de tus profesores o del equipo administrativo de forma instantánea.
                </p>
              </div>
              <div className="col-md-4">
                <h4 className="text-warning">Seguimiento de Pagos</h4>
                <p>
                  Revisá tu historial de pagos, cuotas pendientes y accedé fácilmente a comprobantes.
                </p>
              </div>
            </div>

            <hr className="hr-custom my-5" />

            {/* Valores de la plataforma */}
            <div className="row text-center">
              <div className="col-md-6">
                <h5 className="text-warning">Innovación Educativa</h5>
                <p>
                  App Escuela incorpora herramientas tecnológicas para simplificar los procesos y potenciar la experiencia de aprendizaje.
                </p>
              </div>
              <div className="col-md-6">
                <h5 className="text-warning">Compromiso con la Comunidad</h5>
                <p>
                  Nuestra misión es acompañar a estudiantes, docentes y personal administrativo en su día a día académico.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </InfoContainer>
  );
}

export default Home;