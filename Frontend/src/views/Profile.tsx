import React, { useState } from "react";
import InfoContainer from "../components/common/InfoContainer";

function Profile() {
  // Estado para el usuario, se inicializa desde localStorage
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "{}")
  );

  // Estado para la VISTA PREVIA de la imagen nueva
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Estado para GUARDAR el archivo de imagen seleccionado
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Estado para mostrar mensajes de error o éxito
  const [message, setMessage] = useState<string | null>(null);

  // Estados para controlar el formulario de cambio de contraseña
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  
  // Función para manejar el envío del formulario
  const handlePasswordChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordMessage(null); // Limpiamos mensajes anteriores

    // Validación del frontend
    if (newPassword !== confirmNewPassword) {
      setPasswordMessage("Las nuevas contraseñas no coinciden.");
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setPasswordMessage("La nueva contraseña debe tener al menos 4 caracteres.");
      return;
    }

    const token = localStorage.getItem("token") || "";
    const CHANGE_PASS_URL = "http://localhost:8000/user/change-password/self";

    fetch(CHANGE_PASS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      })
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(err => { throw new Error(err.message || "Error en el servidor"); });
      }
      return res.json();
    })
    .then(data => {
      alert(data.message); // Mostramos un alert de éxito
      // Limpiamos y ocultamos el formulario
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setIsEditingPassword(false);
    })
    .catch((err: any) => {
      setPasswordMessage(err.message);
    });
  };
  // Se ejecuta cuando el usuario elige un archivo
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file); // Guardamos el archivo para poder subirlo después
      setPreviewImage(URL.createObjectURL(file)); // Creamos la URL para la vista previa
      setMessage(null); // Limpiamos mensajes anteriores
    }
  };

  // Se ejecuta cuando el usuario presiona "Guardar Foto"
  const handleImageUpload = () => {
    if (!selectedFile) {
      setMessage("Por favor, selecciona una imagen primero.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    const token = localStorage.getItem("token") || "";
    const UPLOAD_URL = "http://localhost:8000/user/upload-photo";

    fetch(UPLOAD_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
      .then((res) => {
        if (!res.ok) {
          // Si hay un error, lo procesamos para mostrar el mensaje
          return res.json().then(err => { throw err; });
        }
        return res.json();
      })
      .then((data) => {
        if (data.image_url) {
          // Actualizamos el usuario en el estado y en localStorage con la nueva URL de la foto
          const updatedUser = { ...user, profile_image_url: data.image_url };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
          alert("¡Foto guardada!");
          handleCancelUpload(); // Limpiamos la selección para terminar el proceso
        } else {
          setMessage(data.message || "No se pudo guardar la foto.");
        }
      })
      .catch((err: any) => {
        console.error("Error al subir imagen:", err);
        setMessage(err.message || "Ocurrió un error inesperado.");
      });
  };

  // Se ejecuta cuando el usuario presiona "Cancelar"
  const handleCancelUpload = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    // Limpiamos el input de archivo para poder volver a seleccionar la misma imagen si se desea
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Determina qué URL de imagen mostrar: la guardada o la aleatoria
  const profileImageUrl = user.profile_image_url
    ? `http://localhost:8000${user.profile_image_url}`
    : "https://loremflickr.com/150/150/animals";

return (
  <InfoContainer>
    <div className="container mt-4">
      <h1>
        <span className="text-warning">Mi Perfil</span>
      </h1>
      <p className="lead">
        Aquí puedes gestionar la información de tu cuenta y cambiar tu contraseña.
      </p>
      <hr
        className="my-4"
        style={{ borderColor: "rgba(255, 255, 255, 0.5)" }}
      />

      <div className="card p-4 shadow-lg">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 text-center mb-4 mb-md-0">
              <img
                src={previewImage || profileImageUrl}
                className="img-fluid rounded-circle"
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
                alt="Foto de perfil"
              />
              <div className="mt-3">
                <label htmlFor="file-upload" className="btn btn-outline-primary">
                  {selectedFile ? "Cambiar Selección" : "Elegir Foto"}
                </label>
                <input
                  id="file-upload"
                  type="file"
                  className="d-none"
                  onChange={handleImageChange}
                  accept="image/*"
                />
                {selectedFile && (
                  <>
                    <button onClick={handleImageUpload} className="btn btn-success ms-2">
                      Guardar Foto
                    </button>
                    <button onClick={handleCancelUpload} className="btn btn-secondary ms-2">
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="col-md-8">
              <h4>Datos Personales</h4>
              <p>
                <strong>Nombre:</strong> {user.first_name} {user.last_name}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Rol:</strong> {user.type}
              </p>
              <hr />
              <div className="mt-4">
                <h5>Seguridad de la Cuenta</h5>
                {isEditingPassword ? (
                  <form onSubmit={handlePasswordChange}>
                    <div className="mb-3">
                      <label htmlFor="currentPassword">Contraseña Actual</label>
                      <input
                        type="password"
                        id="currentPassword"
                        className="form-control"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="newPassword">Nueva Contraseña</label>
                      <input
                        type="password"
                        id="newPassword"
                        className="form-control"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="confirmNewPassword">Confirmar Nueva Contraseña</label>
                      <input
                        type="password"
                        id="confirmNewPassword"
                        className="form-control"
                        value={confirmNewPassword}
                        onChange={e => setConfirmNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary">Guardar Contraseña</button>
                    <button type="button" className="btn btn-secondary ms-2" onClick={() => setIsEditingPassword(false)}>Cancelar</button>
                  </form>
                ) : (
                  <button className="btn btn-outline-primary" onClick={() => setIsEditingPassword(true)}>
                    Cambiar mi Contraseña
                  </button>
                )}
                {passwordMessage && <div className="alert alert-danger mt-3">{passwordMessage}</div>}
              </div>
            </div>
          </div>
          {message && <div className="alert alert-danger mt-3">{message}</div>}
        </div>
      </div>
    </div>
  </InfoContainer>
);
}

export default Profile;