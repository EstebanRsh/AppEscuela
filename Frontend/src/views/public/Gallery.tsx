import InfoContainer from '../../components/common/InfoContainer';

function Gallery() {
  const images = [
    "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2148&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop"
  ];

  return (
    <InfoContainer>
      <div className="container mt-4">
        <h1 className="display-4 mb-4">Galería de Momentos</h1>
        <div className="row g-4">
          {images.map((src, index) => (
            <div key={index} className="col-lg-4 col-md-6">
              <img src={src} className="img-fluid rounded shadow-lg" alt={`Imagen de galería ${index + 1}`} style={{ width: '100%', height: '300px', objectFit: 'cover' }}/>
            </div>
          ))}
        </div>
      </div>
    </InfoContainer>
  );
}

export default Gallery;