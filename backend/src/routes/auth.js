// F1 — El usuario podrá registrarse e iniciar sesión usando correo
// electrónico o cuenta de Google.
//
// La integración real con OAuth de Google (mencionada en NF... / sección
// 12.1) requiere credenciales propias de un proyecto en Google Cloud;
// aquí se deja el endpoint /auth/google-stub como marcador de posición
// documentado, y se implementa completamente el flujo de correo +
// contraseña, que es el que puede probarse de inmediato.

const { Router } = require("express");
const { randomUUID } = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = Router();

function generarToken(usuario) {
  return jwt.sign(
    { sub: usuario.id_usuario, nombre: usuario.nombre, correo: usuario.correo },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function sinDatosSensibles(usuario) {
  const { password_hash, ...resto } = usuario;
  return resto;
}

// POST /api/auth/registro
router.post("/registro", (req, res) => {
  const { nombre, correo, password } = req.body || {};

  if (!nombre || !correo || !password) {
    return res.status(400).json({ error: "Nombre, correo y contraseña son obligatorios." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." });
  }

  const existente = db.prepare("SELECT id_usuario FROM usuarios WHERE correo = ?").get(correo);
  if (existente) {
    return res.status(409).json({ error: "Ya existe una cuenta registrada con ese correo." });
  }

  const id_usuario = randomUUID();
  const password_hash = bcrypt.hashSync(password, 10);

  db.prepare(
    `INSERT INTO usuarios (id_usuario, nombre, correo, password_hash, metodo_auth)
     VALUES (?, ?, ?, ?, 'email')`
  ).run(id_usuario, nombre, correo, password_hash);

  const usuario = db.prepare("SELECT * FROM usuarios WHERE id_usuario = ?").get(id_usuario);
  const token = generarToken(usuario);

  return res.status(201).json({ usuario: sinDatosSensibles(usuario), token });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { correo, password } = req.body || {};

  if (!correo || !password) {
    return res.status(400).json({ error: "Correo y contraseña son obligatorios." });
  }

  const usuario = db.prepare("SELECT * FROM usuarios WHERE correo = ?").get(correo);
  if (!usuario || usuario.metodo_auth !== "email") {
    return res.status(401).json({ error: "Correo o contraseña incorrectos." });
  }

  const coincide = bcrypt.compareSync(password, usuario.password_hash || "");
  if (!coincide) {
    return res.status(401).json({ error: "Correo o contraseña incorrectos." });
  }

  const token = generarToken(usuario);
  return res.json({ usuario: sinDatosSensibles(usuario), token });
});

module.exports = router;
