import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const navbarTogglerRef = useRef<HTMLButtonElement>(null);
  const collapseNavbarRef = useRef<HTMLDivElement>(null);
  
  // --- Estados y referencias para los menús ---
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false); // Para el menú de escritorio
  const [isMobileProfileVisible, setIsMobileProfileVisible] = useState(false); // Para la VISTA de móvil

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user && user.type === "administrador";
  const isStudent = user.type === "alumno";

  // Cierra el menú desplegable de ESCRITORIO si se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileMenuRef]);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const closeNavbarCollapse = () => {
    if (collapseNavbarRef.current?.classList.contains("show")) {
      navbarTogglerRef.current?.click();
    }
  };

  const handleMenuLinkClick = () => {
    setIsProfileMenuOpen(false);
    closeNavbarCollapse();
  };

  // --- NUEVAS FUNCIONES PARA LA VISTA MÓVIL ---
  const showMobileProfile = (e: React.MouseEvent) => {
    e.preventDefault(); // Evita que el link recargue la página
    closeNavbarCollapse();
    setIsMobileProfileVisible(true);
  };
  
  const hideMobileProfile = () => {
      setIsMobileProfileVisible(false);
  };
  // ------------------------------------------

  const profileImageUrl = user.profile_image_url
    ? `http://localhost:8000${user.profile_image_url}`
    : `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=ffc107&color=000&size=100`;
  
  const activeLinkStyle = {
    color: "#FFD700",
    fontWeight: "600",
  };

  return (
    // Usamos un Fragment (<>) para poder tener la navbar y la vista de perfil al mismo nivel
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div className="container-fluid">
          <NavLink className="navbar-brand d-flex align-items-center" to="/dashboard" onClick={closeNavbarCollapse}>
            <i className="bi bi-mortarboard-fill fs-2 me-2"></i>
            <strong>App Escuela</strong>
          </NavLink>

          <button ref={navbarTogglerRef} className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav" ref={collapseNavbarRef}>
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {isAdmin && (
                <>
                  <li className="nav-item"><NavLink className="nav-link" to="/dashboard" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={closeNavbarCollapse}>Dashboard</NavLink></li>
                  <li className="nav-item"><NavLink className="nav-link" to="/users" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={closeNavbarCollapse}>Usuarios</NavLink></li>
                  <li className="nav-item"><NavLink className="nav-link" to="/payments" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={closeNavbarCollapse}>Pagos</NavLink></li>
                  <li className="nav-item"><NavLink className="nav-link" to="/careers" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={closeNavbarCollapse}>Carreras</NavLink></li>
                </>
              )}
              {isStudent && (
                <>
                  <li className="nav-item"><NavLink className="nav-link" to="/my-payments" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={closeNavbarCollapse}>Mis Pagos</NavLink></li>
                  <li className="nav-item"><NavLink className="nav-link" to="/notifications" style={({ isActive }) => isActive ? activeLinkStyle : undefined} onClick={closeNavbarCollapse}>Notificaciones</NavLink></li>
                </>
              )}
              {/* [CAMBIO] Link de Perfil que se muestra SOLO en MÓVIL (d-lg-none) */}
              <li className="nav-item d-lg-none">
                <a className="nav-link" href="#" onClick={showMobileProfile}>Perfil</a>
              </li>
            </ul>

            {/* [CAMBIO] El menú desplegable de ESCRITORIO ahora se oculta en móvil (d-none d-lg-flex) */}
            <div className="navbar-nav d-none d-lg-flex" ref={profileMenuRef}>
              <div className="nav-item-profile">
                <img src={profileImageUrl} alt="Foto de perfil" className="profile-avatar" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} />
                {isProfileMenuOpen && (
                  <div className="profile-dropdown-menu-navbar">
                    <div className="p-3 text-center border-bottom border-secondary">
                      <img src={profileImageUrl} alt="Foto de perfil" className="profile-dropdown-avatar mb-2" />
                      <h6 className="mb-0">{user.first_name} {user.last_name}</h6>
                      <small className="text-white-50">{user.email}</small>
                    </div>
                    <NavLink to="/profile" className="dropdown-item-custom" onClick={handleMenuLinkClick}>
                      <i className="bi bi-person-circle me-2"></i>Gestionar Perfil
                    </NavLink>
                    <div className="dropdown-divider-custom"></div>
                    <div className="dropdown-item-custom" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2 text-danger"></i>Cerrar Sesión
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* [CAMBIO] Botón de Cerrar Sesión que se muestra SOLO en MÓVIL (d-lg-none) */}
            <ul className="navbar-nav d-lg-none">
               <li className="nav-item">
                 <a className="nav-link" href="#" onClick={handleLogout}>Cerrar Sesión</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* --- CÓDIGO NUEVO: LA VISTA DE PERFIL A PANTALLA COMPLETA --- */}
      <div className={`mobile-profile-view ${isMobileProfileVisible ? 'active' : ''}`}>
        <div className="mobile-profile-header">
          <button className="btn btn-outline-light border-0" onClick={hideMobileProfile}>
            <i className="bi bi-arrow-left fs-4"></i>
          </button>
          <h4 className="m-0">Mi Perfil</h4>
          <div style={{width: '40px'}}></div> {/* Espaciador para centrar el título */}
        </div>
        <div className="mobile-profile-content">
          <img src={profileImageUrl} alt="Foto de perfil" className="profile-dropdown-avatar mb-3" />
          <h3>{user.first_name} {user.last_name}</h3>
          <p className="lead text-white-50">{user.email}</p>
          <span className="badge bg-warning text-dark">{user.type}</span>
          <hr className="hr-custom my-4" />
          <p>
            <NavLink to="/profile" onClick={hideMobileProfile} className="btn btn-outline-primary w-100">
              Editar Información y Contraseña
            </NavLink>
          </p>
        </div>
      </div>
    </>
  );
};

export default Navbar;