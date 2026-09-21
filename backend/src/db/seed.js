// Script opcional para poblar la base de datos con datos de ejemplo.
// Uso: npm run seed

const { randomUUID } = require("crypto");
const bcrypt = require("bcryptjs");
require("../env").cargarEnv();
const db = require("./index");

function folioSiguiente() {
  const fila = db.prepare("SELECT COUNT(*) AS n FROM libros").get();
  return `F-${String(fila.n + 1).padStart(3, "0")}`;
}

function crearUsuario({ nombre, correo, password }) {
  const existente = db.prepare("SELECT * FROM usuarios WHERE correo = ?").get(correo);
  if (existente) return existente;
  const id = randomUUID();
  db.prepare(
    `INSERT INTO usuarios (id_usuario, nombre, correo, password_hash, metodo_auth)
     VALUES (?, ?, ?, ?, 'email')`
  ).run(id, nombre, correo, bcrypt.hashSync(password, 10));
  return db.prepare("SELECT * FROM usuarios WHERE id_usuario = ?").get(id);
}

function crearLibro(usuario, datos) {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO libros
      (id_libro, ficha, titulo, autor, genero, estado_libro, ubicacion, tipo, color_portada, id_usuario_publica)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    folioSiguiente(),
    datos.titulo,
    datos.autor,
    datos.genero,
    datos.estado_libro,
    datos.ubicacion,
    datos.tipo,
    datos.color_portada,
    usuario.id_usuario
  );
  return id;
}

const ana = crearUsuario({ nombre: "Ana Torres", correo: "ana@example.com", password: "123456" });
const luis = crearUsuario({ nombre: "Luis Herrera", correo: "luis@example.com", password: "123456" });

const libro1 = crearLibro(ana, {
  titulo: "Cien años de soledad",
  autor: "Gabriel García Márquez",
  genero: "Novela",
  estado_libro: "Bueno",
  ubicacion: "Biblioteca Central, UAEH",
  tipo: "Donación",
  color_portada: "#C68A2D",
});

crearLibro(ana, {
  titulo: "Sapiens: De animales a dioses",
  autor: "Yuval Noah Harari",
  genero: "Ensayo",
  estado_libro: "Como nuevo",
  ubicacion: "Cafetería El Roble",
  tipo: "Intercambio",
  color_portada: "#3B6D11",
});

// Luis muestra interés en el primer libro de Ana, lo que genera una notificación.
const idInteres = require("crypto").randomUUID();
db.prepare(
  `INSERT INTO intereses (id_interes, id_libro, id_usuario_interesado) VALUES (?, ?, ?)`
).run(idInteres, libro1, luis.id_usuario);

db.prepare(
  `INSERT INTO notificaciones (id_notificacion, id_usuario_destino, id_libro, texto)
   VALUES (?, ?, ?, ?)`
).run(
  require("crypto").randomUUID(),
  ana.id_usuario,
  libro1,
  `Luis Herrera mostró interés en "Cien años de soledad".`
);

console.log("Datos de ejemplo creados:");
console.log("  ana@example.com   / 123456");
console.log("  luis@example.com  / 123456");
