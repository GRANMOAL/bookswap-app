// Middleware de autenticación (NF4 — control de acceso).
// Verifica el token JWT enviado en el header Authorization: Bearer <token>
// y adjunta el usuario autenticado a la petición (req.usuario).

const jwt = require("jsonwebtoken");

function requiereAutenticacion(req, res, next) {
  const encabezado = req.headers.authorization || "";
  const [tipo, token] = encabezado.split(" ");

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ error: "Se requiere iniciar sesión para continuar." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = { id_usuario: payload.sub, nombre: payload.nombre, correo: payload.correo };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Tu sesión expiró o el token no es válido." });
  }
}

module.exports = { requiereAutenticacion };
