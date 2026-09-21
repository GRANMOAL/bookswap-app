import { BookOpen, GraduationCap, Calendar, X } from "lucide-react";

// Modal "Acerca de" — información del proyecto académico.
// Se abre desde un botón en la pantalla Perfil (sección 13.1 la describe
// como "Tu estantería"; este modal es un añadido informativo, no altera
// ningún requisito funcional existente).

export default function AcercaDe({ onCerrar }) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BookOpen size={26} color="var(--bs-acento)" />
            <h2 style={{ margin: 0 }}>Acerca de BookSwap</h2>
          </div>
          <button
            className="boton boton--secundario boton--pequeno"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        <p className="texto-secundario" style={{ marginTop: 12 }}>
          Aplicación desarrollada como proyecto académico para ilustrar la
          aplicación práctica del modelo de calidad ISO/IEC 25010.
        </p>

        <ul style={{ listStyle: "none", padding: 0, margin: "18px 0 4px", display: "flex", flexDirection: "column", gap: 12 }}>
          <li style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <GraduationCap size={18} color="var(--bs-texto-secundario)" />
            <div>
              <strong>Alumno:</strong> Greco Angel Montero Alonso
            </div>
          </li>
          <li style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <BookOpen size={18} color="var(--bs-texto-secundario)" />
            <div>Universidad Autónoma del Estado de Hidalgo</div>
          </li>
          <li style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Calendar size={18} color="var(--bs-texto-secundario)" />
            <div>09/09/2026</div>
          </li>
        </ul>

        <button className="boton boton--primario" style={{ marginTop: 16 }} onClick={onCerrar}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
