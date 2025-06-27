import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Importar Link para el botón
import InfoContainer from '../components/common/InfoContainer'; 

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
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
  <InfoContainer>
    <div className="container mt-4">
      {/* Sección del título principal, similar al dashboard */}
      <h1>
        <span className="text-warning">Gestión de Usuarios</span>
      </h1>
      <p className="lead">
        Desde aquí puedes ver la lista de usuarios y administrarlos.
      </p>
      <hr
        className="my-4"
        style={{ borderColor: "rgba(255, 255, 255, 0.5)" }}
      />

      <div className="d-flex justify-content-between align-items-center mb-3">
        {/* Se eliminó el <h2> "Dashboard" y el "Bienvenido" que ahora están en el h1/p.lead */}
        {isAdmin && (
          <Link to="/signup" className="btn btn-outline-light">
            Registrar Nuevo Usuario
          </Link>
        )}
      </div>

      {/* El título de la tabla se convierte en h4 o se integra en la descripción si es más apropiado */}
      <h4>Lista de Usuarios</h4>
      <div className="table-responsive">
        <table className="table table-dark table-hover">
          <thead className="thead-dark">
            <tr>
              <th>NOMBRE</th>
              <th>APELLIDO</th>
              <th>TIPO</th>
              <th>EMAIL</th>
              {isAdmin && <th>ACCIONES</th>}
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
                  {isAdmin && (
                    <td>
                      <Link
                        to={`/user/edit/${user_item.id}`}
                        className="btn btn-light btn-sm me-2"
                      >
                        Editar
                      </Link>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="text-center py-4">
                  No hay usuarios para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div>
        <button onClick={get_users_all} className="btn btn-secondary mt-3">
          Recargar datos
        </button>
      </div>
    </div>
  </InfoContainer>
);
}

export default Dashboard;