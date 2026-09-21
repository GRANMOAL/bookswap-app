import { useState } from "react";
import { api } from "../api";

const GENEROS = ["Novela", "Infantil", "Ensayo", "Ciencia", "Poesía", "Cómic"];
const ESTADOS_LIBRO = ["Como nuevo", "Bueno", "Regular"];
const TIPOS = ["Donación", "Intercambio"];
const COLORES_PORTADA = ["#C68A2D", "#A13D2C", "#3B6D11", "#726A56", "#20362A", "#4C6B8A"];

const VACIO = {
  titulo: "",
  autor: "",
  genero: GENEROS[0],
  estado_libro: ESTADOS_LIBRO[0],
  ubicacion: "",
  tipo: TIPOS[0],
  color_portada: COLORES_PORTADA[0],
};

// Publicar — Nueva ficha (sección 13.1, CU-01).
// NF2: el formulario cabe en una sola pantalla — el usuario completa los
// campos y publica en un único paso, muy por debajo del máximo de 3.

export default function Publicar({ onPublicado, mostrarToast }) {
  const [form, setForm] = useState(VACIO);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  function actualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const { libro } = await api.publicarLibro(form);
      mostrarToast(`Ficha ${libro.ficha} publicada en el catálogo.`);
      setForm(VACIO);
      onPublicado(libro.id_libro);
    } catch (err) {
      // Flujo alternativo de CU-01: el sistema no envía el formulario y
      // mantiene al usuario en la pantalla con el motivo del error.
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pantalla">
      <h1>Publicar ficha</h1>
      <p className="texto-secundario" style={{ marginBottom: 20 }}>
        Comparte un libro para donarlo o intercambiarlo con la comunidad.
      </p>

      {error && <div className="error-formulario">{error}</div>}

      <form onSubmit={manejarEnvio}>
        <div className="campo">
          <label htmlFor="titulo">Título</label>
          <input id="titulo" value={form.titulo} onChange={(e) => actualizar("titulo", e.target.value)} required />
        </div>

        <div className="campo">
          <label htmlFor="autor">Autor</label>
          <input id="autor" value={form.autor} onChange={(e) => actualizar("autor", e.target.value)} required />
        </div>

        <div className="campo">
          <label htmlFor="genero">Género</label>
          <select id="genero" value={form.genero} onChange={(e) => actualizar("genero", e.target.value)}>
            {GENEROS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label htmlFor="estado_libro">Estado de conservación</label>
          <select id="estado_libro" value={form.estado_libro} onChange={(e) => actualizar("estado_libro", e.target.value)}>
            {ESTADOS_LIBRO.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label htmlFor="ubicacion">Ubicación de entrega</label>
          <input
            id="ubicacion"
            placeholder="p. ej. Biblioteca Central, Cafetería El Roble…"
            value={form.ubicacion}
            onChange={(e) => actualizar("ubicacion", e.target.value)}
            required
          />
        </div>

        <div className="campo">
          <label htmlFor="tipo">Tipo</label>
          <select id="tipo" value={form.tipo} onChange={(e) => actualizar("tipo", e.target.value)}>
            {TIPOS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label>Color de portada</label>
          <div className="selector-colores">
            {COLORES_PORTADA.map((color) => (
              <button
                type="button"
                key={color}
                className="selector-colores__pastilla"
                style={{ background: color }}
                data-activo={form.color_portada === color}
                onClick={() => actualizar("color_portada", color)}
                aria-label={`Color ${color}`}
              />
            ))}
          </div>
        </div>

        <button className="boton boton--primario" type="submit" disabled={enviando}>
          {enviando ? "Publicando…" : "Publicar ficha"}
        </button>
      </form>
    </div>
  );
}
