import { useEffect, useState } from "react";
import { BookOpen, Sparkles } from "lucide-react";

// 🥚 Easter egg — se activa tecleando el código Konami:
//   ↑ ↑ ↓ ↓ ← → ← → B A
// (ver frontend/src/hooks/useSecuenciaTeclas.js y App.jsx).
//
// Aparece un libro cerrado; se abre solo (o al tocarlo) y, al abrirse,
// revela los créditos en sus páginas. No hay ningún botón ni pista
// visible en la interfaz que lo mencione: es un extra oculto.

export default function CreditosSecretos({ onCerrar }) {
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const temporizador = setTimeout(() => setAbierto(true), 650);
    return () => clearTimeout(temporizador);
  }, []);

  return (
    <div className="creditos-overlay" onClick={onCerrar}>
      <Sparkles className="creditos-overlay__chispa creditos-overlay__chispa--1" size={22} />
      <Sparkles className="creditos-overlay__chispa creditos-overlay__chispa--2" size={16} />

      <div
        className="libro-secreto"
        onClick={(e) => {
          e.stopPropagation();
          setAbierto(true);
        }}
      >
        {/* Páginas: siempre presentes debajo de la tapa; se revelan al abrir */}
        <div className="libro-secreto__paginas">
          <p className="libro-secreto__huevo">🥚 ¡Encontraste el easter egg!</p>
          <h2 className="libro-secreto__titulo">BookSwap</h2>
          <div className="libro-secreto__linea" style={{ animationDelay: "0.95s" }}>
            Alumno: <strong>Greco Angel Montero Alonso</strong>
          </div>
          <div className="libro-secreto__linea" style={{ animationDelay: "1.1s" }}>
            Universidad Autónoma del Estado de Hidalgo
          </div>
          <div className="libro-secreto__linea" style={{ animationDelay: "1.25s" }}>
            09/09/2026
          </div>
        </div>

        {/* Tapa: gira sobre el lomo (izquierda) para "abrir" el libro */}
        <div className="libro-secreto__tapa" data-abierto={abierto}>
          <BookOpen size={40} />
          <span>BookSwap</span>
        </div>
      </div>

      <button className="boton boton--secundario creditos-overlay__cerrar" onClick={onCerrar}>
        Cerrar
      </button>
    </div>
  );
}
