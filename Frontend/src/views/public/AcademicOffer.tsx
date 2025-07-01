import InfoContainer from '../../components/common/InfoContainer';

const CareerCard = ({ title, description, imageUrl }: { title: string; description: string; imageUrl: string }) => (
  <div className="col-md-6 col-lg-4 mb-4">
    <div className="card card-custom h-100 shadow-sm">
      <img src={imageUrl} className="card-img-top" alt={`Imagen de ${title}`} style={{ height: '200px', objectFit: 'cover' }} />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title text-warning">{title}</h5>
        <p className="card-text text-white-50 flex-grow-1">{description}</p>
        <a href="#" className="btn btn-outline-warning mt-auto">Ver Plan de Estudio</a>
      </div>
    </div>
  </div>
);

function AcademicOffer() {
  const careers = [
    {
      title: "Tecnicatura en Programación",
      description: "Desarrolla aplicaciones web y móviles con las tecnologías más demandadas del mercado. Aprende a crear soluciones innovadoras desde cero.",
      imageUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop"
    },
    {
      title: "Licenciatura en Diseño Gráfico",
      description: "Combina arte y tecnología para comunicar ideas visualmente. Domina herramientas de diseño y crea marcas que impacten.",
      imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=2071&auto=format&fit=crop"
    },
    {
      title: "Analista en Marketing Digital",
      description: "Conviértete en un experto en estrategias online, SEO, SEM y redes sociales para potenciar negocios en el mundo digital.",
      imageUrl: "https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=2071&auto=format&fit=crop"
    },
    {
        title: "Licenciatura en Ciberseguridad",
        description: "Protege sistemas y redes contra amenazas digitales. Fórmate en una de las áreas con mayor crecimiento y demanda laboral.",
        imageUrl: "https://images.unsplash.com/photo-1550751827-4138d04d475d?q=80&w=2070&auto=format&fit=crop"
    },
    {
        title: "Tecnicatura en Redes y Telecomunicaciones",
        description: "Diseña, implementa y administra infraestructuras de red robustas y seguras para garantizar la conectividad global.",
        imageUrl: "https://images.unsplash.com/photo-1587135304313-116353ba37a4?q=80&w=1925&auto=format&fit=crop"
    },
    {
        title: "Licenciatura en Administración de Empresas",
        description: "Adquiere las herramientas para gestionar, liderar y optimizar organizaciones, impulsando su crecimiento y sostenibilidad.",
        imageUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop"
    }
  ];

  return (
    <InfoContainer>
      <div className="container mt-4">
        <div className="p-5 mb-4 bg-dark rounded-3 shadow">
          <div className="container-fluid py-5">
            <h1 className="display-5 fw-bold text-warning">Oferta Académica</h1>
            <p className="col-md-8 fs-4">
              Explora nuestras carreras diseñadas para el futuro. Formamos profesionales listos para los desafíos del mañana con un enfoque práctico y tecnológico.
            </p>
          </div>
        </div>
        <div className="row">
          {careers.map(career => <CareerCard key={career.title} {...career} />)}
        </div>
      </div>
    </InfoContainer>
  );
}

export default AcademicOffer;
