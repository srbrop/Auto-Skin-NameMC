# AutoSkinNameMC
Una utilidad automatizada para subir skins de Minecraft en lote y forzar la actualización del perfil de NameMC. Diseñada específicamente para generar mosaicos 'Skins Arts' sin fisuras en tu perfil.
# AutoNameMC.js 👕🔄

Este proyecto es un *script* de automatización de código abierto (*Open Source*) diseñado para creadores de contenido y coleccionistas de Minecraft. Permite subir de forma secuencial y ordenada un lote exacto de **27 skins** a tu perfil oficial de Minecraft, forzando simultáneamente la actualización de tu historial en **NameMC** mediante el control remoto de tu navegador.

El script fue creado como la herramienta compañera perfecta para [**SkinsArts Studio**](https://srbrop.github.io/SkinsArts-Studio/), permitiendo generar mosaicos de "Skins Arts" en tu perfil sin fisuras. Está optimizado matemáticamente para subir las skins en **orden inverso** (`c(9)` hasta `a(1)`) y cuenta con un sistema inteligente anti-bloqueos (*Rate Limiting*) para asegurar que ninguna pieza del mosaico falte por culpa de la saturación en los servidores de Microsoft.

---

## 🛑 REQUISITO CRÍTICO DE ENTORNO

Para garantizar la estabilidad de `AutoNameMC.js` y evitar bloqueos de permisos o congelamientos de red, **debes alojar el archivo en una carpeta estrictamente fuera de entornos de nube (como OneDrive, Google Drive o Dropbox)**. Se recomienda crear una carpeta local tradicional en tu Disco `C://` o en tu Escritorio (siempre que no esté sincronizado).

---

## 🛠️ Guía de Instalación Paso a Paso

### Paso 1: Instalar Node.js
1. Descarga e instala la versión recomendada (LTS) desde el sitio web oficial: [nodejs.org](https://nodejs.org/).
2. Sigue el asistente de instalación de Windows dejando todas las opciones por defecto.
3. **Cierra por completo todas las ventanas o instaladores una vez finalizado el proceso.**

### Paso 2: Preparar tu carpeta de trabajo
1. Genera y descarga tu lote de 27 skins en formato `.zip` desde la aplicación web oficial: [**SkinsArts Studio**](https://srbrop.github.io/SkinsArts-Studio/). Extrae las imágenes.
2. Crea una **nueva carpeta local** en tu computadora con el nombre que tú quieras.
3. Descarga el archivo `AutoNameMC.js` de este repositorio y mételo en esa nueva carpeta.
4. Mueve las **27 imágenes de skins** al interior de esta misma carpeta (junto al archivo `.js`). Las imágenes ya deben venir con el formato correcto de SkinsArts Studio:
   - **Bloque C:** `c(9).png`, `c(8).png` ... hasta `c(1).png`
   - **Bloque B:** `b(9).png`, `b(8).png` ... hasta `b(1).png`
   - **Bloque A:** `a(9).png`, `a(8).png` ... hasta `a(1).png`

### Paso 3: Instalar Dependencias mediante CMD
1. Entra a la carpeta que creaste (donde ahora tienes el `.js` y tus skins).
2. Haz un clic izquierdo en la **barra de direcciones** superior de la ventana del Explorador de archivos (donde sale la ruta de la carpeta) para que se ponga en azul, escribe `cmd` y presiona la tecla **Enter**.
3. En la ventana negra de la consola (CMD) que se acaba de abrir, ejecuta el siguiente comando para generar el entorno:
   ```bash
   npm init -y
   ```
   
### A continuación, instala el núcleo de automatización (Puppeteer) ejecutando:
   ```bash
   npm install puppeteer
```
(Espera pacientemente a que finalice la descarga del navegador interno y vuelva a aparecer la línea de comandos de tu ruta).

### 🌐 Configuración del Navegador (Modo Debugger)
Para evitar captchas de inicio de sesión, AutoNameMC.js se conectará de forma segura a tu navegador de uso diario. Elige tu navegador y configúralo siguiendo estos pasos:

1. Cierra por completo todas las ventanas que tengas abiertas de tu navegador elegido.

2. Presiona la combinación de teclas Windows + R en tu teclado para abrir la ventana del sistema "Ejecutar".

3. Copia y pega el comando correspondiente al navegador que desees utilizar y dale al botón de Aceptar:

### 🌐 Selección de Navegador

*   🦁 **Si usas Brave (Recomendado):**
    ```bash
    "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe" --remote-debugging-port=9222
    ```

*   🔵 **Si usas Google Chrome:**
    ```bash
    "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
    ```

*   🌊 **Si usas Microsoft Edge:**
    ```bash
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --remote-debugging-port=9222
    ```
4. En la ventana del navegador que se acaba de abrir, prepara las siguientes dos pestañas:
   * Pestaña 1: Entra a [**Minecraft.net**](https://www.minecraft.net/msaprofile/mygames/editskin), , inicia tu sesión con tu cuenta de Microsoft y posiciónate en la pantalla de "Cambiar aspecto" (donde aparece el botón verde para subir archivos).
   * Pestaña 2: Abre tu perfil público de NameMC (e.g., https://es.namemc.com/profile/TuUsuario).
### ⚡ Ejecución del Script
Una vez que todo el entorno del navegador y tu carpeta estén preparados:
1. Regresa a la ventana negra del CMD posicionada en tu carpeta de trabajo.

2. Ejecuta el comando de inicio para despertar al bot:
  ```bash
node AutoNameMC.js
```
3. Suelta el ratón y el teclado por completo. El script tomará el control del navegador configurado y empezará a realizar la secuencia de forma automática.
### ⏱️ Comportamiento del proceso:
   * El script tarda un aproximado de 17 segundos netos por skin (Carga ➡️ Clic ➡️ Escritura en servidores ➡️ F5 automático en NameMC ➡️ 15 segundos de enfriamiento).

   * El mosaico completo de 27 skins finalizará en un tiempo estimado de 7 a 8 minutos.

   * Escudo anti-errores: Si el servidor de Minecraft se satura y rechaza una skin en específico, el bot detendrá el avance, recargará la página, aplicará una espera de 15 segundos de castigo y volverá a intentar subir la misma skin desde cero. No avanzará a NameMC ni a la siguiente imagen hasta asegurar que la actual quedó registrada de forma impecable en tu historial.

### ❤️ Apoya el Proyecto
Este script fue desarrollado con dedicación para expandir las capacidades artísticas de la comunidad de Minecraft. Si esta extensión automatizada te ahorró tiempo y configuró tu perfil a la perfección, ¡apoya nuestro ecosistema de herramientas!

---

## 🧰 Más herramientas (Ecosistema SkinsArts)

- 🎨 **[SkinsArts-Studio](https://github.com/srbrop/SkinsArts-Studio):** Si quieres generar, editar y previsualizar fácilmente artes de 27 piezas de Minecraft para NameMC, ¡utiliza esta poderosa suite web! *(Nota: Repositorio en inglés)*
- 📸 **[NameMC-Capture-Profile](https://github.com/srbrop/NameMC-Capture-Profile):** Si quieres capturar tu perfil de NameMC en una imagen de alta resolución, ¡utiliza esta herramienta!

---

### 🌟  Deja una estrella en este repositorio de GitHub.

### 👉  **[Sigueme ArmandoLZ (Sonrojado) en NameMC](https://namemc.com/profile/Sonrojado)**
