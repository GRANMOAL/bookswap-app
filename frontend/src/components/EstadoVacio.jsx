import { Inbox } from "lucide-react";

// NF7 — El sistema debe manejar correctamente estados vacíos y datos
// inconsistentes sin fallar. Este componente centraliza ese mensaje para
// que ninguna pantalla se quede en blanco sin explicación.

export default function EstadoVacio({ titulo, descripcion, Icono = Inbox }) {
  return (
    <div className="estado-vacio">
      <div className="estado-vacio__icono">
        <Icono size={34} />
      </div>
      <h3>{titulo}</h3>
      {descripcion && <p className="texto-secundario">{descripcion}</p>}
    </div>
  );
}
