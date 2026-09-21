// F5 — El usuario podrá calificar y comentar su experiencia una vez
// finalizado el intercambio (CU-03, paso 3-4).

const { Router } = require("express");
const { randomUUID } = require("crypto");
const db = require("../db");
const { requiereAutenticacion } = require("../middleware/auth");

const router = Router();

// POST /api/historial
router.post("/", requiereAutenticacion, (req, res) => {
  const { id_libro, estrellas, comentario } = req.body || {};

  if (!id_libro || !estrellas) {
    return res.status(400).json({ error: "id_libro y estrellas son obligatorios." });
  }
  const estrellasNum = Number(estrellas);
  if (!Number.isInteger(estrellasNum) || estrellasNum < 1 || estrellasNum > 5) {
    // Flujo alternativo de CU-03: sin estrellas seleccionadas no se permite enviar.
    return res.status(400).json({ error: "Selecciona una calificación de 1 a 5 estrellas." });
  }

  const libro = db.prepare("SELECT * FROM libros WHERE id_libro = ?").get(id_libro);
  if (!libro) return res.status(404).json({ error: "No se encontró el libro." });
  if (libro.id_usuario_publica !== req.usuario.id_usuario) {
    return res.status(403).json({ error: "Solo quien publicó el libro puede calificar el intercambio." });
  }

  const id_historial = randomUUID();
  db.prepare(
    `INSERT INTO historial_intercambios (id_historial, id_libro, id_usuario_califica, estrellas, comentario)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id_historial, id_libro, req.usuario.id_usuario, estrellasNum, comentario || null);

  // El libro se retira del catálogo activo (CU-03, postcondición).
  db.prepare("UPDATE libros SET estado = 'intercambiado' WHERE id_libro = ?").run(id_libro);

  const registro = db
    .prepare("SELECT * FROM historial_intercambios WHERE id_historial = ?")
    .get(id_historial);

  res.status(201).json({ historial: registro });
});

module.exports = router;
