import { useState } from "react";
import { Star } from "lucide-react";

// Modal — Calificar intercambio (sección 13.1, CU-03).
// El botón "Enviar calificación" solo se habilita si se seleccionó al
// menos una estrella (flujo alternativo de CU-03).

export default function ModalCalificacion({ libro, onCancelar, onEnviar, enviando }) {
  const [estrellas, setEstrellas] = useState(0);
  const [comentario, setComentario] = useState("");

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <h2>Calificar intercambio</h2>
        <p className="texto-secundario" style={{ color: "var(--bs-texto-secundario)" }}>
          ¿Cómo estuvo la entrega de «{libro.titulo}»?
        </p>

        <div className="estrellas">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              data-activa={n <= estrellas}
              onClick={() => setEstrellas(n)}
              aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
            >
              <Star fill={n <= estrellas ? "currentColor" : "none"} />
            </button>
          ))}
        </div>

        <div className="campo">
          <label htmlFor="comentario">Comentario (opcional)</label>
          <textarea
            id="comentario"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Cuéntale a la comunidad cómo fue tu experiencia…"
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="boton boton--secundario" onClick={onCancelar} disabled={enviando}>
            Cancelar
          </button>
          <button
            className="boton boton--primario"
            disabled={estrellas === 0 || enviando}
            onClick={() => onEnviar(estrellas, comentario)}
          >
            {enviando ? "Enviando…" : "Enviar calificación"}
          </button>
        </div>
      </div>
    </div>
  );
}
