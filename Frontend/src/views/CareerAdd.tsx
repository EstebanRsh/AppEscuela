import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CareerAdd() {
  const navigate = useNavigate();
  const careerNameRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAddCareer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const careerName = careerNameRef.current?.value;

    if (!careerName) {
      setMessage("El nombre de la carrera no puede estar vacío.");
      return;
    }

    const token = localStorage.getItem("token") || "";
    const ADD_CAREER_URL = "http://localhost:8000/career/add";

    fetch(ADD_CAREER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: careerName })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message.includes("correctamente")) {
        alert(data.message);
        navigate('/careers');
      } else {
        setMessage(data.message);
      }
    })
    .catch(err => {
      console.error("Error al añadir carrera:", err);
      setMessage("Ocurrió un error en el servidor.");
    });
  };

  return (
    <div className="container mt-4">
      <div className="card p-4 shadow-lg" style={{ maxWidth: '600px', margin: 'auto' }}>
        <h2 className="text-center mb-4">Añadir Nueva Carrera</h2>
        <form onSubmit={handleAddCareer}>
          <div className="mb-3">
            <label htmlFor="careerName" className="form-label">Nombre de la Carrera</label>
            <input 
              type="text" 
              id="careerName" 
              className="form-control" 
              ref={careerNameRef} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary">Guardar Carrera</button>
          <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/careers')}>Cancelar</button>
          {message && <div className="alert alert-danger mt-3">{message}</div>}
        </form>
      </div>
    </div>
  );
}

export default CareerAdd;