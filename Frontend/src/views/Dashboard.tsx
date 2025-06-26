import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Importar Link para el botón

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.first_name;
  const isAdmin = user.type === "administrador"; // Verificamos si es admin

  const BACKEND_IP = "localhost";
  const BACKEND_PORT = "8000";
  const ENDPOINT = "users/all";
  const USERS_URL = `http://${BACKEND_IP}:${BACKEND_PORT}/${ENDPOINT}`;

  type User = { id: number; [key: string]: any };
  const [data, setData] = useState<User[]>([]);

  function mostrar_datos(data: any) {
    if (data && !data.message) {
      setData(data);
    } else {
      setData([]);
      console.error("Error al cargar usuarios:", data.message);
    }
  }

  function get_users_all() {
    const token = localStorage.getItem("token") || "";

    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);
    myHeaders.append("Content-Type", "application/json");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
    };

    fetch(USERS_URL, requestOptions)
      .then((respond) => respond.json())
      .then((data) => mostrar_datos(data))
      .catch((error) => console.log("error", error));
  }

  useEffect(() => {
    get_users_all();
  }, []);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2>Dashboard</h2>
          <div>Bienvenido {userName}!</div>
        </div>
        {/* El botón solo se renderiza si el usuario es administrador */}
        {isAdmin && (
          <Link to="/signup" className="btn btn-primary">
            Registrar Nuevo Usuario
          </Link>
        )}
      </div>

      <h4>Lista de Usuarios</h4>
      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            <th>NOMBRE</th>
            <th>APELLIDO</th>
            <th>TIPO</th>
            <th>EMAIL</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((user_item) => (
              <tr key={user_item.id}>
                <td>{user_item.first_name}</td>
                <td>{user_item.last_name}</td>
                <td>{user_item.type}</td>
                <td>{user_item.email}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center">
                No hay usuarios para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div>
        <button onClick={get_users_all} className="btn btn-secondary mt-3">
          Recargar datos
        </button>
      </div>
    </div>
  );
}

export default Dashboard;