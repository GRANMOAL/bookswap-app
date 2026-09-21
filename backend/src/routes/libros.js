// F2 — Publicar libro · F3 — Buscar/filtrar · F4 — Notificar interés
// F6 — Detalle de ficha · F7 — Marcar como intercambiado

const { Router } = require("express");
const { randomUUID } = require("crypto");
const db = require("../db");
const { requiereAutenticacion } = require("../middleware/auth");

const router = Router();

const GENEROS_VALIDOS = ["Novela", "Infantil", "Ensayo", "Ciencia", "Poesía", "Cómic"];
const ESTADOS_LIBRO_VALIDOS = ["Como nuevo", "Bueno", "Regular"];
const TIPOS_VALIDOS = ["Donación", "Intercambio"];

function folioSiguiente() {
  const fila = db.prepare("SELECT COUNT(*) AS n FROM libros").get();
  return `F-${String(fila.n + 1).padStart(3, "0")}`;
}

function libroConDetalle(id_libro) {
  const libro = db
    .prepare(
      `SELECT l.*, u.nombre AS nombre_publicador
       FROM libros l JOIN usuarios u ON u.id_usuario = l.id_usuario_publica
       WHERE l.id_libro = ?`
    )
    .get(id_libro);
  if (!libro) return null;

  const interesados = db
    .prepare(
      `SELECT u.id_usuario, u.nombre, i.fecha_interes
       FROM intereses i JOIN usuarios u ON u.id_usuario = i.id_usuario_interesado
       WHERE i.id_libro = ?
       ORDER BY i.fecha_interes ASC`
    )
    .all(id_libro);

  return { ...libro, interesados };
}

// GET /api/libros?q=&genero=  (F3 — búsqueda y filtrado; NF1 — índices en título/autor/género)
router.get("/", (req, res) => {
  const q = (req.query.q || "").trim();
  const genero = (req.query.genero || "").trim();

  let sql = `SELECT l.*, u.nombre AS nombre_publicador,
                    (SELECT COUNT(*) FROM intereses i WHERE i.id_libro = l.id_libro) AS num_interesados
             FROM libros l JOIN usuarios u ON u.id_usuario = l.id_usuario_publica
             WHERE l.estado = 'activo'`;
  const parametros = [];

  if (q) {
    sql += ` AND (l.titulo LIKE ? OR l.autor LIKE ?)`;
    parametros.push(`%${q}%`, `%${q}%`);
  }
  if (genero && genero !== "Todos") {
    sql += ` AND l.genero = ?`;
    parametros.push(genero);
  }
  sql += ` ORDER BY l.fecha_publicacion DESC`;

  const libros = db.prepare(sql).all(...parametros);
  res.json({ libros });
});

// POST /api/libros  (F2 — publicar libro; NF2 — formulario en pocos pasos)
router.post("/", requiereAutenticacion, (req, res) => {
  const { titulo, autor, genero, estado_libro, ubicacion, tipo, color_portada } = req.body || {};

  const faltantes = [];
  if (!titulo) faltantes.push("título");
  if (!autor) faltantes.push("autor");
  if (!genero) faltantes.push("género");
  if (!estado_libro) faltantes.push("estado de conservación");
  if (!ubicacion) faltantes.push("ubicación de entrega");
  if (!tipo) faltantes.push("tipo (donación/intercambio)");
  if (faltantes.length > 0) {
    return res.status(400).json({ error: `Faltan campos obligatorios: ${faltantes.join(", ")}.` });
  }
  if (!GENEROS_VALIDOS.includes(genero)) {
    return res.status(400).json({ error: `Género inválido. Usa uno de: ${GENEROS_VALIDOS.join(", ")}.` });
  }
  if (!ESTADOS_LIBRO_VALIDOS.includes(estado_libro)) {
    return res.status(400).json({ error: `Estado inválido. Usa uno de: ${ESTADOS_LIBRO_VALIDOS.join(", ")}.` });
  }
  if (!TIPOS_VALIDOS.includes(tipo)) {
    return res.status(400).json({ error: `Tipo inválido. Usa "Donación" o "Intercambio".` });
  }

  const id_libro = randomUUID();
  db.prepare(
    `INSERT INTO libros
      (id_libro, ficha, titulo, autor, genero, estado_libro, ubicacion, tipo, color_portada, id_usuario_publica)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id_libro,
    folioSiguiente(),
    titulo,
    autor,
    genero,
    estado_libro,
    ubicacion,
    tipo,
    color_portada || "#C68A2D",
    req.usuario.id_usuario
  );

  res.status(201).json({ libro: libroConDetalle(id_libro) });
});

// GET /api/libros/:id  (F6 — detalle completo de una ficha)
router.get("/:id", (req, res) => {
  const libro = libroConDetalle(req.params.id);
  if (!libro) return res.status(404).json({ error: "No se encontró la ficha solicitada." });
  res.json({ libro });
});

// POST /api/libros/:id/intereses  (F4, CU-02 — mostrar interés + notificar)
router.post("/:id/intereses", requiereAutenticacion, (req, res) => {
  const libro = db.prepare("SELECT * FROM libros WHERE id_libro = ?").get(req.params.id);
  if (!libro) return res.status(404).json({ error: "No se encontró la ficha solicitada." });

  if (libro.id_usuario_publica === req.usuario.id_usuario) {
    return res.status(400).json({ error: "No puedes mostrar interés en tu propia publicación." });
  }
  if (libro.estado !== "activo") {
    return res.status(400).json({ error: "Este libro ya no está disponible." });
  }

  const yaExiste = db
    .prepare("SELECT 1 FROM intereses WHERE id_libro = ? AND id_usuario_interesado = ?")
    .get(libro.id_libro, req.usuario.id_usuario);

  // Flujo alternativo de CU-02: si ya está interesado, se ignora la acción repetida.
  if (!yaExiste) {
    db.prepare(
      `INSERT INTO intereses (id_interes, id_libro, id_usuario_interesado) VALUES (?, ?, ?)`
    ).run(randomUUID(), libro.id_libro, req.usuario.id_usuario);

    db.prepare(
      `INSERT INTO notificaciones (id_notificacion, id_usuario_destino, id_libro, texto)
       VALUES (?, ?, ?, ?)`
    ).run(
      randomUUID(),
      libro.id_usuario_publica,
      libro.id_libro,
      `${req.usuario.nombre} mostró interés en "${libro.titulo}".`
    );
  }

  res.status(201).json({ libro: libroConDetalle(libro.id_libro) });
});

// PATCH /api/libros/:id/estado  (F7, CU-03 — marcar como intercambiado)
router.patch("/:id/estado", requiereAutenticacion, (req, res) => {
  const libro = db.prepare("SELECT * FROM libros WHERE id_libro = ?").get(req.params.id);
  if (!libro) return res.status(404).json({ error: "No se encontró la ficha solicitada." });

  if (libro.id_usuario_publica !== req.usuario.id_usuario) {
    return res.status(403).json({ error: "Solo quien publicó el libro puede marcarlo como intercambiado." });
  }

  const numInteresados = db
    .prepare("SELECT COUNT(*) AS n FROM intereses WHERE id_libro = ?")
    .get(libro.id_libro).n;

  // Precondición de CU-03 / regla de negocio F7: requiere al menos un interesado.
  if (numInteresados === 0) {
    return res.status(400).json({ error: "No puedes marcar como intercambiado un libro sin interesados." });
  }

  db.prepare("UPDATE libros SET estado = 'intercambiado' WHERE id_libro = ?").run(libro.id_libro);
  res.json({ libro: libroConDetalle(libro.id_libro) });
});

module.exports = router;
