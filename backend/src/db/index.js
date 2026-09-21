// Inicialización de la base de datos SQLite.
//
// El esquema traduce, tabla por tabla, el diccionario de datos de la
// sección 11.1 de la documentación técnica de BookSwap. Se usa el módulo
// "node:sqlite", integrado en Node.js desde la versión 22.5 (estable en
// versiones recientes), para que el prototipo corra en cualquier equipo
// SIN necesidad de compilar nada (a diferencia de better-sqlite3, que
// requiere herramientas de compilación C++ — Visual Studio en Windows,
// Xcode en macOS). El mismo esquema es compatible con PostgreSQL/MySQL
// (sección 12.1) si se quiere migrar más adelante — solo cambian los
// tipos de columna (p. ej. TEXT → UUID, INTEGER → SMALLINT).

const path = require("path");
const fs = require("fs");
const { DatabaseSync } = require("node:sqlite");

const DB_FILE = process.env.DB_FILE || "./data/bookswap.db";
const rutaAbsoluta = path.isAbsolute(DB_FILE)
  ? DB_FILE
  : path.join(__dirname, "..", "..", DB_FILE);

fs.mkdirSync(path.dirname(rutaAbsoluta), { recursive: true });

const conexion = new DatabaseSync(rutaAbsoluta);
conexion.exec("PRAGMA journal_mode = WAL;");
conexion.exec("PRAGMA foreign_keys = ON;");

conexion.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario      TEXT PRIMARY KEY,
    nombre          TEXT NOT NULL,
    correo          TEXT NOT NULL UNIQUE,
    password_hash   TEXT,               -- solo aplica si metodo_auth = 'email'
    metodo_auth     TEXT NOT NULL CHECK (metodo_auth IN ('email', 'google')),
    fecha_registro  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS libros (
    id_libro            TEXT PRIMARY KEY,
    ficha                TEXT NOT NULL UNIQUE,
    titulo                TEXT NOT NULL,
    autor                 TEXT NOT NULL,
    genero                TEXT NOT NULL,
    estado_libro          TEXT NOT NULL,
    ubicacion             TEXT NOT NULL,
    tipo                  TEXT NOT NULL CHECK (tipo IN ('Donación', 'Intercambio')),
    color_portada         TEXT NOT NULL,
    id_usuario_publica    TEXT NOT NULL REFERENCES usuarios(id_usuario),
    estado                TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'intercambiado')),
    fecha_publicacion     TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS intereses (
    id_interes            TEXT PRIMARY KEY,
    id_libro              TEXT NOT NULL REFERENCES libros(id_libro),
    id_usuario_interesado TEXT NOT NULL REFERENCES usuarios(id_usuario),
    fecha_interes         TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (id_libro, id_usuario_interesado)  -- CU-02: evita interés duplicado
  );

  CREATE TABLE IF NOT EXISTS notificaciones (
    id_notificacion     TEXT PRIMARY KEY,
    id_usuario_destino  TEXT NOT NULL REFERENCES usuarios(id_usuario),
    id_libro            TEXT NOT NULL REFERENCES libros(id_libro),
    texto               TEXT NOT NULL,
    leida               INTEGER NOT NULL DEFAULT 0,
    fecha_creacion      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS historial_intercambios (
    id_historial         TEXT PRIMARY KEY,
    id_libro             TEXT NOT NULL REFERENCES libros(id_libro),
    id_usuario_califica  TEXT NOT NULL REFERENCES usuarios(id_usuario),
    estrellas            INTEGER NOT NULL CHECK (estrellas BETWEEN 1 AND 5),
    comentario           TEXT,
    fecha_calificacion   TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_libros_titulo  ON libros(titulo);   -- NF1
  CREATE INDEX IF NOT EXISTS idx_libros_autor   ON libros(autor);    -- NF1
  CREATE INDEX IF NOT EXISTS idx_libros_genero  ON libros(genero);   -- NF1
`);

// ---------------------------------------------------------------------
// Envoltorio con la misma "forma" que better-sqlite3 (db.prepare(sql).run/
// get/all(...valores)) mediante parámetros POSICIONALES ("?"), para que
// el resto del código (rutas, seed) no dependa de qué motor hay debajo.
// Si en el futuro se migra a better-sqlite3 o a un driver de Postgres/
// MySQL, solo hay que reemplazar este archivo.
// ---------------------------------------------------------------------

const db = {
  prepare(sql) {
    const stmt = conexion.prepare(sql);
    return {
      run: (...valores) => stmt.run(...valores),
      get: (...valores) => stmt.get(...valores),
      all: (...valores) => stmt.all(...valores),
    };
  },
  exec(sql) {
    return conexion.exec(sql);
  },
};

module.exports = db;
