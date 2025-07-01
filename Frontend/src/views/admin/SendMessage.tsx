import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InfoContainer from '../../components/common/InfoContainer';

// Tipos para los datos
type User = {
  id: number;
  first_name: string;
  last_name: string;
  type: string;
};

function SendMessage() {
  const { recipientId } = useParams<{ recipientId?: string }>();
  const navigate = useNavigate();

  const [content, setContent] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState(recipientId || '');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar la lista de todos los usuarios para el selector
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:8000/users/all', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('No se pudieron cargar los usuarios.');
        const usersData = await res.json();
        // Filtramos para que solo se puedan enviar mensajes a alumnos y profesores
        setAllUsers(usersData.filter((u: User) => u.type === 'alumno' || u.type === 'profesor'));
      } catch (error) {
        console.error(error);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipient) {
      setStatus({ type: 'error', text: 'Por favor, selecciona un destinatario.' });
      return;
    }

    setIsLoading(true);
    setStatus(null);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:8000/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipient_id: Number(selectedRecipient),
          content: content,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'Error al enviar el mensaje.');
      }

      setStatus({ type: 'success', text: result.detail || 'Mensaje enviado correctamente.' });
      setContent(''); // Limpiar el campo de texto
      
    } catch (error: any) {
      setStatus({ type: 'error', text: error.message });
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
              <i className="bi bi-send-fill text-warning me-2"></i>
              Enviar Mensaje
            </h1>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="recipient" className="form-label">Destinatario</label>
                <select
                  id="recipient"
                  className="form-select"
                  value={selectedRecipient}
                  onChange={(e) => setSelectedRecipient(e.target.value)}
                  required
                >
                  <option value="" disabled>Selecciona un usuario...</option>
                  {allUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.type})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="content" className="form-label">Mensaje</label>
                <textarea
                  id="content"
                  className="form-control"
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

              {status && (
                <div className={`alert alert-${status.type === 'success' ? 'success' : 'danger'} mt-3`}>
                  {status.text}
                </div>
              )}

              <div className="d-flex justify-content-end mt-4">
                <button type="button" className="btn btn-outline-secondary me-2" onClick={() => navigate(-1)}>
                  Volver
                </button>
                <button type="submit" className="btn btn-outline-success" disabled={isLoading}>
                  {isLoading ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </InfoContainer>
  );
}

export default SendMessage;