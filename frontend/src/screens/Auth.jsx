import { useState } from "react";
import { BookOpen } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../AuthContext";

// Auth — Registro / inicio de sesión (sección 13.1). Requisito F1.
// La opción "Continuar con Google" queda documentada pero deshabilitada:
// requiere credenciales OAuth propias de un proyecto en Google Cloud
// (ver Anexo B.4) que están fuera del alcance de este prototipo local.

export default function Auth() {
  const { iniciarSesion } = useAuth();
  const [modo, setModo] = useState("login"); // "login" | "registro"
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function manejarEnvio(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const respuesta =
        modo === "registro"
          ? await api.registrar(nombre, correo, password)
          : await api.iniciarSesion(correo, password);
      iniciarSesion(respuesta.usuario, respuesta.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="pantalla pantalla--sin-nav">
      <div style={{ textAlign: "center" }}>
        <BookOpen size={40} color="var(--bs-acento)" />
        <div className="auth-logo">BookSwap</div>
        <p className="texto-secundario">Dale una segunda vida a los libros que ya no lees.</p>
      </div>

      <div className="auth-tabs" style={{ marginTop: 32 }}>
        <button data-activo={modo === "login"} onClick={() => setModo("login")}>
          Iniciar sesión
        </button>
        <button data-activo={modo === "registro"} onClick={() => setModo("registro")}>
          Crear cuenta
        </button>
      </div>

      {error && <div className="error-formulario">{error}</div>}

      <form onSubmit={manejarEnvio}>
        {modo === "registro" && (
          <div className="campo">
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
        )}

        <div className="campo">
          <label htmlFor="correo">Correo electrónico</label>
          <input
            id="correo"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="campo">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={modo === "registro" ? "new-password" : "current-password"}
          />
        </div>

        <button className="boton boton--primario" type="submit" disabled={cargando}>
          {cargando ? "Un momento…" : modo === "registro" ? "Continuar con correo" : "Entrar"}
        </button>
      </form>

      <button className="boton boton--secundario" style={{ marginTop: 10 }} disabled title="Próximamente">
        Continuar con Google
      </button>
    </div>
  );
}
