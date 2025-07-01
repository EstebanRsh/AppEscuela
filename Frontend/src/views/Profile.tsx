import React, { useState, useEffect } from "react";
import InfoContainer from "../components/common/InfoContainer";

// Definición de tipos para los datos que vamos a manejar
type UserInfo = {
  first_name: string;
  last_name: string;
  email: string;
  type: 'administrador' | 'alumno' | 'profesor';
  profile_image_url: string;
  username: string;
};

function Profile() {
  const [user, setUser] = useState<UserInfo>(JSON.parse(localStorage.getItem("user") || "{}"));
  const [isDetailsVisible, setIsDetailsVisible] = useState(true);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Se elimina 'careers' del estado de carga
  const [isLoading, setIsLoading] = useState({ photo: false, password: false });
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_new_password: ''
  });

  // El useEffect que buscaba las carreras ha sido eliminado.

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordData(prev => ({...prev, [id]: value}));
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (passwordData.new_password !== passwordData.confirm_new_password) {
      setPasswordMessage({ type: 'error', text: "Las nuevas contraseñas no coinciden." });
      return;
    }
    if (!passwordData.new_password || passwordData.new_password.length < 4) {
      setPasswordMessage({ type: 'error', text: "La nueva contraseña debe tener al menos 4 caracteres." });
      return;
    }

    setIsLoading(prev => ({ ...prev, password: true }));
    const token = localStorage.getItem("token") || "";
    
    try {
      const res = await fetch("http://localhost:8000/user/change-password/self", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
            current_password: passwordData.current_password,
            new_password: passwordData.new_password
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Error en el servidor");
      }
      alert(data.message);
      setPasswordData({ current_password: '', new_password: '', confirm_new_password: '' });
      setIsEditingPassword(false);
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(prev => ({ ...prev, password: false }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
      setMessage(null);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(prev => ({ ...prev, photo: true }));
    setMessage(null);
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    const token = localStorage.getItem("token") || "";

    try {
        const res = await fetch("http://localhost:8000/user/upload-photo", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "No se pudo guardar la foto.");

        const updatedUser = { ...user, profile_image_url: data.image_url };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        alert("¡Foto de perfil actualizada!");
        handleCancelUpload();

    } catch(err: any) {
        setMessage({ type: 'error', text: err.message });
    } finally {
        setIsLoading(prev => ({ ...prev, photo: false }));
    }
  };

  const handleCancelUpload = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };
  
  const profileImageUrl = user.profile_image_url
    ? `http://localhost:8000${user.profile_image_url}`
    : `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=ffc107&color=000&size=150`;

  return (
  <InfoContainer>
    <div className="container mt-4">
      <div className="card card-custom shadow-lg mx-auto" style={{ maxWidth: '900px' }}>
        <div className="card-header">
          <h1 className="m-0 h3"><i className="bi bi-person-badge-fill text-warning me-2"></i>Mi Perfil</h1>
        </div>
        <div className="card-body p-lg-5">
          <div className="row g-5 profile-responsive-row">
            <div className="col-lg-4 text-center">
              <div 
                className="profile-pic-wrapper mx-auto" 
                onClick={() => setIsDetailsVisible(!isDetailsVisible)}
                data-bs-toggle="collapse" 
                data-bs-target="#userDetailsCollapse"
                aria-expanded={isDetailsVisible}
                aria-controls="userDetailsCollapse"
              >
                <img src={previewImage || profileImageUrl} className="profile-pic" alt="Foto de perfil" />
                <label htmlFor="file-upload" className="profile-pic-upload-btn" onClick={(e) => e.stopPropagation()}>
                  <i className="bi bi-camera-fill"></i>
                </label>
                <input id="file-upload" type="file" onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} onClick={(e) => e.stopPropagation()} />
              </div>
              {selectedFile && (
                <div className="mt-3">
                  <button onClick={handleImageUpload} className="btn btn-sm btn-outline-success" disabled={isLoading.photo}>
                      {isLoading.photo ? <span className="spinner-border spinner-border-sm"></span> : 'Guardar'}
                  </button>
                  <button onClick={handleCancelUpload} className="btn btn-sm btn-outline-secondary ms-2" disabled={isLoading.photo}>Cancelar</button>
                </div>
              )}
               {message && <div className={`alert small py-2 mt-3 alert-${message.type === 'success' ? 'success' : 'danger'}`}>{message.text}</div>}
            </div>

            <div className="col-lg-8">
              <div className="collapse show" id="userDetailsCollapse">
                  <h3>{user.first_name} {user.last_name}</h3>
                  <p className="lead text-white-50">{user.email}</p>
                  <span className="badge bg-warning text-dark">{user.type}</span>
                  <hr className="hr-custom my-4" />
                  
                  {/* El bloque que mostraba las carreras ha sido eliminado. */}
              </div>
              
              <div className="security-section">
                  {!isEditingPassword ? (
                      <div className="d-flex justify-content-between align-items-center">
                          <div><h5>Seguridad</h5><p className="text-white-50 mb-0">Actualiza tu contraseña.</p></div>
                          <button className="btn btn-outline-primary" onClick={() => setIsEditingPassword(true)}>Cambiar</button>
                      </div>
                  ) : (
                      <form onSubmit={handlePasswordChange}>
                          <h5>Cambiar Contraseña</h5>
                          <div className="mb-2"><label htmlFor="current_password">Contraseña Actual</label><input type="password" id="current_password" className="form-control" value={passwordData.current_password} onChange={handlePasswordInputChange} required /></div>
                          <div className="mb-2"><label htmlFor="new_password">Nueva Contraseña</label><input type="password" id="new_password" className="form-control" value={passwordData.new_password} onChange={handlePasswordInputChange} required /></div>
                          <div className="mb-3"><label htmlFor="confirm_new_password">Confirmar</label><input type="password" id="confirm_new_password" className="form-control" value={passwordData.confirm_new_password} onChange={handlePasswordInputChange} required /></div>
                          {passwordMessage && <div className={`alert alert-${passwordMessage.type === 'success' ? 'success' : 'danger'} small py-2`}>{passwordMessage.text}</div>}
                          <div className="d-flex justify-content-end">
                              <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setIsEditingPassword(false)}>Cancelar</button>
                              <button type="submit" className="btn btn-outline-success" disabled={isLoading.password}>{isLoading.password ? <span className="spinner-border spinner-border-sm"></span> : 'Actualizar'}</button>
                          </div>
                      </form>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </InfoContainer>
);
}

export default Profile;