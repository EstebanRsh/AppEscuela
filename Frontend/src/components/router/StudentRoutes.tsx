import { Navigate, Outlet } from "react-router-dom";

function StudentRoutes() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  // Verificamos que el usuario exista y sea de tipo 'alumno'
  const isStudent = user && user.type === "alumno";

  if (!isStudent) {
    // Si no es un alumno, lo redirigimos al dashboard principal (de admin)
    return <Navigate to="/dashboard" />;
  }

  // Si es un alumno, le permitimos el acceso a las rutas anidadas
  return <Outlet />;
}

export default StudentRoutes;