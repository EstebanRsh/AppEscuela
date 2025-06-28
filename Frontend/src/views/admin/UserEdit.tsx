import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InfoContainer from '../../components/common/InfoContainer';

function UserEdit() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    type: 'alumno',
    dni: '',
  });

  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const FETCH_USER_URL = `http://localhost:8000/user/${userId}`;

    const fetchUserData = async () => {
        try {
            const res = await fetch(FETCH_USER_URL, { headers: { "Authorization": `Bearer ${token}` } });
            if (!res.ok) {
                const errorInfo = await res.json();
                throw new Error(errorInfo.message || "Error al cargar el usuario.");
            }
            const data = await res.json();
            setFormData({ ...data, dni: String(data.dni) }); // Guardamos el DNI como string para el input
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        }
    };

    fetchUserData();
  }, [userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value,
    }));
  };
  
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const token = localStorage.getItem("token") || "";
    const UPDATE_URL = `http://localhost:8000/user/update/${userId}`;

    try {
        const response = await fetch(UPDATE_URL, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...formData, dni: parseInt(formData.dni, 10) }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Error al actualizar.');
        }

        alert(result.message); // Usamos un alert para el éxito y redirigimos
        navigate('/users'); // Volvemos a la lista de usuarios

    } catch (error: any) {
        setMessage({ type: 'error', text: error.message });
    } finally {
        setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar a ${formData.first_name}? Esta acción es irreversible.`)) {
      return;
    }

    setIsDeleting(true);
    setMessage(null);
    const token = localStorage.getItem("token") || "";
    const DELETE_URL = `http://localhost:8000/user/delete/${userId}`;

    try {
        const response = await fetch(DELETE_URL, {
            method: 'GET', // o 'DELETE' si tu API lo soporta así
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Error al eliminar');
        }

        alert(result.message);
        navigate('/users'); // Redirigimos al dashboard de usuarios

    } catch (error: any) {
        setMessage({ type: 'error', text: error.message });
    } finally {
        setIsDeleting(false);
    }
  };

  return (
    <InfoContainer>
        <div className="container mt-4">
            <div className="card card-custom shadow-lg mx-auto" style={{ maxWidth: '800px' }}>
                <div className="card-header">
                    <h1 className="m-0 h3">
                        <i className="bi bi-pencil-square text-warning me-2"></i>
                        Editando Perfil de Usuario
                    </h1>
                </div>
                <div className="card-body p-4">
                    <h2 className="lead fs-4 mb-4">
                        Modificando datos de: <span className="fw-bold">{formData.first_name} {formData.last_name}</span>
                    </h2>
                    <form onSubmit={handleUpdate} noValidate>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label htmlFor="first_name">Nombre</label>
                                <input type="text" id="first_name" className="form-control" value={formData.first_name} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="last_name">Apellido</label>
                                <input type="text" id="last_name" className="form-control" value={formData.last_name} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-6">
                              <label htmlFor="dni">DNI</label>
                              <input type="number" id="dni" className="form-control" value={formData.dni} onChange={handleInputChange} required />
                            </div>
                            <div className="col-md-6">
                              <label htmlFor="email">Email</label>
                              <input type="email" id="email" className="form-control" value={formData.email} onChange={handleInputChange} required />
                            </div>
                            <div className="col-12">
                                <label htmlFor="type">Tipo de Usuario</label>
                                <select id="type" className="form-select" value={formData.type} onChange={handleInputChange}>
                                <option value="alumno">Alumno</option>
                                <option value="profesor">Profesor</option>
                                <option value="administrador">Administrador</option>
                                </select>
                            </div>
                        </div>

                        {message && <div className={`alert mt-4 ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>{message.text}</div>}

                        <div className="d-flex justify-content-between mt-4">
                            <button type="button" className="btn btn-outline-danger" onClick={handleDelete} disabled={isDeleting}>
                                {isDeleting ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-trash-fill me-2"></i>Eliminar</>}
                            </button>
                            <div>
                                <button type="button" className="btn btn-outline-secondary me-2" onClick={() => navigate(-1)}>Cancelar</button>
                                <button type="submit" className="btn btn-outline-success" disabled={isLoading}>
                                    {isLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : ''}
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </InfoContainer>
  );
}

export default UserEdit;