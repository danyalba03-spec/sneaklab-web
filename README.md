# SneakLab — sitio web

Sitio web de **SneakLab**, servicio de limpieza y cuidado de tenis en León, Guanajuato. SneakLab nace de la marca original **FreshKicks**.

El sitio es **estático**: solo usa HTML, CSS y JavaScript, sin servidor ni base de datos. Por eso es rápido, gratis de alojar en GitHub Pages y tiene muy poca superficie de ataque.

---

## Qué hay en el proyecto

```
sneaklab-web/
├── docs/                    ← EL SITIO (esto es lo que publica GitHub Pages)
│   ├── index.html           Inicio
│   ├── nosotros.html        Nosotros
│   ├── servicios.html       Servicios
│   ├── galeria.html         Galería con comparador antes/después
│   ├── contacto.html        Contacto, formulario y preguntas frecuentes
│   ├── aviso-legal.html, privacidad.html, cookies.html,
│   │   terminos.html, reembolsos.html     Páginas legales
│   ├── 404.html             Página de error personalizada
│   ├── sitemap.xml, robots.txt, site.webmanifest
│   └── assets/
│       ├── css/styles.css   Diseño (colores, tipografía, responsive)
│       ├── js/config.js     ★ DATOS DEL NEGOCIO (WhatsApp, redes, horarios, legales)
│       ├── js/data.js       ★ SERVICIOS, PRECIOS Y GALERÍA
│       ├── js/main.js       Funciones (menú, comparador, galería, formulario)
│       └── img/             Fotos optimizadas (.webp) e íconos
├── .gitignore               Archivos que NUNCA se suben (.env, secretos, fotos originales)
├── .env.example             Plantilla para un futuro backend (no se usa hoy)
└── README.md
```

Casi todo lo que vas a cambiar está en **dos archivos**: `config.js` y `data.js`.

---

## Ver el sitio en tu computadora

**Opción rápida:** abre `docs/index.html` con doble clic. Funciona casi todo.

**Opción recomendada** (igual que en internet). En la Terminal:

```bash
cd ~/Desktop/Tenis/sneaklab-web/docs
```

```bash
python3 -m http.server 8000
```

Luego abre <http://localhost:8000> en tu navegador. Para detenerlo, presiona `Ctrl + C`.

---

## Cambiar datos del negocio (WhatsApp, redes, horarios)

Abre `docs/assets/js/config.js`:

- `whatsappNumber`: número con lada de país, **solo números** (ej. `524778021115`).
- `phoneDisplay`: cómo se ve el número en la página.
- `social.instagram`, `social.tiktok`, `social.facebook`, `social.googleBusiness`: pega la URL completa que empiece con `https://`. Si lo dejas vacío, no aparece.
- `hours`: quita las `//` de los ejemplos y escribe tus horarios reales.
- `legal`: tu nombre completo o razón social, el domicilio para notificaciones y un correo para solicitudes de privacidad. **Llénalo antes de publicar.**

> Este archivo es público. Nunca pongas contraseñas ni claves aquí.

---

## Cambiar servicios y precios

Abre `docs/assets/js/data.js`, sección `services`. Cada servicio tiene:

```js
{
  id: 'basica',                    // identificador sin espacios
  name: 'Limpieza básica',         // título del servicio
  description: '...',
  benefits: ['...', '...', '...'],
  price: 120,                      // número en pesos, o null = "Por cotización"
  featured: true                   // opcional: agrega la etiqueta "Más completo"
}
```

El botón **Cotizar** de cada servicio prepara solo un mensaje de WhatsApp con el nombre del servicio, y el servicio también aparece en el formulario de contacto.

Si cambias precios, actualiza también la página de inicio (`index.html`, "Desde $120"), la pregunta "¿Cuánto cuesta?" en `contacto.html` y los precios dentro de `<script type="application/ld+json">` en `index.html`.

---

## Agregar fotografías

1. Usa **solo fotos de trabajos tuyos** (o fotos con permiso por escrito de su autor).
2. Crea dos versiones `.webp` de cada foto: una grande (máx. 1400 px de lado, por ejemplo `9001.webp`) y una chica (máx. 640 px, `9001-sm.webp`). Puedes usar <https://squoosh.app> (gratis, sin subir tus fotos a ningún servidor).
3. Cópialas a `docs/assets/img/`.
4. La galería muestra **siempre pares**: el mismo tenis antes y después, de preferencia desde el mismo ángulo. Una foto de "antes" nunca aparece sola. En `data.js`, agrega una línea en `gallery`:

```js
{ pair: 'Nombre del par', view: 'Vista lateral', category: 'blanco', before: '9001', after: '9002' },
```

