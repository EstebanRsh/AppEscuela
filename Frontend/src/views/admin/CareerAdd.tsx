import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InfoContainer from '../../components/common/InfoContainer';

function CareerAdd() {
  const navigate = useNavigate();
  const [careerName, setCareerName] = useState('');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddCareer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!careerName.trim()) {
      setMessage({ type: 'error', text: "El nombre de la carrera no puede estar vacío." });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const token = localStorage.getItem("token") || "";
    const ADD_CAREER_URL = "http://localhost:8000/career/add";

    try {
        const response = await fetch(ADD_CAREER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: careerName })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Error al añadir la carrera.");
        }

        alert(result.message);
        navigate('/careers');

    } catch (err: any) {
        setMessage({ type: 'error', text: err.message });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <InfoContainer>
      <div className="container mt-4">
        <div className="card card-custom shadow-lg mx-auto" style={{ maxWidth: '700px' }}>
            <div className="card-header">
                <h1 className="m-0 h3">
                    <i className="bi bi-plus-circle-dotted text-warning me-2"></i>
                    Añadir Nueva Carrera
                </h1>
            </div>
            <div className="card-body p-4">
                <p className="lead mb-4">
                    Introduce el nombre de la nueva carrera que se ofrecerá en la institución.
                </p>
                <form onSubmit={handleAddCareer}>
                    <div className="mb-3">
                        <label htmlFor="careerName" className="form-label">Nombre de la Carrera</label>
                        <input
                            type="text"
                            id="careerName"
                            className="form-control"
                            value={careerName}
                            onChange={(e) => setCareerName(e.target.value)}
                            placeholder="Ej: Tecnicatura Universitaria en Programación"
                            required
                        />
                    </div>

                    {message && (
                        <div className={`alert mt-3 alert-${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                            {message.text}
                        </div>
                    )}
                    
                    <div className="d-flex justify-content-end mt-4">
                        <button type="button" className="btn btn-outline-secondary me-2" onClick={() => navigate('/careers')}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-outline-success" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                                    Guardando...
                                </>
                            ) : 'Guardar Carrera'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      </div>
    </InfoContainer>
  );
}

export default CareerAdd;