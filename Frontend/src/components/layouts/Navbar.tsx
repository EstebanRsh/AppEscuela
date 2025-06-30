import { NavLink, useNavigate } from "react-router-dom";
import { useRef } from "react";

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
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
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
                    Dashboard
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
                    Usuarios
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
                    Pagos
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
                    Carreras
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
                    Mis Pagos
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
                    Mis Carreras
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
                    Notificaciones
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
                  Carreras 
                </NavLink>
              </li>
            )}
          </ul>

          <ul className="navbar-nav">
            <li className="nav-item">
              <NavLink
                className="nav-link"
                to="/profile"
                style={({ isActive }) =>
                  isActive ? activeLinkStyle : undefined
                }
                onClick={closeNavbarCollapse}
              >
                <img
                  src={profileImageUrl}
                  alt="Mi Perfil"
                  className="profile-avatar me-2"
                />
                Mi Perfil
              </NavLink>
            </li>
            <li className="nav-item ms-lg-2">
              <a
                className="nav-link logout-link"
                href="#"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right align-middle fs-4"></i>
                <span className="align-middle ms-2 d-none d-lg-inline">
                  Cerrar Sesión
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
