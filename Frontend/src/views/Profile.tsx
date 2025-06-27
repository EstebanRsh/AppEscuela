import React, { useState } from "react";

function Profile() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "{}")
  );
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

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
           return res.json().then(err => { throw err; });
        }
        return res.json();
      })
      .then((data) => {
        if (data.image_url) {
          const updatedUser = { ...user, profile_image_url: data.image_url };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
          alert("¡Foto guardada!");
          handleCancelUpload(); // Limpiamos la selección
        } else {
          setMessage(data.message);
        }
      })
      // --- CORRECCIÓN DE TIPO ---
      .catch((err: any) => {
        console.error("Error al subir imagen:", err);
        setMessage(err.message || "Ocurrió un error al subir la imagen.");
      });
  };

  const handleCancelUpload = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const profileImageUrl = user.profile_image_url
    ? `http://localhost:8000${user.profile_image_url}`
    : "https://picsum.photos/150/150?animal";

  return (
    <div className="container mt-4">
      <div className="card p-4 shadow-lg">
        <h2 className="card-title text-center mb-4">Mi Perfil</h2>
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
                <label
                  htmlFor="file-upload"
                  className="btn btn-outline-primary"
                >
                  {selectedFile ? "Cambiar Selección" : "Elegir Foto"}
                </label>
                <input
                  id="file-upload"
                  type="file"
                  className="d-none"
                  onChange={handleImageChange}
                  accept="image/*"
                />

                {/* Botón para guardar la foto, solo aparece si hay una seleccionada */}
                {selectedFile && (
                  <>
                    <button
                      onClick={handleImageUpload}
                      className="btn btn-success ms-2"
                    >
                      Guardar Foto
                    </button>
                    <button
                      onClick={handleCancelUpload}
                      className="btn btn-secondary ms-2"
                    >
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
