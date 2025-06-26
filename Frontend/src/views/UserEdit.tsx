import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

// La interfaz no cambia
interface UserDetails {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  type: string;
  dni: number;
}

function UserEdit() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  // --- INICIO DE LA MODIFICACIÓN ---
  // 1. Usaremos un solo estado para todo el formulario, en lugar de refs.
  // Lo inicializamos con valores vacíos.
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    type: 'alumno',
    dni: 0,
  });
  // --- FIN DE LA MODIFICACIÓN ---

  const [message, setMessage] = useState<string | null>(null);

  // useEffect para cargar los datos iniciales
  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const FETCH_USER_URL = `http://localhost:8000/user/${userId}`;

    fetch(FETCH_USER_URL, { headers: { "Authorization": `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) {
           return res.json().then(errorInfo => { throw new Error(errorInfo.message || "Error"); });
        }
        return res.json();
      })
      .then((data: UserDetails) => {
        // 2. Cuando los datos llegan, actualizamos el estado del formulario.
        setFormData({
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            type: data.type,
            dni: data.dni
        });
      })
      .catch(err => {
        setMessage(`Error al cargar el usuario: ${err.message}`);
      });
  }, [userId]);

  // 3. Función que actualiza el estado cada vez que se escribe en un input.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value,
    }));
  };
  
  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    // 4. Los datos a enviar ya están listos en nuestro estado 'formData'.
    const updatedData = {
        ...formData,
        dni: parseInt(String(formData.dni), 10) // Aseguramos que el DNI sea un número
    };

    const token = localStorage.getItem("token") || "";
    const UPDATE_URL = `http://localhost:8000/user/update/${userId}`;

    const requestOptions = {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    };

    fetch(UPDATE_URL, requestOptions)
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorInfo => { throw new Error(errorInfo.message); });
        }
        return response.json();
      })
      .then(data => {
        alert(data.message);
        navigate('/dashboard');
      })
      .catch(error => {
        setMessage(error.message);
      });
  };

  return (
    <div className="container mt-4">
      <div className="card p-4 shadow-lg">
        {/* Usamos el estado para el título */}
        <h2 className="text-center mb-4">Editando a {formData.first_name} {formData.last_name}</h2>
        <form onSubmit={handleUpdate}>
          {/* 5. Los inputs ahora son 'controlados'. Usan 'value' y 'onChange'. */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="first_name">Nombre</label>
              <input type="text" id="first_name" className="form-control" value={formData.first_name} onChange={handleInputChange} required />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="last_name">Apellido</label>
              <input type="text" id="last_name" className="form-control" value={formData.last_name} onChange={handleInputChange} required />
            </div>
          </div>
          <div className="row">
             <div className="col-md-6 mb-3">
              <label htmlFor="dni">DNI</label>
              <input type="number" id="dni" className="form-control" value={formData.dni} onChange={handleInputChange} required />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" className="form-control" value={formData.email} onChange={handleInputChange} required />
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="type">Tipo de Usuario</label>
            <select id="type" className="form-select" value={formData.type} onChange={handleInputChange}>
              <option value="alumno">Alumno</option>
              <option value="profesor">Profesor</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>
          <button type="submit" className="btn btn-success">Actualizar Usuario</button>
          <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/dashboard')}>Cancelar</button>
          {message && <div className="alert alert-danger mt-3">{message}</div>}
        </form>
      </div>
    </div>
  );
}

export default UserEdit;