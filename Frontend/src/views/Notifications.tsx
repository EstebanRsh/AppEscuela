import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InfoContainer from "../components/common/InfoContainer"; // Asegúrate de importar tu InfoContainer
import { toast } from "react-toastify";
// Define la estructura de un mensaje/notificación
interface Message {
  id: number;
  sender_id: number;
  content: string;
  timestamp: string;
  is_read: boolean;
}

function Notifications() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Este efecto se ejecuta una vez cuando el componente se monta
  useEffect(() => {
    const fetchMessages = async () => {
      if (!token) {
        toast.error(
          "No se pudo verificar la sesión. Por favor, inicie sesión."
        );
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("No se pudieron cargar las notificaciones.");
        }

        const data = await response.json();
        // Ordenamos los mensajes para mostrar los no leídos primero
        const sortedData = data.sort(
          (a: Message, b: Message) => Number(a.is_read) - Number(b.is_read)
        );
        setMessages(sortedData);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [token]); // El efecto depende del token. Si cambia, se vuelve a ejecutar.

  // Función para marcar un mensaje como leído
  const markAsRead = async (messageId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/messages/${messageId}/read`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        // Actualiza el estado local para que el cambio se refleje en la UI al instante
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? { ...msg, is_read: true } : msg
          )
        );
        toast.success("Mensaje marcado como leído.");
      } else {
        toast.error("Error al marcar el mensaje como leído.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Ocurrió un error de red.");
    }
  };

  // Renderizado del componente
  return (
    <InfoContainer>
      <div className="container mt-4">
        <div className="card card-custom shadow-lg">
          <div className="card-header">
            <h1 className="m-0 h3">
              <i className="bi bi-bell-fill text-warning me-2"></i>
              Notificaciones
            </h1>
          </div>
          <div className="card-body">
            {isLoading && (
              <div className="text-center py-5">
                <div className="spinner-border text-warning" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            )}
            {!isLoading &&
              (messages.length > 0 ? (
                <ul className="list-group">
                  {messages.map((msg) => (
                    <li
                      key={msg.id}
                      className={`list-group-item d-flex justify-content-between align-items-center ${
                        msg.is_read
                          ? "list-group-item-dark"
                          : "list-group-item-warning text-dark"
                      }`}
                    >
                      <div className="me-3">
                        <p className="mb-1">{msg.content}</p>
                        <small className="text-muted">
                          {new Date(msg.timestamp).toLocaleString()}
                        </small>
                      </div>
                      {!msg.is_read && (
                        <button
                          className="btn btn-sm btn-outline-success flex-shrink-0"
                          onClick={() => markAsRead(msg.id)}
                        >
                          Marcar como leído
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="alert alert-info">
                  No tienes notificaciones nuevas.
                </div>
              ))}
            <div className="mt-4">
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate(-1)}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    </InfoContainer>
  );
}

export default Notifications;
