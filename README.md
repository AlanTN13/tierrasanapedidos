# Tierra Sana

MVP de catalogo y pedidos por WhatsApp para una dietetica boutique, construido con Next.js, TypeScript y Tailwind CSS.

## Supabase

El proyecto usa Supabase Auth con `@supabase/ssr` y protege el backoffice en `/admin`.

### Variables de entorno

Completa:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

### Primer admin

Crear el primer usuario admin en Supabase:

```bash
npm run admin:create -- tierrasanadietetica@gmail.com 'Tn13030304@'
```

Eso crea el usuario en `auth.users` si no existe y lo registra en `public.admin_users`.
Despues podes entrar desde `/admin/login` con email y contrasena.

### Catalogo

Importar categorias y productos al proyecto conectado:

```bash
npm run catalog:import
```

### Ajustes pendientes en Supabase Dashboard

En `Auth` configura:

1. `URL Configuration` con el `Site URL` real del proyecto.
2. `Redirect URLs` para tu dominio y para `http://localhost:3000/*` en desarrollo.
3. Si usas Magic Link o recovery en algun flujo futuro, template de email apuntando a:

```text
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```
