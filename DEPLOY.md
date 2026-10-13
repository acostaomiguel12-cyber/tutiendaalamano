# Deploy a producción — TU TIENDA A LA MANO

## 1. Supabase (SQL Editor, en este orden)

1. `supabase_schema.sql` — solo si la base es nueva (⚠️ contiene DROP TABLE).
2. `supabase_migrations.sql` — siempre (idempotente: `password_hash`, `image_position`).
3. `supabase_hardening.sql` — cuando el backend tenga `SUPABASE_SERVICE_ROLE_KEY`.

## 2. Contraseña admin

```bash
ADMIN_EMAIL=tu@correo.co ADMIN_PASSWORD='clave-de-minimo-10' npm run seed:admin
```
Borra `ADMIN_PASSWORD` del entorno después.

## 3. Variables de entorno del servicio

| Variable | Origen |
|---|---|
| `WOMPI_ENV` | `production` (o `sandbox` para pruebas) |
| `WOMPI_PUBLIC_KEY` / `WOMPI_PRIVATE_KEY` | Panel Wompi → Desarrolladores → Llaves |
| `WOMPI_INTEGRITY_SECRET` / `WOMPI_EVENTS_SECRET` | Panel Wompi → Desarrolladores |
| `SUPABASE_URL` | Dashboard Supabase → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Dashboard Supabase → API (service_role) |
| `ADMIN_SESSION_SECRET` | `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `WHATSAPP_TOKEN` / `WHATSAPP_PHONE_NUMBER_ID` | Meta Developers (opcional) |
| `PORT` | `4001` (Render lo inyecta solo; no definir) |

Frontend (`VITE_*`) se inyecta en build: `VITE_WOMPI_PUBLIC_KEY`, `VITE_WOMPI_ENV`,
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. En Docker van como ARG si cambian;
por defecto el código trae los valores de producción.

## 4A. Render (recomendado para empezar)

1. New → Web Service → conecta el repo → usa `render.yaml` (runtime Docker).
2. Completa las variables `sync: false` en el dashboard.
3. Deploy. Health: `https://tu-app.onrender.com/api/health`.

## 4B. VPS con Docker

```bash
git clone <repo> && cd opuskartel
# crea .env con las variables de la tabla (nunca .env.local del dev)
docker build -t opuskartel .
docker run -d --name opuskartel --env-file .env -p 127.0.0.1:4001:4001 opuskartel
```

Delante pon Caddy/Nginx con HTTPS y proxy a `127.0.0.1:4001`. Ejemplo Caddy:

```
opuskartel.com {
    reverse_proxy 127.0.0.1:4001
}
```

## 5. Wompi (post-deploy)

1. Panel Wompi → Desarrolladores → Eventos: registra
   `https://tu-dominio/api/wompi/webhook`.
2. Haz una compra sandbox de $1.000 antes de vender real
   (`WOMPI_ENV=sandbox` + llaves `*_test_*`).
3. Verifica en admin → Conciliación que la transacción aparece.

## 6. Verificación

- `GET /api/health` → `ok:true`, llaves en `true`, `whatsapp` según token.
- Admin → Testing: ejecutar suite completa (8/8 con backend arriba).
- Compra de prueba → orden APPROVED + guía generada.