- `before` / `after`: nombres de las fotos de antes y después (sin `.webp`).
- `view`: el ángulo de las fotos (se usa en el pie de foto y en la descripción para Google y lectores de pantalla).
- `category`: una de las que están en `categories` (puedes crear nuevas; cada una aparece como filtro).
- Si solo tienes la foto de "antes" de un par, no lo agregues hasta tener la de "después".

Para el comparador antes/después, agrega un par en `comparisons`, de preferencia con dos fotos tomadas desde el mismo ángulo.

Las fotos originales (`.jpeg`) están en `.gitignore` para no subir cientos de MB a GitHub.

---

## Formulario de contacto: cómo funciona

El sitio no tiene servidor, así que el formulario **no envía datos a ningún lado**. Primero valida los campos y después abre WhatsApp con el mensaje ya escrito. La persona decide si lo envía.

- Hay **dos casillas separadas**: una obligatoria (aceptar el Aviso de privacidad y los Términos) y otra opcional (recibir promociones).
- El mensaje incluye la **fecha, la hora, la versión del aviso y la respuesta a ambas casillas**. Así queda **registro de cuándo y cómo aceptó cada persona** en tu chat de WhatsApp. **No borres esos chats** mientras tengas relación con el cliente.
- Tiene protección básica contra spam: un campo oculto y un tiempo mínimo antes de enviar.

---

## Usar GitHub Desktop

### Primera vez: subir el proyecto a GitHub

1. Instala GitHub Desktop: <https://desktop.github.com> e inicia sesión con tu cuenta.
2. **File → Add local repository…** y elige la carpeta `sneaklab-web`.
3. Haz clic en **Publish repository**. Te recomiendo el nombre `sneaklab-web`, porque las URLs del sitemap ya usan ese nombre (ver abajo).
   - Desmarca **Keep this code private** si quieres usar GitHub Pages gratis. GitHub Pages en repositorios privados requiere un plan de pago.

### Cada vez que hagas cambios

1. Abre GitHub Desktop. A la izquierda verás los **archivos cambiados**. Haz clic en cada uno para ver qué cambió (rojo = quitado, verde = agregado).
2. **Revisa que no haya archivos sensibles** (`.env`, contraseñas, fotos personales).
3. Abajo a la izquierda escribe un **resumen** (ej. "Actualizar horarios") y presiona **Commit to main**.
4. Presiona **Push origin** (arriba). En 1 o 2 minutos el sitio publicado se actualiza.

---

## Publicar con GitHub Pages

1. En GitHub, entra a tu repositorio → **Settings → Pages**.
2. En **Build and deployment**, elige **Source: Deploy from a branch**.
3. **Branch:** `main`, **carpeta:** `/docs` → **Save**.
4. Espera unos minutos. GitHub mostrará la dirección, por ejemplo `https://TU-USUARIO.github.io/sneaklab-web/`.
5. Marca **Enforce HTTPS** (normalmente ya viene activado).

A partir de ahí, cada **Push** a `main` publica los cambios automáticamente. No hace falta ningún workflow extra.

**Importante:** el sitemap, `robots.txt` y las etiquetas de redes sociales usan la dirección `https://danyalba03-spec.github.io/sneaklab-web/`. Si tu usuario o el nombre del repositorio son distintos, o si conectas un dominio propio, reemplaza esa dirección en todos los archivos de `docs/`. Desde la Terminal, en la carpeta `sneaklab-web`:

```bash
grep -rl "danyalba03-spec.github.io/sneaklab-web/" docs | xargs sed -i '' "s#https://danyalba03-spec.github.io/sneaklab-web/#https://www.TU-DOMINIO.com/#g"
```

---

## Conectar un dominio propio (ej. sneaklab.mx)

1. **Revisar disponibilidad:** busca el nombre en un registrador como Cloudflare Registrar, Namecheap, Porkbun o GoDaddy. Para `.mx` puedes usar Neubox, Akky o cualquiera de los anteriores.
2. **Comprar:** compara el precio de **renovación**, no solo el del primer año. Activa la protección de privacidad WHOIS y la renovación automática.
3. **Configurar DNS** en el panel del registrador:
   - Para el dominio raíz (`sneaklab.mx`), crea 4 registros **A** que apunten a `185.199.108.153`, `185.199.109.153`, `185.199.110.153` y `185.199.111.153`.
   - Para `www`, crea un registro **CNAME** que apunte a `TU-USUARIO.github.io`.
4. **Conectar en GitHub:** Settings → Pages → **Custom domain** → escribe `www.sneaklab.mx` → Save. GitHub creará el archivo `docs/CNAME`.
5. **HTTPS:** cuando el DNS termine de propagarse (de minutos a 24 horas), marca **Enforce HTTPS**.
6. **Evitar errores:**
   - No uses registros comodín (`*`).
   - Verifica el dominio en GitHub (Settings de tu cuenta → Pages → **Add a domain**) para evitar que otra persona lo use.
   - Después, actualiza las URLs del sitemap con el comando de arriba.

