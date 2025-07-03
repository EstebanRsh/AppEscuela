import { useEffect, useState } from "react";
import { Badge, Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { BellFill } from "react-bootstrap-icons";

interface Message {
  id: number;
  sender_id: number;
  content: string;
  timestamp: string;
  is_read: boolean;
}

const NotificationBell = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showModal, setShowModal] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if(!token) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch("http://localhost:8000/messages", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("No autorizado");
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Error al obtener notificaciones", err);
      }
    };
    fetchMessages();
  }, [token]);

  const unreadCount = messages.filter((msg) => !msg.is_read).length;

  // 👉 Si no hay token, no mostrar nada
  if (!token) return null;

  return (
    <>
      <div
        style={{ position: "relative", cursor: "pointer" }}
        onClick={() => setShowModal(true)}
      >
        <BellFill size={22} className="text-light" />
        {unreadCount > 0 && (
          <Badge
            bg="danger"
            pill
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              fontSize: "0.6rem",
              animation: "pulse 1s infinite",
            }}
          >
            {unreadCount}
          </Badge>
        )}
      </div>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
        backdrop="static"
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>Notificaciones</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
          {messages.length === 0 ? (
            <p className="text-muted">No hay notificaciones.</p>
          ) : (
            messages
              .slice(0, 10)
              .map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2 mb-2 rounded ${
                    msg.is_read ? "bg-light text-muted" : "bg-warning text-dark"
                  }`}
                >
                  <p className="mb-1">{msg.content}</p>
                  <small className="text-muted">
                    {new Date(msg.timestamp).toLocaleString()}
                  </small>
                </div>
              ))
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowModal(false);
              navigate("/notifications");
            }}
          >
            Ver todas
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default NotificationBell;

