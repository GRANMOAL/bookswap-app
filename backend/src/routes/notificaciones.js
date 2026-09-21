// F4 — El sistema enviará una notificación al dueño del libro cuando
// otro usuario muestre interés en su publicación.

const { Router } = require("express");
const db = require("../db");
const { requiereAutenticacion } = require("../middleware/auth");

const router = Router();

// GET /api/notificaciones
router.get("/", requiereAutenticacion, (req, res) => {
  const notificaciones = db
    .prepare(
      `SELECT n.*, l.titulo AS libro_titulo, l.ficha AS libro_ficha
       FROM notificaciones n JOIN libros l ON l.id_libro = n.id_libro
       WHERE n.id_usuario_destino = ?
       ORDER BY n.fecha_creacion DESC`
    )
    .all(req.usuario.id_usuario);

  res.json({ notificaciones });
});

// PATCH /api/notificaciones/:id/leida
router.patch("/:id/leida", requiereAutenticacion, (req, res) => {
  const notificacion = db
    .prepare("SELECT * FROM notificaciones WHERE id_notificacion = ?")
    .get(req.params.id);

  if (!notificacion) return res.status(404).json({ error: "No se encontró la notificación." });
  if (notificacion.id_usuario_destino !== req.usuario.id_usuario) {
    return res.status(403).json({ error: "No puedes modificar notificaciones de otro usuario." });
  }

  db.prepare("UPDATE notificaciones SET leida = 1 WHERE id_notificacion = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
