# Gestor Personal — Finanzas, Agenda y Auditoría

Versión full-stack del gestor personal: frontend en **React + Vite + Tailwind**, backend en **Vercel Serverless Functions** (Node.js) y base de datos **Supabase (Postgres)**. Todo se despliega como un único proyecto de Vercel.

- El frontend **nunca** habla con Supabase ni ve claves: todo pasa por `/api/*`.
- Acceso de usuario único con credenciales definidas en variables de entorno. La sesión es un JWT en una cookie `httpOnly` (7 días).

## Estructura

```
app/
├─ api/                       # Funciones serverless (cada archivo = un endpoint)
│  ├─ _lib/                   # Helpers compartidos (no se exponen como rutas)
│  ├─ auth/                   # login, logout, me
│  ├─ transactions/           # index.js (GET/POST) y [id].js (PUT/DELETE)
│  ├─ agenda/                 # index.js (GET/POST) y [id].js (PUT/DELETE)
│  ├─ config/                 # categories.js, payment-methods.js
│  └─ audit/                  # index.js (GET/DELETE)
├─ src/                       # Frontend React
├─ supabase/schema.sql        # Esquema + datos iniciales
├─ vercel.json
└─ .env.example
```

## 1. Configurar Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. Abrí **SQL Editor → New query**, pegá el contenido completo de `supabase/schema.sql` y ejecutalo (**Run**).
   - Las tablas se crean en el esquema **`GestorGastos`** (no en `public`).
   - Luego andá a **Project Settings → API → Data API → Exposed schemas**, agregá `GestorGastos` y guardá. Sin este paso la API devuelve error de esquema inválido.
   Crea las tablas, índices, la función `balance_before`, habilita RLS (sin políticas) y carga las categorías y métodos de pago por defecto. Se puede re-ejecutar sin perder datos.
3. Obtené las credenciales en **Project Settings → API** (o **Settings → API Keys**):
   - **Project URL** → `SUPABASE_URL`
   - **service_role** key (secreta) → `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ La `service_role` key saltea RLS: usala solo en variables de entorno del servidor. Nunca la subas al repositorio ni la uses en el frontend.

## 2. Variables de entorno

| Variable | Descripción |
| --- | --- |
| `APP_USERNAME` | Usuario para ingresar a la app |
| `APP_PASSWORD` | Contraseña para ingresar a la app |
| `JWT_SECRET` | Secreto largo y aleatorio para firmar la sesión |
| `SUPABASE_URL` | URL del proyecto de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key de Supabase |

Para generar un `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## 3. Deploy en Vercel

1. Subí el repositorio a GitHub/GitLab/Bitbucket.
2. En Vercel: **Add New → Project**, importá el repo.
3. **Root Directory**: `app` (importante si el repo contiene también el HTML original).
4. Framework: **Vite** (se detecta solo; `vercel.json` ya define build `npm run build` y salida `dist`).
5. En **Settings → Environment Variables** cargá las 5 variables de arriba (Production y Preview).
6. **Deploy**. Si cambiás variables después, hacé **Redeploy**.

Alternativa por CLI, desde `app/`:

```bash
npm i -g vercel
vercel login
vercel link
vercel env add APP_USERNAME      # repetir para cada variable
vercel --prod
```

## 4. Desarrollo local

```bash
cd app
npm install
cp .env.example .env.local       # completar con valores reales
```

**Opción A — todo con Vercel CLI (recomendada):**

```bash
vercel dev
```

Levanta frontend y funciones `/api` juntos en `http://localhost:3000`. (La primera vez pide vincular el proyecto; también podés traer las variables con `vercel env pull .env.local`.)

**Opción B — Vite con HMR + API por Vercel:**

```bash
# Terminal 1: API (y frontend) en :3000
vercel dev
# Terminal 2: Vite en :5173, con proxy /api -> http://localhost:3000
npm run dev
```

Abrí `http://localhost:5173`.

En local (`vercel dev`) la cookie de sesión se emite sin el flag `Secure` para que funcione sobre `http`; en Preview/Production siempre lleva `Secure`.

### Scripts

| Script | Acción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo de Vite |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build localmente (sin API) |

## API

Todas las respuestas son JSON. Los errores tienen la forma `{ "error": "mensaje" }`. Todos los endpoints de datos requieren sesión (401 si no la hay).

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/api/auth/login` | `{ username, password }` → setea cookie |
| POST | `/api/auth/logout` | Borra la cookie |
| GET | `/api/auth/me` | `{ authenticated, username? }` |
| GET | `/api/transactions?month=YYYY-MM&category=&payment=` | `{ items, initialBalance }` |
| POST | `/api/transactions` | Crea un movimiento |
| PUT/DELETE | `/api/transactions/:id` | Edita / elimina |
| GET | `/api/agenda?from=YYYY-MM-DD&to=YYYY-MM-DD` | `{ items }` |
| POST | `/api/agenda` | Crea compromiso (409 si se superpone) |
| PUT/DELETE | `/api/agenda/:id` | Edita (409 si se superpone) / elimina |
| GET/POST/DELETE | `/api/config/categories` | Lista / alta `{ name }` / baja `?id=` o `?name=` |
| GET/POST/DELETE | `/api/config/payment-methods` | Ídem |
| GET | `/api/audit?limit=50&offset=0` | `{ items, total, limit, offset }` |
| DELETE | `/api/audit` | Limpia el historial |

## Notas

- Si el nombre de un método de pago contiene "Crédito"/"Credito", los gastos con ese método piden cuotas y vencimiento.
- El saldo inicial de un mes es la suma de todos los movimientos anteriores (se calcula en Postgres con `balance_before`).
- El login fallido tiene una demora artificial (~1 s) como mitigación básica de fuerza bruta.
- Hay 10 funciones serverless, por debajo del límite de 12 del plan Hobby de Vercel. Si agregás endpoints nuevos, tenelo en cuenta.
