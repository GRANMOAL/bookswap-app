// Envoltorio delgado sobre fetch para hablar con el backend de BookSwap.
// Centraliza la URL base, el envío del token JWT y el manejo de errores,
// siguiendo el contrato de endpoints del Anexo B.1.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

let tokenActual = null;

export function establecerToken(token) {
  tokenActual = token;
}

async function solicitud(ruta, { metodo = "GET", cuerpo, autenticado = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (autenticado && tokenActual) {
    headers.Authorization = `Bearer ${tokenActual}`;
  }

  let respuesta;
  try {
    respuesta = await fetch(`${BASE_URL}${ruta}`, {
      method: metodo,
      headers,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    });
  } catch (err) {
    throw new Error(
      "No se pudo conectar con el servidor de BookSwap. ¿Está corriendo el backend en " +
        BASE_URL +
        "?"
    );
  }

  const esJson = respuesta.headers.get("content-type")?.includes("application/json");
  const datos = esJson ? await respuesta.json() : null;

  if (!respuesta.ok) {
    throw new Error((datos && datos.error) || `Error inesperado (HTTP ${respuesta.status}).`);
  }
  return datos;
}

export const api = {
  // Auth (F1)
  registrar: (nombre, correo, password) =>
    solicitud("/auth/registro", { metodo: "POST", cuerpo: { nombre, correo, password }, autenticado: false }),
  iniciarSesion: (correo, password) =>
    solicitud("/auth/login", { metodo: "POST", cuerpo: { correo, password }, autenticado: false }),

  // Libros (F2, F3, F4, F6, F7)
  listarLibros: (q, genero) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (genero && genero !== "Todos") params.set("genero", genero);
    const qs = params.toString();
    return solicitud(`/libros${qs ? `?${qs}` : ""}`, { autenticado: false });
  },
  obtenerLibro: (id) => solicitud(`/libros/${id}`, { autenticado: false }),
  publicarLibro: (datos) => solicitud("/libros", { metodo: "POST", cuerpo: datos }),
  mostrarInteres: (id) => solicitud(`/libros/${id}/intereses`, { metodo: "POST" }),
  marcarIntercambiado: (id) => solicitud(`/libros/${id}/estado`, { metodo: "PATCH" }),

  // Notificaciones (F4)
  listarNotificaciones: () => solicitud("/notificaciones"),
  marcarNotificacionLeida: (id) => solicitud(`/notificaciones/${id}/leida`, { metodo: "PATCH" }),

  // Historial / calificación (F5)
  calificarIntercambio: (id_libro, estrellas, comentario) =>
    solicitud("/historial", { metodo: "POST", cuerpo: { id_libro, estrellas, comentario } }),

  // Perfil (F8)
  obtenerPerfil: (idUsuario) => solicitud(`/usuarios/${idUsuario}/perfil`),
};
