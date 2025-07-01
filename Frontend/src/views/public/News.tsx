import InfoContainer from '../../components/common/InfoContainer';

const NewsCard = ({ title, date, excerpt, imageUrl }: { title: string; date: string; excerpt: string; imageUrl: string }) => (
  <div className="col-md-6 col-lg-4 mb-4">
    <div className="card card-custom h-100 shadow-sm">
      <img src={imageUrl} className="card-img-top" alt={`Imagen de ${title}`} style={{ height: '200px', objectFit: 'cover' }} />
      <div className="card-body">
        <p className="card-text text-white-50"><small>{date}</small></p>
        <h5 className="card-title text-warning">{title}</h5>
        <p className="card-text">{excerpt}</p>
      </div>
      <div className="card-footer bg-transparent border-top-0">
         <a href="#" className="btn btn-sm btn-outline-light">Leer más...</a>
      </div>
    </div>
  </div>
);

function News() {
  const newsItems = [
    {
      title: "Lanzamos el nuevo Laboratorio de Ciberseguridad",
      date: "25 de Junio, 2025",
      excerpt: "Con equipos de última generación, nuestros alumnos ahora pueden practicar en entornos simulados de alta complejidad.",
      imageUrl: "https://images.unsplash.com/photo-1614064548237-096537d54648?q=80&w=1974&auto=format&fit=crop"
    },
    {
      title: "Acuerdo de Pasantías con Empresas Líderes",
      date: "18 de Junio, 2025",
      excerpt: "Hemos firmado convenios con las principales empresas tecnológicas para ofrecer oportunidades únicas a nuestros estudiantes.",
      imageUrl: "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop"
    },
    {
      title: "Hackathon 2025: ¡Inscripciones Abiertas!",
      date: "10 de Junio, 2025",
      excerpt: "Participa en nuestra competencia anual de programación y demuestra tu talento. Grandes premios y oportunidades te esperan.",
      imageUrl: "https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?q=80&w=2070&auto=format&fit=crop"
    }
  ];

  return (
    <InfoContainer>
      <div className="container mt-4">
        <h1 className="display-4 mb-4">Noticias y Novedades</h1>
        <div className="row">
          {newsItems.map(item => <NewsCard key={item.title} {...item} />)}
        </div>
      </div>
    </InfoContainer>
  );
}

export default News;