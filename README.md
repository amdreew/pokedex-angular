# Pokédex Angular

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![codecov](https://codecov.io/gh/keilermora/pokedex-angular/branch/master/graph/badge.svg?token=9E0D28IOFT)](https://codecov.io/gh/keilermora/pokedex-angular)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

La aplicación muestra el listado y el detalle de los Pokémon de las primeras 3 generaciones.

- El listado incluye las variaciones de sprite que cada Pokémon tuvo desde la versión **Green (1996)** hasta **Emerald (2005)**.
- El detalle individual muestra estadísticas base y las entradas de la Pokédex por versión de juego.

Interfaz construida con **Angular**, conectada a la API RESTful **PokéAPI** (REST) y su **API GraphQL beta** para consultas más eficientes.

---

## Versiones principales

| Herramienta | Versión |
|---|---|
| Node.js | 20 LTS |
| Angular CLI | ^20.3.24 |
| Angular | ^20.3.19 |
| TypeScript | ~5.8.3 |
| RxJS | ~7.5.0 |
| Apollo Angular | 11.0.0 |
| @apollo/client | 3.13.9 |
| GraphQL | ^16.13.2 |

---

## Arquitectura del proyecto

```
src/
├── app/
│   ├── core/        # Servicios globales, interceptores, guard de módulo, configuración Apollo
│   ├── data/        # Enums, queries .graphql, mocks
│   ├── shared/      # Pipes, directivas, componentes de layout, animaciones, interfaces
│   └── views/       # Módulos lazy-loaded (home, pokemon-details, about, not-found, error)
└── environments/    # Variables por entorno (dev, prod, docker)
```

**Rutas lazy-loaded:**

| Ruta | Módulo |
|---|---|
| `/` | HomeModule — listado con filtros |
| `/pokemon/:id` | PokemonDetailsModule |
| `/about` | AboutModule |
| `/error` | InternalServerErrorModule |
| `**` | NotFoundModule |

**Gestión de estado:** sin NgRx ni Signals. Los filtros viven en URL query params + RxJS `ReplaySubject`. Los datos de red se cachean en `localStorage`.

---

## Levantar en local (desarrollo)

### Requisitos

- [Node.js 20 LTS](https://nodejs.org)
- npm (incluido con Node.js)
- Un navegador moderno

### Pasos

```bash
npm install
npm start        # equivale a: ng serve
```

La app queda disponible en `http://localhost:4200`.

### Por qué es necesario el proxy (`proxy.conf.json`)

La API GraphQL de PokéAPI (`https://beta.pokeapi.co/graphql/v1beta`) **no permite peticiones CORS desde `localhost`**. Para que el servidor de desarrollo pueda comunicarse con ella, Angular CLI incluye un servidor proxy integrado que reenvía las peticiones.

El archivo `proxy.conf.json` en la raíz define esa regla:

```json
{
  "/graphql": {
    "target": "https://beta.pokeapi.co",
    "secure": true,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

Cualquier petición a `/graphql/...` que haga la app en desarrollo es interceptada por el proxy y redirigida a `https://beta.pokeapi.co/graphql/...`, evitando el bloqueo CORS del navegador.

**Dónde se conecta el proxy a Angular CLI:** en `angular.json`, la configuración `serve > development` tiene la propiedad:

```json
"proxyConfig": "proxy.conf.json"
```

Esto hace que `ng serve` (y por tanto `npm start`) levante automáticamente el proxy al iniciar. No es necesario ningún parámetro extra.

En `environment.ts` (dev), la URL GraphQL apunta a la ruta local:

```ts
pokeApiGraphQL: '/graphql/v1beta'
```

En `environment.prod.ts` y `environment.docker.ts` (producción / Docker), apunta directo al dominio externo porque el proxy no existe en esos entornos:

```ts
pokeApiGraphQL: 'https://beta.pokeapi.co/graphql/v1beta'
```

---

## Compilar y servir con Docker

### Requisitos

- [Docker](https://www.docker.com/) instalado y corriendo

### Cómo funciona

El `Dockerfile` usa una construcción **multi-stage**:

**Stage 1 — builder (`node:20-alpine`):**
1. Instala dependencias (`npm install --ignore-scripts`).
2. Compila con la configuración `docker`: `npx ng build --configuration docker`.  
   Esta configuración reemplaza `environment.ts` por `environment.docker.ts`, que usa `imagesPath: '/assets/images'` (raíz `/`, no el subpath de GitHub Pages) y apunta GraphQL directo a `beta.pokeapi.co`.

**Stage 2 — runner (`nginx:1.27-alpine`):**
1. Elimina la config por defecto de nginx.
2. Copia `nginx.conf` como configuración personalizada.
3. Copia los artefactos compilados (`dist/pokedex-angular`) al directorio web de nginx.
4. Expone el puerto `8080`.

**Configuración de nginx (`nginx.conf`):**
- Sirve en el puerto `8080`.
- Activa compresión **gzip** para JS, CSS, JSON, SVG y fuentes.
- Assets con hash (JS/CSS): caché agresiva de 1 año (`immutable`).
- `index.html`: sin caché (`no-store`) para garantizar que el usuario siempre descargue el build más reciente.
- Rutas SPA: cualquier ruta que no sea un archivo estático redirige a `index.html` (`try_files $uri $uri/ /index.html`), necesario para que el router de Angular funcione con URLs directas o recarga de página.

### Comandos

```bash
# Construir la imagen
docker build -t pokedex-angular .

# Ejecutar el contenedor
docker run -p 8080:8080 pokedex-angular
```

La app queda disponible en `http://localhost:8080`.

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Servidor de desarrollo con proxy en `http://localhost:4200` |
| `npm run build` | Build de producción estándar |
| `npm run watch` | Build en modo watch (development) |
| `npm test` | Tests unitarios con cobertura (Chrome) |
| `npm run lint` | Linter ESLint + Prettier |
| `npm run deploy` | Build para GitHub Pages + publicación con `gh-pages` |

---

## Deploy en GitHub Pages

```bash
npm run deploy
```

Ejecuta `ng build --configuration production --base-href=/pokedex-angular/` y publica el resultado en la rama `gh-pages`. La configuración `production` usa `imagesPath: '/pokedex-angular/assets/images'` para que las rutas de imágenes sean correctas bajo el subpath de GitHub Pages.

---

## Referencias

- [Angular](https://angular.io/) — framework principal
- [PokéAPI](https://pokeapi.co/) — API REST de Pokémon
- [PokéAPI GraphQL](https://beta.pokeapi.co/graphql/v1beta) — API GraphQL beta
- [Apollo Angular](https://the-guild.dev/graphql/apollo-angular) — cliente GraphQL para Angular
- [Font Awesome](https://fontawesome.com/) — iconos
- [Normalize.css](https://necolas.github.io/normalize.css/) — reset de estilos CSS

## 🔐 Auditoría de Seguridad Adicional

### 1. Análisis con SSL Labs

Se realizó una auditoría de la configuración TLS del dominio productivo:

👉 https://www.ssllabs.com/ssltest/analyze.html?d=nexosof.com

#### Resultado general

- **Calificación: A+**
- Certificado válido (Let's Encrypt)
- Soporte TLS 1.2 y TLS 1.3
- HSTS habilitado
- Sin problemas en la cadena de certificados

#### Hallazgos clave

**Fortalezas:**
- Uso de TLS 1.3 (estándar moderno)
- Protocolos inseguros deshabilitados:
  - SSL 2.0 ❌
  - SSL 3.0 ❌
  - TLS 1.0 ❌
  - TLS 1.1 ❌
- Cipher suites modernas (AES-GCM, ChaCha20)
- Forward Secrecy habilitado

**Observación menor:**
- No se configura DNS CAA (no crítico)

#### Conclusión

La configuración TLS es robusta y cumple con estándares modernos de seguridad, logrando una calificación **A+**.

---

### 2. Análisis con OWASP ZAP

Se ejecutó un escaneo automatizado con OWASP ZAP:

```bash
docker run -t \
  -v ~/zap-reports:/zap/wrk/:rw \
  ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
  -t https://nexosof.com/pokedex/ \
  -r reporte-zap.html

```

Se realizó un escaneo dinámico de seguridad (DAST) utilizando **OWASP ZAP** para identificar posibles vulnerabilidades en la aplicación.

### Resumen del Reporte
El reporte generado por ZAP identificó las siguientes alertas:

| Riesgo | Alerta | Cantidad |
| :--- | :--- |:--------:|
| 🔴 Alto | Cross-Site Scripting (XSS) |    0     |
| 🟡 Medio | Absence of Anti-CSRF Tokens |    3     |
| 🔵 Bajo | Cookie No HttpOnly Flag |    3     |
| ⚪ Informativo | Varias alertas de configuración |    5     |

> **Nota:** Para ver el detalle técnico completo, consulte el archivo: `reporte-zap-v3.html`.

---

### Gestión de Vulnerabilidades y Reclasificación

Tras un análisis exhaustivo del código fuente y de las dependencias, se ha determinado que el hallazgo principal de **Cross-Site Scripting (XSS)** relacionado con el uso de `bypassSecurityTrust*` es un **Falso Positivo**.

#### Justificación Técnica de Falsos Positivos

1. **Inexistencia en Código Propio**: Se verificó mediante un escaneo del código fuente (`src/**/*.ts`) que la aplicación **no utiliza** directamente ninguna función de la familia `bypassSecurityTrust*`[cite: 18, 22, 26]. [cite_start]El bypass detectado por la herramienta no proviene de la lógica de negocio de la aplicación[cite: 27].

2. **Origen en Dependencia de Terceros**: El uso de `bypassSecurityTrustHtml` detectado en `main.js` pertenece exclusivamente a la biblioteca `@fortawesome/angular-fontawesome`[cite: 28, 32].
  - **Ubicación**: `node_modules/@fortawesome/angular-fontawesome/fesm2022/angular-fontawesome.mjs`.
  - **Razón del uso**: Esta biblioteca requiere el bypass para renderizar iconos SVG insertados de forma programática, los cuales Angular sanitiza por defecto. [cite_start]Sin este método, los iconos no se mostrarían correctamente.

3. **Referencias al Framework**: Los otros casos detectados en el empaquetado final corresponden a declaraciones internas de la clase `DomSanitizerImpl` del propio framework Angular y no a llamadas activas que representen un riesgo de inyección.

#### Evaluación de Riesgo Final

| Hallazgo | Clasificación Original | Reclasificación | Justificación |
| :--- | :--- | :--- | :--- |
| XSS (bypassSecurityTrust) | 🟡 Medio | **Falso Positivo** | [cite_start]Uso legítimo por parte de FontAwesome para renderizado de iconos. |

**Estado Final**: No se requieren correcciones en el código de la aplicación, ya que el comportamiento detectado es un patrón legítimo de una dependencia de terceros.

## 🧠 Reflexión Técnica

### 1. ¿Qué vulnerabilidades previenen los encabezados implementados?

Los headers de seguridad implementados mitigan:

- **XSS (Cross-Site Scripting)**
  - Content-Security-Policy
  - X-XSS-Protection

- **Clickjacking**
  - X-Frame-Options

- **MIME Sniffing**
  - X-Content-Type-Options

- **Ataques MITM / downgrade**
  - Strict-Transport-Security (HSTS)

- **Filtración de información**
  - Referrer-Policy

---

### 2. ¿Qué aprendiste sobre la relación entre despliegue y seguridad web?

- La seguridad no depende solo del código
- El despliegue es crítico:
  - Reverse proxy (nginx)
  - TLS correctamente configurado
  - Headers HTTP
  - Aislamiento con Docker

👉 Una app segura mal desplegada sigue siendo vulnerable.

---

### 3. ¿Qué desafíos encontraste?

**1. Configuración SSL**
- Problema inicial entre nginx y certbot
- Solución: certificado temporal

**2. OWASP ZAP**
- Genera falsos positivos
- Requiere análisis manual

**3. Dependencias**
- Riesgos no siempre vienen del código propio

**4. Subruta (/pokedex/)**
- Problemas de baseHref en Angular

---

### Conclusión

La seguridad web es multicapa:

- Código
- Infraestructura
- Configuración
- Dependencias

👉 Las herramientas automatizadas ayudan, pero requieren validación técnica.
