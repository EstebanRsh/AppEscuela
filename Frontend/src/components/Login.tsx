import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

type LoginProcessResponse = {
  status: string;
  token?: string;
  user?: unknown;
  message?: string;
};

export default function Login() {
  const BACKEND_IP = "localhost";
  const BACKEND_PORT = "8000";
  const ENDPOINT = "users/login";
  const LOGIN_URL = `http://${BACKEND_IP}:${BACKEND_PORT}/${ENDPOINT}`;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  /*const [alert, setAlert] = useState<{ message: string } | null>(null);*/
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    //setAlert(null);

    try {
      const res = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data: LoginProcessResponse = await res.json();

      if (data.status === "success") {
        localStorage.setItem("token", data.token ?? "");
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("¡Bienvenido! Has iniciado sesión correctamente.")
        navigate("/dashboard");
      } else {
        //setAlert({ message: data.message || "Credenciales inválidas." });
        toast.error(data.message || "Credenciales inválidas.");
      }
    } catch (error) {
      //setAlert({ message: "Error al conectar con el servidor." });
      toast.error("Error al conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="container">
        <div className="row justify-content-center align-items-center vh-100">
          <div className="col-11 col-sm-8 col-md-7 col-lg-5 col-xl-4">
            <div className="card shadow-lg border-0 rounded-3 login-card-custom">
              <div className="card-body p-4 p-sm-5 login-card-custom text-white bg-dark">
                <div className="text-center mb-4">
                  <h1 className="h3 fw-bold">Iniciar Sesión</h1>
                  <p>Ingresa a la plataforma</p>
                </div>

                <form onSubmit={handleLogin} noValidate>
                  <div className="mb-3">
                    <label htmlFor="inputUser" className="form-label">
                      Usuario
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="inputUser"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="inputPassword" className="form-label">
                      Contraseña
                    </label>
                    <div className="input-group">
                      <input
                        type={isPasswordVisible ? "text" : "password"}
                        className="form-control"
                        id="inputPassword"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                      <button
                        className="btn btn-outline-warning"
                        type="button"
                        onClick={() =>
                          setIsPasswordVisible(!isPasswordVisible)
                        }
                        aria-label={
                          isPasswordVisible
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                      >
                        <i
                          className={`bi ${
                            isPasswordVisible ? "bi-eye-slash" : "bi-eye"
                          }`}
                        ></i>
                      </button>
                    </div>
                  </div>

                  <div className="d-grid mt-4">
                    <button
                      type="submit"
                      className="btn btn-outline-warning"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          <span className="ms-2">Ingresando...</span>
                        </>
                      ) : (
                        "Ingresar"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

