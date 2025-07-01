import InfoContainer from '../../components/common/InfoContainer';

function AboutUs() {
  return (
    <InfoContainer>
      <div className="container mt-4">
        <div className="card card-custom shadow-lg">
          <div className="card-body p-lg-5">

            {/* Encabezado con imagen */}
            <div className="row align-items-center mb-5">
              <div className="col-lg-6">
                <h1 className="display-4 fw-bold text-warning">Forjando el Futuro desde 1998</h1>
                <p className="lead">
                  Nacimos con la visión de transformar la educación a través de la tecnología y la innovación. Más de dos décadas después, seguimos comprometidos con la formación de líderes que inspiren el cambio.
                </p>
              </div>
              <div className="col-lg-6 d-none d-lg-block">
                <img 
                  src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop" 
                  className="img-fluid rounded shadow-lg" 
                  alt="Equipo trabajando en un proyecto tecnológico"
                />
              </div>
            </div>

            {/* Sección de Misión y Visión */}
            <div className="row text-center my-5">
              <div className="col-md-6">
                <h3 className="text-warning">Nuestra Misión</h3>
                <p>
                  Ofrecer una educación superior de excelencia, accesible e innovadora, que combine una sólida base teórica con experiencia práctica relevante. Preparamos a nuestros estudiantes para enfrentar los desafíos de un mundo globalizado y en constante cambio.
                </p>
              </div>
              <div className="col-md-6">
                <h3 className="text-warning">Nuestra Visión</h3>
                <p>
                  Ser la institución educativa líder en Latinoamérica, reconocida por su vanguardia tecnológica, su impacto en la comunidad y por formar profesionales íntegros, creativos y con un profundo sentido de la responsabilidad social.
                </p>
              </div>
            </div>

            <hr className="hr-custom my-5" />

            {/* Línea de Tiempo */}
            <h2 className="text-center mb-5">Nuestros Hitos</h2>
            <ul className="list-group list-group-flush">
              <li className="list-group-item list-group-item-dark">
                <strong>1998:</strong> Fundación de la Escuela con la carrera de Analista de Sistemas.
              </li>
              <li className="list-group-item list-group-item-dark">
                <strong>2005:</strong> Inauguramos nuestro campus actual y lanzamos la primera carrera de Diseño Gráfico.
              </li>
              <li className="list-group-item list-group-item-dark">
                <strong>2012:</strong> Introducimos las primeras aulas virtuales, iniciando nuestra modalidad híbrida.
              </li>
              <li className="list-group-item list-group-item-dark">
                <strong>2020:</strong> Lanzamiento de la Tecnicatura en Ciberseguridad, respondiendo a las nuevas demandas del mercado.
              </li>
              <li className="list-group-item list-group-item-dark">
                <strong>2024:</strong> Recibimos el premio a la "Innovación Educativa del Año" por nuestro enfoque práctico.
              </li>
            </ul>

          </div>
        </div>
      </div>
    </InfoContainer>
  );
}

export default AboutUs;
