# BookSwap — Aplicación (frontend + backend)

Implementación funcional de BookSwap a partir de la documentación técnica
del proyecto (requisitos F1–F8 y NF1–NF7, arquitectura de la sección 12,
contrato de API del Anexo B.1 y modelo de datos de la sección 11).

```
bookswap-app/
├── backend/    API REST — Node.js + Express + SQLite
└── frontend/   Cliente web — React + Vite
```

## Requisitos previos

- **Node.js 22.5 o superior** (incluye npm). Puedes ver tu versión con
  `node -v`. Esta app usa el módulo `node:sqlite`, integrado en Node.js
  desde esa versión — **no necesitas instalar PostgreSQL, MySQL, ni
  herramientas de compilación C++ (Visual Studio / Xcode)**. Todo corre
  con un archivo local (`backend/data/bookswap.db`), tal como se
  documenta en el Anexo A.5 como paso intermedio antes de migrar al motor
  definitivo de la sección 12.1.

## 1. Levantar el backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed      # opcional: crea 2 usuarios y 2 libros de ejemplo
npm run dev        # http://localhost:4000
```

Usuarios de ejemplo creados por `npm run seed`:

| Correo            | Contraseña |
|-------------------|------------|
| ana@example.com   | 123456     |
| luis@example.com  | 123456     |

## 2. Levantar el frontend

En otra terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev        # http://localhost:5173
```

Abre `http://localhost:5173` en el navegador. Si prefieres crear tu propia
cuenta en vez de usar los datos de ejemplo, usa la pestaña "Crear cuenta"
en la pantalla de inicio.

## ¿Qué incluye cada requisito?

| Requisito | Dónde vive |
|---|---|
| F1 — Registro / inicio de sesión | `backend/src/routes/auth.js`, `frontend/src/screens/Auth.jsx` |
| F2 — Publicar libro | `backend/src/routes/libros.js` (POST /), `frontend/src/screens/Publicar.jsx` |
| F3 — Buscar / filtrar | `backend/src/routes/libros.js` (GET /), `frontend/src/screens/Explorar.jsx` |
| F4 — Notificar interés | `backend/src/routes/{libros,notificaciones}.js`, `frontend/src/screens/Notificaciones.jsx` |
| F5 — Calificar intercambio | `backend/src/routes/historial.js`, `frontend/src/components/ModalCalificacion.jsx` |
| F6 — Detalle de ficha | `backend/src/routes/libros.js` (GET /:id), `frontend/src/screens/Detalle.jsx` |
| F7 — Marcar como intercambiado | `backend/src/routes/libros.js` (PATCH /:id/estado) |
| F8 — Perfil e historial | `backend/src/routes/usuarios.js`, `frontend/src/screens/Perfil.jsx` || NF1 — Rendimiento | Índices SQL en `backend/src/db/index.js`; debounce de búsqueda en `Explorar.jsx` |
| NF2 — Usabilidad (≤3 pasos) | `Publicar.jsx` — formulario de un solo paso |
| NF4 — Seguridad | `bcryptjs` + JWT (`middleware/auth.js`); un usuario no puede ver el perfil de otro |
| NF5 — Portabilidad | Frontend en React, listo para envolver con Capacitor (ver sección "Siguiente paso: móvil") |
| NF6 — Mantenibilidad | Nombres de componentes/funciones en español, según el Anexo C.3 |
| NF7 — Estados vacíos | `EstadoVacio.jsx`, usado en Explorar, Notificaciones y Perfil |

## Acerca de (créditos)

En la pantalla **Perfil** hay un botón "Acerca de" que muestra los datos
del proyecto (alumno, universidad, fecha) — ver
`frontend/src/components/AcercaDe.jsx`.

### 🥚 Easter egg (no documentado dentro de la app)

Desde cualquier pantalla, teclear el código Konami:

```
↑ ↑ ↓ ↓ ← → ← → B A
```

...muestra unos créditos animados a pantalla completa (mismos datos, con
íconos flotantes y título con brillo degradado). No hay ningún botón ni
pista visible que lo mencione dentro de la interfaz — queda documentado
aquí y en el código (`frontend/src/hooks/useSecuenciaTeclas.js`,
`frontend/src/components/CreditosSecretos.jsx`, y su conexión en
`App.jsx`) por si algún día quieres cambiar la combinación o el contenido.

## Siguiente paso: empaquetar como app móvil (NF5)

Este mismo frontend está listo para envolverse con
[Capacitor](https://capacitorjs.com/) y compilarse a Android/iOS, tal como
describe la sección 12.1:

```bash
cd frontend
npm run build
npm install @capacitor/core @capacitor/cli
npx cap init BookSwap com.tuusuario.bookswap
npx cap add android   # requiere Android Studio
npx cap add ios       # requiere macOS + Xcode (ver restricción, sección 1.5)
npx cap sync
```

## Notas y próximos pasos

- **Google OAuth (F1):** el botón "Continuar con Google" está presente
  pero deshabilitado; conectar el inicio de sesión real con Google
  requiere crear credenciales OAuth en Google Cloud Console y añadir
  `@react-oauth/google` (frontend) + verificación del token (backend).
- **Notificaciones push:** el Anexo B.4 propone FCM/APNs para avisos en
  segundo plano; este prototipo solo implementa notificaciones "in-app"
  (F4) consultadas al abrir la pantalla de Notificaciones.
- **Base de datos:** para producción, migrar de SQLite a PostgreSQL/MySQL
  implica cambiar `backend/src/db/index.js` por un cliente como `pg` y
  ajustar los tipos (`TEXT` → `UUID`, `INTEGER` → `SMALLINT`, etc.), sin
  tocar las rutas ni el resto de la lógica.

## Solución de problemas

**"npm error gyp ERR! find VS ... Could not find any Visual Studio
installation"** o **"No prebuilt binaries found"**: este proyecto ya no
depende de `better-sqlite3` (que exigía compilar código nativo); usa el
módulo `node:sqlite` incluido en Node.js. Si ves este error, probablemente
tienes una copia antigua del proyecto — vuelve a descargar el zip o
revisa que `backend/package.json` **no** liste `better-sqlite3` entre las
dependencias.

**`(node:###) ExperimentalWarning: SQLite is an experimental feature...`**
al correr `npm run dev` o `npm run seed`: es solo una advertencia, no un
error. Node.js todavía marca `node:sqlite` como experimental aunque
funciona de forma estable; puedes ignorarla.

**`'&&' no es un separador de instrucciones válido` en PowerShell**:
ejecuta los comandos uno por uno en líneas separadas (`cd backend`,
luego `npm install`, luego `npm run dev`, etc.) en vez de encadenarlos
con `&&`, o usa cmd.exe, donde `&&` sí funciona.

**`Cannot find module 'express'` (o `bcryptjs`, `cors`, `jsonwebtoken`)**:
significa que `npm install` no terminó de instalar todo — vuelve a
correr `npm install` dentro de `backend/` y revisa que no aparezca
ningún error en rojo antes de continuar con `npm run seed` / `npm run dev`.

**El frontend no puede conectar con el backend**: revisa que el backend
esté corriendo en `http://localhost:4000` (deberías ver el mensaje
`BookSwap backend escuchando en...` en su terminal) y que
`frontend/.env` tenga `VITE_API_URL=http://localhost:4000/api`.

