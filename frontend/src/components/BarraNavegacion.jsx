import { Compass, PlusCircle, User } from "lucide-react";

const ITEMS = [
  { id: "explorar", etiqueta: "Explorar", Icono: Compass },
  { id: "publicar", etiqueta: "Publicar", Icono: PlusCircle },
  { id: "perfil", etiqueta: "Perfil", Icono: User },
];

export default function BarraNavegacion({ pantallaActiva, onNavegar }) {
  return (
    <nav className="barra-navegacion">
      {ITEMS.map(({ id, etiqueta, Icono }) => (
        <button
          key={id}
          className="barra-navegacion__item"
          data-activo={pantallaActiva === id}
          onClick={() => onNavegar(id)}
        >
          <Icono size={20} />
          <span>{etiqueta}</span>
        </button>
      ))}
    </nav>
  );
}
