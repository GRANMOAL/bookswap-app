import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, MapPin, Users } from "lucide-react";
import { api } from "../api";
import ModalCalificacion from "../components/ModalCalificacion";

export default function Detalle({ idLibro, usuarioActual, onVolver, mostrarToast, onIntercambioCerrado }) {
  const [libro, setLibro] = useState(null);
  const [error, setError] = useState("");
  const [enviandoInteres, setEnviandoInteres] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [enviandoCalificacion, setEnviandoCalificacion] = useState(false);

  async function recargar() {
    try {
      const { libro: datos } = await api.obtenerLibro(idLibro);
      setLibro(datos);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idLibro]);

  if (error) {
    return (
      <div className="pantalla">
        <BotonVolver onVolver={onVolver} />
        <div className="error-formulario">{error}</div>
      </div>
    );
  }
  if (!libro) {
    return (
      <div className="pantalla">
        <BotonVolver onVolver={onVolver} />
        <p className="texto-secundario">Cargando ficha…</p>
      </div>
    );
  }

  const esPropio = libro.id_usuario_publica === usuarioActual.id_usuario;
  const yaMostroInteres = libro.interesados.some((i) => i.id_usuario === usuarioActual.id_usuario);
  const puedeMarcarIntercambiado = esPropio && libro.estado === "activo" && libro.interesados.length > 0;

  async function manejarMostrarInteres() {
    setEnviandoInteres(true);
    try {
      const { libro: actualizado } = await api.mostrarInteres(idLibro);
      setLibro(actualizado);
      mostrarToast("Mostraste interés en este libro.");
    } catch (err) {
      mostrarToast(err.message);
    } finally {
      setEnviandoInteres(false);
    }
  }

  async function manejarCalificacion(estrellas, comentario) {
    setEnviandoCalificacion(true);
    try {
      await api.calificarIntercambio(idLibro, estrellas, comentario);
      mostrarToast("Gracias por calificar el intercambio.");
      setMostrarModal(false);
      onIntercambioCerrado();
    } catch (err) {
      mostrarToast(err.message);
    } finally {
      setEnviandoCalificacion(false);
    }
  }

  return (
    <div className="pantalla">
      <BotonVolver onVolver={onVolver} />

      <div className="detalle-portada" style={{ background: libro.color_portada }}>
        <BookOpen size={48} />
      </div>

      <p className="folio">{libro.ficha}</p>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
        <span className={`etiqueta ${libro.tipo === "Donación" ? "etiqueta--exito" : ""}`}>{libro.tipo}</span>
        {libro.estado === "intercambiado" && <span className="etiqueta">Intercambiado</span>}
      </div>

      <h1>{libro.titulo}</h1>
      <p className="texto-secundario">{libro.autor} · {libro.genero}</p>

      <div style={{ margin: "16px 0", display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
          <MapPin size={16} /> {libro.ubicacion}
        </p>
        <p className="texto-secundario" style={{ margin: 0 }}>Estado de conservación: {libro.estado_libro}</p>
        <p className="texto-secundario" style={{ margin: 0 }}>Publicado por {libro.nombre_publicador}</p>
      </div>

      <h3 style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Users size={16} /> Interesados ({libro.interesados.length})
      </h3>
      {libro.interesados.length === 0 ? (
        <p className="texto-secundario">Todavía nadie ha mostrado interés en esta ficha.</p>
      ) : (
        <ul className="detalle-lista-interesados">
          {libro.interesados.map((i) => (
            <li key={i.id_usuario}>{i.nombre}</li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
        {!esPropio && libro.estado === "activo" && (
          <button
            className="boton boton--primario"
            onClick={manejarMostrarInteres}
            disabled={enviandoInteres || yaMostroInteres}
          >
            {yaMostroInteres ? "Ya mostraste interés" : enviandoInteres ? "Enviando…" : "Mostrar interés"}
          </button>
        )}

        {esPropio && libro.estado === "activo" && (
          <>
            <button
              className="boton boton--primario"
              onClick={() => setMostrarModal(true)}
              disabled={!puedeMarcarIntercambiado}
            >
              Marcar como intercambiado
            </button>
            {!puedeMarcarIntercambiado && (
              <p className="texto-secundario">
                Necesitas al menos un interesado antes de poder cerrar el intercambio.
              </p>
            )}
          </>
        )}
      </div>

      {mostrarModal && (
        <ModalCalificacion
          libro={libro}
          onCancelar={() => setMostrarModal(false)}
          onEnviar={manejarCalificacion}
          enviando={enviandoCalificacion}
        />
      )}
    </div>
  );
}

function BotonVolver({ onVolver }) {
  return (
    <button
      className="boton boton--secundario"
      style={{ width: "auto", marginBottom: 16 }}
      onClick={onVolver}
    >
      <ArrowLeft size={16} /> Volver
    </button>
  );
}
