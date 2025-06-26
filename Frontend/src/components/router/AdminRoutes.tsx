import { Navigate, Outlet } from "react-router-dom";

function AdminRoutes() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user && user.type === "administrador";

  if (!isAdmin) {
    // Si no es admin, lo redirigimos al dashboard o a donde prefieras
    return <Navigate to="/dashboard" />;
  }

  // Si es admin, le permitimos el acceso
  return <Outlet />;
}

export default AdminRoutes;