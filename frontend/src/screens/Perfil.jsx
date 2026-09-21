import { useEffect, useState } from "react";
import { Info, LogOut } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import EstadoVacio from "../components/EstadoVacio";
import AcercaDe from "../components/AcercaDe";

export default function Perfil({ usuarioActual }) {
  const { cerrarSesion } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [error, setError] = useState("");
  const [mostrarAcercaDe, setMostrarAcercaDe] = useState(false);

  useEffect(() => {
    api
      .obtenerPerfil(usuarioActual.id_usuario)
      .then(setPerfil)
      .catch((err) => setError(err.message));
  }, [usuarioActual.id_usuario]);

  const iniciales = usuarioActual.nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="pantalla">
      <div className="perfil-encabezado">
        <div className="perfil-avatar">{iniciales}</div>
        <h1 style={{ marginBottom: 2 }}>{usuarioActual.nombre}</h1>
        <p className="texto-secundario">{usuarioActual.correo}</p>
      </div>

      {error && <div className="error-formulario">{error}</div>}

      {perfil && (
        <>
          <div className="contadores">
            <div className="contador">
              <span className="contador__valor">{perfil.contadores.libros_publicados}</span>
              <span className="contador__etiqueta">Libros publicados</span>
            </div>
            <div className="contador">
              <span className="contador__valor">{perfil.contadores.intercambios_realizados}</span>
              <span className="contador__etiqueta">Intercambios</span>
            </div>
          </div>

          <h2>Historial de intercambios</h2>
          {perfil.historial.length === 0 ? (
            <EstadoVacio
              titulo="Aún no tienes intercambios"
              descripcion="Cuando cierres un intercambio y lo califiques, aparecerá en tu historial."
            />
          ) : (
            <div className="lista">
              {perfil.historial.map((h) => (
                <div className="historial-item" key={h.id_historial}>
                  <p className="folio" style={{ margin: 0 }}>{h.libro_ficha}</p>
                  <p style={{ margin: "2px 0", fontWeight: 600 }}>{h.libro_titulo}</p>
                  <div className="historial-item__estrellas">
                    {"★".repeat(h.estrellas)}
                    <span style={{ color: "var(--bs-borde-input)" }}>
                      {"★".repeat(5 - h.estrellas)}
                    </span>
                  </div>
                  {h.comentario && <p className="texto-secundario" style={{ margin: 0 }}>{h.comentario}</p>}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <button
        className="boton boton--secundario"
        style={{ marginTop: 28 }}
        onClick={() => setMostrarAcercaDe(true)}
      >
        <Info size={16} /> Acerca de
      </button>

      <button
        className="boton boton--secundario"
        style={{ marginTop: 10 }}
        onClick={cerrarSesion}
      >
        <LogOut size={16} /> Cerrar sesión
      </button>

      {mostrarAcercaDe && <AcercaDe onCerrar={() => setMostrarAcercaDe(false)} />}
    </div>
  );
}
