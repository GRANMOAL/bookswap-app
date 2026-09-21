// Cargador mínimo de archivos .env, sin dependencias externas.
// Lee backend/.env (si existe) y copia sus valores a process.env
// sin sobreescribir variables ya definidas en el entorno real.

const fs = require("fs");
const path = require("path");

function cargarEnv() {
  const rutaEnv = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(rutaEnv)) return;

  const contenido = fs.readFileSync(rutaEnv, "utf-8");
  for (const linea of contenido.split("\n")) {
    const l = linea.trim();
    if (!l || l.startsWith("#")) continue;
    const idx = l.indexOf("=");
    if (idx === -1) continue;
    const clave = l.slice(0, idx).trim();
    let valor = l.slice(idx + 1).trim();
    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1);
    }
    if (process.env[clave] === undefined) {
      process.env[clave] = valor;
    }
  }
}

module.exports = { cargarEnv };
