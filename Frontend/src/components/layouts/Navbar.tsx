import { NavLink, useNavigate } from "react-router-dom";
import { useRef } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const navbarTogglerRef = useRef<HTMLButtonElement>(null);
  const collapseNavbarRef = useRef<HTMLDivElement>(null);

  // Leemos el objeto 'user' completo desde localStorage y lo parseamos
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user?.first_name || null; // Obtenemos el nombre del usuario
  const isAdmin = user && user.type === "administrador"; // Verificamos si es admin

  // Función para cerrar sesión y limpiar localStorage
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // Esto eliminará el objeto completo
    closeNavbarCollapse(); // Cierra el menú en móvil
    navigate("/login");
  };

  // Función para cerrar el menú en móviles al hacer clic en un enlace
  const closeNavbarCollapse = () => {
    if (
      collapseNavbarRef.current &&
      collapseNavbarRef.current.classList.contains("show")
    ) {
      // Simula un clic en el botón toggler para cerrar el menú.
      // Esta es una forma efectiva de usar la funcionalidad de Bootstrap.
      navbarTogglerRef.current?.click();
    }
  };

  const activeLinkStyle = {
    color: "#FFD700", // Color dorado para el enlace activo
    fontWeight: "600",
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        {/* El logo/marca de la aplicación con el nombre del usuario */}
        <NavLink
          className="navbar-brand d-flex align-items-center"
          to="/dashboard" // La marca siempre redirige al dashboard si el usuario está logueado
          onClick={closeNavbarCollapse}
        >
          <i
            className="bi bi-mortarboard-fill"
            style={{ fontSize: "2rem", marginRight: "0.8rem" }}
          ></i>
          <div className="d-flex flex-column">
            <strong>App Escuela</strong>
            {userName && ( // Muestra el saludo solo si hay un nombre de usuario
              <small style={{ fontSize: "0.7em", opacity: 0.8 }}>
                Hola, {userName}
              </small>
            )}
          </div>
        </NavLink>

        {/* Botón del menú hamburguesa para móviles */}
        <button
          ref={navbarTogglerRef} // Asocia la referencia al botón
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Contenido del Navbar que se colapsa */}
        <div
          className="collapse navbar-collapse"
          id="navbarNav"
          ref={collapseNavbarRef}
        >
          {" "}
          {/* Asocia la referencia al div colapsable */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/dashboard"
                style={({ isActive }) =>
                  isActive ? activeLinkStyle : undefined
                }
                onClick={closeNavbarCollapse}
              >
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/profile"
                style={({ isActive }) =>
                  isActive ? activeLinkStyle : undefined
                }
                onClick={closeNavbarCollapse}
              >
                Profile
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/payments"
                style={({ isActive }) =>
                  isActive ? activeLinkStyle : undefined
                }
                onClick={closeNavbarCollapse}
              >
                Pagos
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/careers"
                style={({ isActive }) =>
                  isActive ? activeLinkStyle : undefined
                }
                onClick={closeNavbarCollapse}
              >
                Carreras
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/notifications"
                style={({ isActive }) =>
                  isActive ? activeLinkStyle : undefined
                }
                onClick={closeNavbarCollapse}
              >
                Notifications
              </NavLink>
            </li>
            {isAdmin && (
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  to="/users"
                  style={({ isActive }) =>
                    isActive ? activeLinkStyle : undefined
                  }
                  onClick={closeNavbarCollapse}
                >
                  Usuarios
                </NavLink>
              </li>
            )}
          </ul>
          <ul className="navbar-nav">
            <li className="nav-item">
              <NavLink
                className="nav-link d-flex align-items-center justify-content-center logout-link" // Agregada la clase 'logout-link'
                to="/login"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right me-2 text-danger fs-4"></i>{" "}
                Cerrar Sesión
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
