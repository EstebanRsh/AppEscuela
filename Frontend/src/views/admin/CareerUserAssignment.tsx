import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InfoContainer from '../../components/common/InfoContainer';

// --- TIPOS DE DATOS ---
type Career = { id: number; name: string };
type User = { id: number; first_name: string; last_name: string; type: 'alumno' | 'profesor' };

function CareerUserAssignment() {
  const navigate = useNavigate();

  // --- ESTADOS ---
  const [careers, setCareers] = useState<Career[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCareer, setSelectedCareer] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  
  const [isLoading, setIsLoading] = useState({ data: true, assignment: false });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // --- EFECTOS ---
  // Carga inicial de carreras y usuarios
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token") || "";
      const headers = { Authorization: `Bearer ${token}` };
      
      try {
        const [careersRes, usersRes] = await Promise.all([
          fetch("http://localhost:8000/career/all", { headers }),
          fetch("http://localhost:8000/users/all", { headers }) 
        ]);

        if (!careersRes.ok) throw new Error('No se pudieron cargar las carreras.');
        if (!usersRes.ok) throw new Error('No se pudieron cargar los usuarios.');

        const careersData = await careersRes.json();
        const usersData = await usersRes.json();

        setCareers(careersData);
        // Filtramos para quedarnos solo con alumnos y profesores
        setUsers(usersData.filter((u: User) => u.type === 'alumno' || u.type === 'profesor'));
        
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message });
      } finally {
        setIsLoading(prev => ({...prev, data: false}));
      }
    };
    fetchData();
  }, []);

  // --- MANEJADOR DEL FORMULARIO ---
  const handleAssignment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser || !selectedCareer) {
      setMessage({ type: 'error', text: 'Debes seleccionar un usuario y una carrera.' });
      return;
    }
    
    setIsLoading(prev => ({...prev, assignment: true}));
    setMessage(null);
    const token = localStorage.getItem("token") || "";

    try {
      const res = await fetch(`http://localhost:8000/users/${selectedUser}/careers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: Number(selectedCareer) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al asignar la carrera.");
      
      setMessage({ type: 'success', text: data.message || "¡Usuario asignado a la carrera con éxito!" });
      // Limpiamos la selección después de una asignación exitosa
      setSelectedUser('');
      setSelectedCareer('');

    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(prev => ({...prev, assignment: false}));
    }
  };

  // --- RENDERIZADO ---
  return (
    <InfoContainer>
      <div className="container mt-4">
        <div className="card card-custom shadow-lg" style={{ maxWidth: '700px', margin: 'auto' }}>
          <div className="card-header">
            <h1 className="m-0 h3">
              <i className="bi bi-person-plus-fill text-warning me-2"></i>
              Asignar Usuario a Carrera
            </h1>
          </div>
          <div className="card-body">
            <p className="lead mb-4">Selecciona un usuario y la carrera a la que deseas inscribirlo o asignarlo.</p>
            
            {isLoading.data ? (
              <div className="text-center py-4"><div className="spinner-border text-warning"></div></div>
            ) : (
              <form onSubmit={handleAssignment}>
                <div className="mb-3">
                  <label htmlFor="user-select" className="form-label">Usuario (Alumno/Profesor)</label>
                  <select 
                    id="user-select"
                    className="form-select" 
                    value={selectedUser} 
                    onChange={(e) => setSelectedUser(e.target.value)}
                    required
                  >
                    <option value="" disabled>--- Selecciona un usuario ---</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="career-select" className="form-label">Carrera</label>
                  <select 
                    id="career-select"
                    className="form-select" 
                    value={selectedCareer} 
                    onChange={(e) => setSelectedCareer(e.target.value)}
                    required
                  >
                    <option value="" disabled>--- Selecciona una carrera ---</option>
                    {careers.map(career => (
                      <option key={career.id} value={career.id}>{career.name}</option>
                    ))}
                  </select>
                </div>
                
                {message && (
                  <div className={`alert alert-${message.type} py-2`}>{message.text}</div>
                )}
                
                <hr className="hr-custom" />

                <div className="d-flex justify-content-between mt-4">
                   <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/admin/careers")}
                  >
                    Volver a Carreras
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-outline-success" 
                    disabled={isLoading.assignment}
                  >
                    {isLoading.assignment && <span className="spinner-border spinner-border-sm me-2"></span>}
                    Asignar Carrera
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </InfoContainer>
  );
}

export default CareerUserAssignment;