import { useEffect, useState } from "react";
import { ArrowLeft, Bell } from "lucide-react";
import { api } from "../api";
import EstadoVacio from "../components/EstadoVacio";

export default function Notificaciones({ onVolver, onAbrirLibro, onCambioNoLeidas }) {
  const [notificaciones, setNotificaciones] = useState(null);
  const [error, setError] = useState("");

  async function cargar() {
    try {
      const { notificaciones: datos } = await api.listarNotificaciones();
      setNotificaciones(datos);
      onCambioNoLeidas(datos.filter((n) => !n.leida).length);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function abrir(notificacion) {
    if (!notificacion.leida) {
      try {
        await api.marcarNotificacionLeida(notificacion.id_notificacion);
      } catch {
        // Si falla marcar como leída, igual dejamos que el usuario navegue.
      }
    }
    onAbrirLibro(notificacion.id_libro);
  }

  return (
    <div className="pantalla">
      <div className="barra-superior">
        <button
          className="boton boton--secundario"
          style={{ width: "auto" }}
          onClick={onVolver}
        >
          <ArrowLeft size={16} /> Volver
        </button>
        <h1 style={{ fontSize: "1.2rem" }}>Notificaciones</h1>
        <span style={{ width: 40 }} />
      </div>

      {error && <div className="error-formulario">{error}</div>}

      {notificaciones === null && !error && <p className="texto-secundario">Cargando avisos…</p>}

      {notificaciones !== null && notificaciones.length === 0 && (
        <EstadoVacio
          Icono={Bell}
          titulo="Todavía no tienes avisos"
          descripcion="Cuando alguien muestre interés en uno de tus libros, lo verás aquí."
        />
      )}

      {notificaciones !== null && notificaciones.length > 0 && (
        <div className="lista">
          {notificaciones.map((n) => (
            <button
              key={n.id_notificacion}
              className="ficha"
              style={{ opacity: n.leida ? 0.65 : 1 }}
              onClick={() => abrir(n)}
            >
              <div className="ficha__cuerpo">
                <p className="folio">{n.libro_ficha}</p>
                <p style={{ margin: "0 0 4px", fontWeight: n.leida ? 400 : 600 }}>{n.texto}</p>
                <p className="texto-secundario" style={{ margin: 0 }}>
                  {new Date(n.fecha_creacion).toLocaleString("es-MX")}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
