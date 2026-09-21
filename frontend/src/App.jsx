import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { api } from "./api";
import { useSecuenciaTeclas } from "./hooks/useSecuenciaTeclas";
import BarraNavegacion from "./components/BarraNavegacion";
import Toast from "./components/Toast";
import CreditosSecretos from "./components/CreditosSecretos";
import Auth from "./screens/Auth";
import Explorar from "./screens/Explorar";
import Detalle from "./screens/Detalle";
import Publicar from "./screens/Publicar";
import Notificaciones from "./screens/Notificaciones";
import Perfil from "./screens/Perfil";

// 🥚 Código Konami — easter egg oculto (sin ninguna pista visible en la
// interfaz). Al teclearlo se muestran unos créditos animados.
const CODIGO_KONAMI = [
  "arrowup", "arrowup", "arrowdown", "arrowdown",
  "arrowleft", "arrowright", "arrowleft", "arrowright",
  "b", "a",
];

// Componente App (raíz): controla la navegación entre pantallas mediante
// un estado "pantalla" y concentra la orquestación de las llamadas a la
// API (sección 12.2 — mismo patrón que el prototipo original BookSwap.jsx,
// ahora contra un backend real en lugar de estado en memoria).

export default function App() {
  const { sesion, cargandoSesion } = useAuth();
  const [pantalla, setPantalla] = useState("explorar"); // explorar | detalle | publicar | notificaciones | perfil
  const [idLibroSeleccionado, setIdLibroSeleccionado] = useState(null);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);
  const [toast, setToast] = useState("");
  const [mostrarCreditos, setMostrarCreditos] = useState(false);

  // 🥚 Se activa desde cualquier pantalla, sesión iniciada o no.
  useSecuenciaTeclas(CODIGO_KONAMI, () => setMostrarCreditos(true));

  function mostrarToast(mensaje) {
    setToast(mensaje);
    setTimeout(() => setToast(""), 2600);
  }

  // Carga el contador de notificaciones no leídas apenas hay sesión activa,
  // para que la campana ya muestre el aviso sin tener que entrar primero
  // a la pantalla de Notificaciones.
  useEffect(() => {
    if (!sesion) return;
    api
      .listarNotificaciones()
      .then(({ notificaciones }) => {
        setNotificacionesNoLeidas(notificaciones.filter((n) => !n.leida).length);
      })
      .catch(() => {});
  }, [sesion]);

  function irAExplorar() {
    setIdLibroSeleccionado(null);
    setPantalla("explorar");
  }

  function abrirLibro(id) {
    setIdLibroSeleccionado(id);
    setPantalla("detalle");
  }

  if (cargandoSesion) {
    return (
      <div className="app-fondo">
        <div className="app-shell">
          <div className="pantalla-cargando">Cargando BookSwap…</div>
        </div>
        {mostrarCreditos && <CreditosSecretos onCerrar={() => setMostrarCreditos(false)} />}
      </div>
    );
  }

  if (!sesion) {
    return (
      <div className="app-fondo">
        <div className="app-shell">
          <Auth />
        </div>
        {mostrarCreditos && <CreditosSecretos onCerrar={() => setMostrarCreditos(false)} />}
      </div>
    );
  }

  const usuarioActual = sesion.usuario;
  const enPantallaConNav = ["explorar", "publicar", "perfil"].includes(pantalla);

  return (
    <div className="app-fondo">
      <div className="app-shell">
        {pantalla === "explorar" && (
          <Explorar
            onAbrirLibro={abrirLibro}
            onIrANotificaciones={() => setPantalla("notificaciones")}
            notificacionesNoLeidas={notificacionesNoLeidas}
          />
        )}

        {pantalla === "detalle" && idLibroSeleccionado && (
          <Detalle
            idLibro={idLibroSeleccionado}
            usuarioActual={usuarioActual}
            onVolver={irAExplorar}
            mostrarToast={mostrarToast}
            onIntercambioCerrado={() => setPantalla("perfil")}
          />
        )}

        {pantalla === "publicar" && (
          <Publicar onPublicado={abrirLibro} mostrarToast={mostrarToast} />
        )}

        {pantalla === "notificaciones" && (
          <Notificaciones
            onVolver={irAExplorar}
            onAbrirLibro={abrirLibro}
            onCambioNoLeidas={setNotificacionesNoLeidas}
          />
        )}

        {pantalla === "perfil" && <Perfil usuarioActual={usuarioActual} />}

        {enPantallaConNav && (
          <BarraNavegacion pantallaActiva={pantalla} onNavegar={setPantalla} />
        )}

        <Toast mensaje={toast} />
      </div>

      {mostrarCreditos && <CreditosSecretos onCerrar={() => setMostrarCreditos(false)} />}
    </div>
  );
}
