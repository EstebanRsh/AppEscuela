import { Suspense } from "react";
import { Outlet, NavLink } from "react-router-dom";
import Footer from "./Footer"; // Reutilizamos el mismo footer

// --- Componente de la Barra de Navegación Pública ---
const PublicNavbar = () => {
  return (
    <nav className="navbar fixed-top navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container-fluid">
        <NavLink className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-mortarboard-fill fs-2 me-2"></i>
          <strong>App Escuela</strong>
        </NavLink>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#publicNavbar">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="publicNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/about-us">Nuestra Historia</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/academic-offer">Oferta Académica</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/news">Noticias</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/contact">Contacto</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/gallery">Galería</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/faq">Preguntas frecuentes</NavLink>
            </li>
          </ul>
          <NavLink to="/login" className="btn btn-outline-warning">
            <i className="bi bi-person-circle me-2"></i>
            Iniciar Sesión
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

// --- Componente del Layout Público ---
function PublicLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicNavbar />
      <main style={{ flex: 1, paddingTop: '70px' }}>
        <Suspense fallback={<div>Cargando...</div>}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;