---

## SEO y Google

- **Google Search Console:** entra a <https://search.google.com/search-console>, agrega tu sitio y verifícalo. La forma más sencilla es con una etiqueta `<meta name="google-site-verification" …>` en `index.html` o, con dominio propio, con un registro DNS. Después envía `sitemap.xml`.
- **Perfil de Empresa en Google (Maps):** créalo en <https://business.google.com>. Si atiendes sin local abierto al público, configúralo como **empresa de servicios en un área** (León) para no mostrar tu domicilio. Pega el enlace en `config.js` → `social.googleBusiness`.
- **No inventes reseñas.** Pide a clientes reales que dejen su opinión en Google.

---

## Analítica (opcional)

El sitio funciona sin analítica y sin cookies. Para medir visitas:

1. Crea una propiedad de Google Analytics 4 y copia el ID (`G-XXXXXXX`).
2. Pégalo en `config.js` → `analytics.ga4Id`.
3. El sitio mostrará un aviso de cookies y **solo cargará la analítica si la persona acepta**.
4. Actualiza la `Política de cookies` para decir que la analítica está activa.

---

## Seguridad y variables de entorno

Lo que ya está implementado:

- No se usa `innerHTML` con datos: todo el contenido dinámico se crea de forma segura con `textContent`.
- Hay una **Content Security Policy** en cada página: solo se cargan scripts del propio sitio (y Google Analytics, si lo activas).
- Los enlaces externos llevan `rel="noopener noreferrer"`.
- Las URLs de redes sociales se validan para que empiecen con `https://`.
- El formulario valida los datos y no guarda nada en el navegador ni en un servidor.
- El sitio no tiene contraseñas, tokens ni claves. GitHub Pages sirve todo con HTTPS.

Reglas para `.env`:

- **El sitio actual NO necesita `.env`.** Los datos de `config.js` son públicos a propósito (un número de WhatsApp no es un secreto).
- `.env` está en `.gitignore`: **nunca** se sube a GitHub. `.env.example` sí se sube, pero sin valores reales.
- **Nada que esté en `docs/` es secreto.** Cualquier persona puede verlo. Nunca pongas ahí claves de pago, tokens de API ni contraseñas.
- Si algún día subes una contraseña por error, **cámbiala o revócala de inmediato** en el servicio correspondiente. Borrarla del último commit no basta, porque queda en el historial.

Antes de cada push, revisa en GitHub Desktop la lista de archivos. Desde la Terminal también puedes comprobar que `.env` esté ignorado:

```bash
git check-ignore -v .env
```

---

## Preparado para crecer

Para agregar reservaciones, calendario, seguimiento de pedidos, panel de administración o pagos se necesitará un **backend** (por ejemplo Flask + base de datos, o un servicio como Supabase o Firebase). La estructura actual lo facilita:

- Los servicios ya viven en datos (`data.js`). Después pueden venir de una API sin rehacer la lista.
- El formulario ya valida y arma los datos de la solicitud. Solo habría que cambiar el destino de WhatsApp a la API.
- Cuando exista el backend, necesitará: validación del lado del servidor, contraseñas con hash, sesiones seguras, protección contra abuso (límite de intentos y CAPTCHA), secretos en variables de entorno del servidor y una actualización del Aviso de privacidad.

---

## Mantenimiento

- Actualiza las fotos y la galería con trabajos nuevos, siempre con fotos propias.
- Si modificas `styles.css` o algún archivo `.js`, sube el número de versión en las páginas HTML (por ejemplo cambia `?v=3` por `?v=4` en todos los `.html`). Así los navegadores descargan la versión nueva en vez de usar la que tenían guardada.
- Revisa precios y horarios en `config.js` y `data.js`.
- Si cambias cómo usas los datos personales, actualiza el Aviso de privacidad y cambia `privacyNoticeVersion`.
- Prueba el sitio en celular después de cada cambio importante.
- De vez en cuando, ejecuta Lighthouse (Chrome → clic derecho → Inspeccionar → pestaña **Lighthouse**) y revisa las recomendaciones.

---

## Pendientes antes de publicar

- [ ] Llenar `legal.responsibleName`, `legal.address` y `legal.contactEmail` en `config.js`.
- [ ] Revisar las páginas legales con un abogado y completar los puntos marcados como **[PENDIENTE]** (IVA, anticipo, plazos de recolección y la política de reembolso).
- [ ] Agregar horarios y redes sociales reales en `config.js`.
- [ ] Confirmar el nombre del repositorio o del dominio y actualizar las URLs del sitemap y de Open Graph.
- [ ] Fotos del "después" del par de gamuza (opcional).
