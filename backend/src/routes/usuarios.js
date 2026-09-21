// F8 — El usuario podrá consultar su perfil, sus libros publicados y su
// historial de intercambios.
//
// NF4 — Control de acceso por roles: un usuario solo puede consultar su
// propio perfil (ver matriz de trazabilidad, sección 15, caso de prueba NF4).

const { Router } = require("express");
const db = require("../db");
const { requiereAutenticacion } = require("../middleware/auth");

const router = Router();

// GET /api/usuarios/:id/perfil
router.get("/:id/perfil", requiereAutenticacion, (req, res) => {
  if (req.params.id !== req.usuario.id_usuario) {
    return res.status(403).json({ error: "No puedes consultar el perfil de otro usuario." });
  }

  const usuario = db
    .prepare("SELECT id_usuario, nombre, correo, metodo_auth, fecha_registro FROM usuarios WHERE id_usuario = ?")
    .get(req.usuario.id_usuario);
  if (!usuario) return res.status(404).json({ error: "Usuario no encontrado." });

  const librosPublicados = db
    .prepare(
      `SELECT * FROM libros WHERE id_usuario_publica = ? ORDER BY fecha_publicacion DESC`
    )
    .all(usuario.id_usuario);

  const historial = db
    .prepare(
      `SELECT h.*, l.titulo AS libro_titulo, l.ficha AS libro_ficha
       FROM historial_intercambios h JOIN libros l ON l.id_libro = h.id_libro
       WHERE h.id_usuario_califica = ?
       ORDER BY h.fecha_calificacion DESC`
    )
    .all(usuario.id_usuario);

  res.json({
    usuario,
    contadores: {
      libros_publicados: librosPublicados.length,
      intercambios_realizados: historial.length,
    },
    libros: librosPublicados,   // NF7: si está vacío, se envía un arreglo vacío (no un error)
    historial,                  // NF7: idem
  });
});

module.exports = router;
