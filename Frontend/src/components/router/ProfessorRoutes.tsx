import { Navigate, Outlet } from "react-router-dom";

function ProfessorRoutes() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  // Verificamos si el usuario es profesor O administrador
  const isAuthorized = user && (user.type === "profesor" || user.type === "administrador");

  if (!isAuthorized) {
    // Si no está autorizado, lo redirigimos al dashboard general
    return <Navigate to="/dashboard" />;
  }

  // Si está autorizado, permitimos el acceso
  return <Outlet />;
}

export default ProfessorRoutes;