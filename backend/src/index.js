const { cargarEnv } = require("./env");
cargarEnv();

const express = require("express");
const cors = require("cors");

const authRouter = require("./routes/auth");
const librosRouter = require("./routes/libros");
const notificacionesRouter = require("./routes/notificaciones");
const historialRouter = require("./routes/historial");
const usuariosRouter = require("./routes/usuarios");

if (!process.env.JWT_SECRET) {
  console.warn(
    "[BookSwap] Advertencia: JWT_SECRET no está definido. Copia .env.example a .env antes de continuar."
  );
}

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get("/api/salud", (_req, res) => {
  res.json({ ok: true, servicio: "bookswap-backend" });
});

app.use("/api/auth", authRouter);
app.use("/api/libros", librosRouter);
app.use("/api/notificaciones", notificacionesRouter);
app.use("/api/historial", historialRouter);
app.use("/api/usuarios", usuariosRouter);

// Manejador de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
});

// Manejador de errores no controlados (NF7 — no exponer errores crudos al cliente)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Ocurrió un error inesperado en el servidor." });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`BookSwap backend escuchando en http://localhost:${PORT}`);
});
