import { useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";
import { api } from "../api";
import Ficha from "../components/Ficha";
import EstadoVacio from "../components/EstadoVacio";

const GENEROS = ["Todos", "Novela", "Infantil", "Ensayo", "Ciencia", "Poesía", "Cómic"];

export default function Explorar({ onAbrirLibro, onIrANotificaciones, notificacionesNoLeidas }) {
  const [busqueda, setBusqueda] = useState("");
  const [genero, setGenero] = useState("Todos");
  const [libros, setLibros] = useState(null); // null = cargando
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;
    const temporizador = setTimeout(async () => {
      try {
        const { libros: resultado } = await api.listarLibros(busqueda, genero);
        if (!cancelado) setLibros(resultado);
      } catch (err) {
        if (!cancelado) setError(err.message);
      }
    }, 250); // NF1 — evita disparar una búsqueda por cada tecla

    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
  }, [busqueda, genero]);

  return (
    <div className="pantalla">
      <div className="barra-superior">
        <h1>Explorar</h1>
        <button className="campana" onClick={onIrANotificaciones} aria-label="Ver notificaciones">
          <Bell size={22} />
          {notificacionesNoLeidas > 0 && (
            <span className="campana__contador">{notificacionesNoLeidas}</span>
          )}
        </button>
      </div>

      <div className="filtros">
        <div className="buscador" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Search size={16} color="var(--bs-texto-secundario)" />
          <input
            style={{ border: "none", background: "transparent", outline: "none", width: "100%", color: "var(--bs-tinta)" }}
            placeholder="Buscar por título o autor…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <select value={genero} onChange={(e) => setGenero(e.target.value)}>
          {GENEROS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error-formulario">{error}</div>}

      {libros === null && !error && <p className="texto-secundario">Cargando catálogo…</p>}

      {libros !== null && libros.length === 0 && (
        <EstadoVacio
          titulo="Ninguna ficha coincide con tu búsqueda"
          descripcion="Prueba con otro título, autor o género — o publica tú el primer libro."
        />
      )}

      {libros !== null && libros.length > 0 && (
        <div className="lista">
          {libros.map((libro) => (
            <Ficha key={libro.id_libro} libro={libro} onClick={() => onAbrirLibro(libro.id_libro)} />
          ))}
        </div>
      )}
    </div>
  );
}
