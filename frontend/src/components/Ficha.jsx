// Componente Ficha: tarjeta reutilizable que representa un libro dentro
// del catálogo (ver sección 12.2 — Componentes del prototipo).

import { BookOpen } from "lucide-react";

export default function Ficha({ libro, onClick }) {
  const esDonacion = libro.tipo === "Donación";

  return (
    <button className="ficha" onClick={onClick}>
      <div className="ficha__portada" style={{ background: libro.color_portada || "#C68A2D" }}>
        <BookOpen size={22} />
      </div>
      <div className="ficha__cuerpo">
        <p className="folio">{libro.ficha}</p>
        <h3 className="ficha__titulo">{libro.titulo}</h3>
        <p className="ficha__autor">{libro.autor}</p>
        <div className="ficha__meta">
          <span className={`etiqueta ${esDonacion ? "etiqueta--exito" : ""}`}>{libro.tipo}</span>
          <span className="texto-secundario">{libro.ubicacion}</span>
        </div>
      </div>
    </button>
  );
}
