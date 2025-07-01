import InfoContainer from '../../components/common/InfoContainer';

function Contact() {
  return (
    <InfoContainer>
      <div className="container mt-4">
        <h1 className="display-4 text-center mb-5">Ponte en Contacto</h1>
        <div className="row g-4">
          {/* Columna de Información de Contacto */}
          <div className="col-lg-5 d-flex">
            <div className="card card-custom p-4 w-100">
                <h3 className="text-warning mb-4">Nuestras Oficinas</h3>
                <p>
                  <i className="bi bi-geo-alt-fill me-3 text-warning"></i>
                  Avenida de la Innovación 1234,
                  <br />
                  C1425FGE, Ciudad Autónoma de Buenos Aires, Argentina.
                </p>
                <p>
                  <i className="bi bi-telephone-fill me-3 text-warning"></i>
                  (011) 4567-8901
                </p>
                <p>
                  <i className="bi bi-envelope-fill me-3 text-warning"></i>
                  consultas@appescuela.edu.ar
                </p>

                <h4 className="mt-4 mb-3 text-warning">Departamentos</h4>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <strong>Admisiones:</strong> admisiones@appescuela.edu.ar
                  </li>
                  <li className="mb-2">
                    <strong>Atención al Alumno:</strong> alumnos@appescuela.edu.ar
                  </li>
                  <li>
                    <strong>Prensa y Comunicación:</strong> prensa@appescuela.edu.ar
                  </li>
                </ul>
            </div>
          </div>

          {/* Columna del Formulario */}
          <div className="col-lg-7">
            <div className="card card-custom p-4">
              <h3 className="text-warning mb-4">Envíanos tu Consulta</h3>
              <form>
                <div className="mb-3">
                  <label htmlFor="contactName" className="form-label">Nombre Completo</label>
                  <input type="text" className="form-control" id="contactName" required />
                </div>
                <div className="mb-3">
                  <label htmlFor="contactEmail" className="form-label">Correo Electrónico</label>
                  <input type="email" className="form-control" id="contactEmail" required />
                </div>
                <div className="mb-3">
                  <label htmlFor="contactSubject" className="form-label">Asunto</label>
                  <select className="form-select" id="contactSubject">
                    <option>Consulta sobre Carreras</option>
                    <option>Proceso de Inscripción</option>
                    <option>Soporte Técnico</option>
                    <option>Otra Consulta</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="contactMessage" className="form-label">Mensaje</label>
                  <textarea className="form-control" id="contactMessage" rows={4} required></textarea>
                </div>
                <button type="submit" className="btn btn-outline-warning w-100">Enviar Mensaje</button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Mapa movido fuera de las columnas para ocupar todo el ancho */}
        <div className="card card-custom mt-4">
            <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.016709222381!2d-58.3815704!3d-34.6037389!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccacf0e586861%3A0x9526f8d39e3a6d96!2sObelisco!5e0!3m2!1ses-419!2sar!4v1672809210926!5m2!1ses-419!2sar" 
                width="100%" 
                height="350" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade">
            </iframe>
        </div>
      </div>
    </InfoContainer>
  );
}

export default Contact;
