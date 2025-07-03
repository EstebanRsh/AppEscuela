import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import InfoContainer from "../../components/common/InfoContainer";

// Se define un tipo más específico para el usuario
type User = {
  id: number;
  first_name: string;
  last_name: string;
  type: string;
  email: string;
  careers: string[];
};

function UsersDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = loggedInUser.type === "administrador";

  const fetchUsers = async () => {
    setIsLoading(true);
    setMessage(null);
    const token = localStorage.getItem("token") || "";
    const USERS_URL = "http://localhost:8000/users/all";

    try {
      const response = await fetch(USERS_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al cargar los usuarios.");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setMessage(error.message);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <InfoContainer>
      <div className="container mt-4">
        <div className="card card-custom shadow-lg">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h1 className="m-0 h3">
              <i className="bi bi-people-fill text-warning me-2"></i>
              Gestión de Usuarios
            </h1>
            {isAdmin && (
              <div className="d-flex gap-2">
                <Link
                  to="/admin/users/signup"
                  className="btn btn-outline-success d-flex align-items-center"
                >
                  <i className="bi bi-person-plus-fill me-2"></i>
                  Registrar Usuario
                </Link>
              </div>
            )}
          </div>
          <div className="card-body">
            <p className="lead mb-4">
              Desde aquí puedes ver la lista de usuarios y editar sus perfiles.
            </p>

            {/* El mensaje de error y el spinner de carga se mantienen igual */}
            {message && <div className="alert alert-danger">{message}</div>}

            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-warning" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2">Cargando usuarios...</p>
              </div>
            ) : (
              <div className="table-responsive">
                {/* PASO 1: Asegúrate que esta clase esté en la tabla */}
                <div className="tableWrapper">
                  <div className="tableBodyScroll">
                    <table className="table table-hover align-middle table-responsive-cards mb-0">
                      <thead className="stickyHeader">
                        <tr>
                          <th>NOMBRE</th>
                          <th>APELLIDO</th>
                          <th>TIPO</th>
                          <th>EMAIL</th>
                          <th>CARRERAS</th>
                          {isAdmin && <th className="text-end">ACCIONES</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {users.length > 0 ? (
                          users.map((user_item) => (
                            <tr key={user_item.id}>
                              <td data-label="Nombre">
                                {user_item.first_name}
                              </td>
                              <td data-label="Apellido">
                                {user_item.last_name}
                              </td>
                              <td data-label="Tipo">{user_item.type}</td>
                              <td data-label="Email">{user_item.email}</td>
                              <td data-label="Carreras">
                                {user_item.careers.length > 0 ? (
                                  user_item.careers.map((career, index) => (
                                    <span
                                      key={index}
                                      className="badge bg-secondary me-1"
                                    >
                                      {career}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-white-50">--</span>
                                )}
                              </td>
                              {isAdmin && (
                                <td
                                  data-label="Acciones"
                                  className="text-end actions-cell"
                                >
                                  <Link
                                    to={`/admin/users/${user_item.id}/edit`}
                                    className="btn btn-outline-primary btn-sm"
                                  >
                                    <i className="bi bi-pencil-square me-1"></i>
                                    Editar / Asignar
                                  </Link>
                                </td>
                              )}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={isAdmin ? 6 : 5}>
                              <div className="empty-state">
                                <i className="bi bi-person-x-fill"></i>
                                <h4 className="mt-3">
                                  No se encontraron usuarios
                                </h4>
                                <p>
                                  Aún no hay usuarios registrados en el sistema.
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </InfoContainer>
  );
}

// Corregí el nombre de la exportación para que coincida con el propósito del archivo.
export default UsersDashboard;
