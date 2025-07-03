import { NavLink, useNavigate } from "react-router-dom";
import { useRef } from "react";
import NotificationBell from "../common/NotificationBell";

const Navbar = () => {
  const navigate = useNavigate();
  const navbarTogglerRef = useRef<HTMLButtonElement>(null);
  const collapseNavbarRef = useRef<HTMLDivElement>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user && user.type === "administrador";
  const isStudent = user.type === "alumno";
  const isProfessor = user.type === "profesor";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    closeNavbarCollapse();
  };

  const closeNavbarCollapse = () => {
    if (collapseNavbarRef.current?.classList.contains("show")) {
      navbarTogglerRef.current?.click();
    }
  };

  const profileImageUrl = user.profile_image_url
    ? `http://localhost:8000${user.profile_image_url}`
    : `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=ffc107&color=000&size=40`;

  const activeLinkStyle = {
    color: "#FFD700",
    fontWeight: "600",
  };

  return (
    <nav className="navbar fixed-top navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container-fluid">
        <NavLink
          className="navbar-brand d-flex align-items-center"
          to="/dashboard"
          onClick={closeNavbarCollapse}
        >
          <i className="bi bi-mortarboard-fill fs-2 me-2"></i>
          <strong>App Escuela</strong>
        </NavLink>

        <button
          ref={navbarTogglerRef}
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse"
          id="navbarNav"
          ref={collapseNavbarRef}
        >
          {/* --- Enlaces Principales a la Izquierda --- */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {isAdmin && (
              <>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/dashboard"
                    style={({ isActive }) =>
                      isActive ? activeLinkStyle : undefined
                    }
                    onClick={closeNavbarCollapse}
                  >
                    <i className="bi bi-layout-wtf me-2"></i>Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/admin/users"
                    style={({ isActive }) =>
                      isActive ? activeLinkStyle : undefined
                    }
                    onClick={closeNavbarCollapse}
                  >
                    <i className="bi bi-people-fill me-2"></i>Usuarios
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/admin/payments"
                    style={({ isActive }) =>
                      isActive ? activeLinkStyle : undefined
                    }
                    onClick={closeNavbarCollapse}
                  >
                    <i className="bi bi-cash-coin me-2"></i>Pagos
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/admin/careers"
                    style={({ isActive }) =>
                      isActive ? activeLinkStyle : undefined
                    }
                    onClick={closeNavbarCollapse}
                  >
                    <i className="bi bi-diagram-3-fill me-2"></i>Carreras
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/admin/messages"
                    style={({ isActive }) =>
                      isActive ? activeLinkStyle : undefined
                    }
                    onClick={closeNavbarCollapse}
                  >
                    <i className="bi bi-send-fill me-2"></i>Enviar Mensaje
                  </NavLink>
                </li>
              </>
            )}
            {isStudent && (
              <>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/student/payments"
                    style={({ isActive }) =>
                      isActive ? activeLinkStyle : undefined
                    }
                    onClick={closeNavbarCollapse}
                  >
                    <i className="bi bi-wallet2 me-2"></i>Mis Pagos
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/student/careers"
                    style={({ isActive }) =>
                      isActive ? activeLinkStyle : undefined
                    }
                    onClick={closeNavbarCollapse}
                  >
                    <i className="bi bi-mortarboard-fill me-2"></i>Mis Carreras
                  </NavLink>
                </li>
              </>
            )}
            {isProfessor && (
              <li className="nav-item">
                <NavLink
                  className="nav-link"
                  to="/professor/careers"
                  style={({ isActive }) =>
                    isActive ? activeLinkStyle : undefined
                  }
                  onClick={closeNavbarCollapse}
                >
                  <i className="bi bi-person-video3 me-2"></i>Carreras
                </NavLink>
              </li>
            )}
          </ul>

          {/* --- CORRECCIÓN AQUÍ: Contenedor para los elementos de la derecha --- */}
          {/* Usamos d-flex y align-items-center para alinear todo verticalmente */}
          <div className="d-flex align-items-center">
            {localStorage.getItem("token") && (
              <ul className="navbar-nav">
                <li className="nav-item d-flex align-items-center me-3">
                  <NotificationBell />
                </li>
              </ul>
            )}

            <ul className="navbar-nav ms-lg-2">
              {" "}
              {/* Margen para separar en pantallas grandes */}
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    src={profileImageUrl}
                    alt="Mi Perfil"
                    className="profile-avatar me-2"
                  />
                  {user.first_name}
                </a>
                <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end">
                  <li>
                    <NavLink
                      className="dropdown-item"
                      to="/profile"
                      onClick={closeNavbarCollapse}
                    >
                      <i className="bi bi-person-circle me-2"></i>Mi Perfil
                    </NavLink>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <a
                      className="dropdown-item logout-link"
                      href="#"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>Cerrar
                      Sesión
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
