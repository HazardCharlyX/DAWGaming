# DAWGAMING — Biblioteca Gaming para 2º DAW de IES Álvaro Falomir

Plataforma web completa y moderna para ejecutar videojuegos y emuladores directamente en el navegador, desarrollada por **Hazard (Carlos J Samper)** con ayuda de **Gemini 3.8 Flash**.

Incluye emulación 100% funcional en el navegador con WebAssembly para **Game Boy Advance (GBA)** y **Nintendo DS (NDS)**, auto-arranque, soporte de doble pantalla con digitalizador táctil (stylus), selector de distribución de pantallas en tiempo real y **auto-hospedaje local offline** de todos los binarios y motores (ideal para redes restringidas escolares o sin conexión externa).

Desarrollada con **Next.js (App Router con Turbopack)**, **TypeScript** y **Tailwind CSS v4**, optimizada y preparada para despliegue en **Vercel**.

---

## 🎮 Características Principales

* **Emulador Game Boy Advance (mGBA WebAssembly)**:
  * Ejecución 100% en cliente con gráficos nítidos y 60 FPS estables.
  * Título preinstalado: **Pokémon Edición Esmeralda** con auto-arranque inmediato.
  * Controles unificados: Flechas de dirección (`↑ ↓ ← →`), `Z` (A), `X` (B), `Q` (L), `E` (R), `Enter` (Start), `V / Espacio` (Select).
  * Soporte nativo para mandos USB y Bluetooth (Gamepad API).
  * Pantalla completa (Fullscreen API), reinicio rápido y filtro opcional CRT.

* **Emulador Nintendo DS (DeSmuME WebAssembly)**:
  * Doble pantalla interactiva: pantalla superior y pantalla inferior táctil con soporte de ratón y eventos táctiles (stylus).
  * Título preinstalado: **Pokémon Renegade Platinum** (edición mejorada en español con los 493 Pokémon capturables).
  * **Selector de Distribución de Pantallas**:
    * 🌟 **Híbrido 3:1** (Pantalla principal grande 3/4 a la izquierda y pantalla táctil 1/4 a la derecha).
    * 📱 **Vertical Clásica** (Nintendo DS real apilada 1:1).
    * 🖥️ **Horizontal** (Lado a lado 1:1).
    * 👆 **Híbrido Táctil** (Táctil grande 3/4 a la izquierda).
    * 🔲 **Solo Superior** (Pantalla completa).
  * Lanzador web con soporte drag-and-drop y selector de archivos locales `.nds`.

* **Auto-Hospedaje Local Offline (Para Redes Restringidas y Escolares)**:
  * Todos los núcleos (`mgba-wasm.data`, `desmume-wasm.data`), scripts de ejecución y estilos están alojados localmente en `public/emulator/data/`.
  * Cero dependencias de CDNs externas (`cdn.emulatorjs.org`), garantizando funcionamiento en institutos y redes con cortafuegos.

* **Descubrimiento Automático de ROMs**:
  * Script CLI (`scripts/generate-rom-manifest.mjs`) que escanea `public/roms/` y genera `src/data/roms-manifest.json` en tiempo de compilación.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (Turbopack, App Router) | Renderizado estático, rutas dinámicas y rendimiento |
| **Lenguaje** | TypeScript 5 | Tipado estricto en catálogo, plataformas y componentes |
| **Estilos** | Tailwind CSS v4 | Diseño responsive y estética gaming oscura |
| **Emulación** | EmulatorJS + Libretro WebAssembly | Motores mGBA y DeSmuME 100% en cliente |
| **Iconografía** | Lucide React | Iconos de hardware y controles |
| **Despliegue** | Vercel Ready | Preparado para despliegue con 1 clic |

---

## 🚀 Despliegue en Vercel

Este proyecto está preparado para desplegarse en **Vercel** de forma directa:

1. Ve a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. Pulsa en **"Add New Project"** e importa el repositorio `HazardCharlyX/DAWGaming`.
3. Vercel detectará automáticamente **Next.js**:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (ejecuta automáticamente `generate:roms` antes de compilar)
   - **Output Directory**: `.next`
4. Pulsa **Deploy**. En menos de 2 minutos tu portal estará disponible en la web.

---

## 💻 Desarrollo Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/HazardCharlyX/DAWGaming.git
cd DAWGaming

# 2. Instalar dependencias
npm install

# 3. Generar manifiesto de ROMs
npm run generate:roms

# 4. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 👤 Autor

* **Hazard (Carlos J Samper)** — 2º DAW, IES Álvaro Falomir.
* Desarrollado con ayuda de **Gemini 3.8 Flash**.
