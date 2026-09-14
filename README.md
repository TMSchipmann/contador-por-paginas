# Contador por páginas

App estática lista para GitHub Pages. Usa solo `index.html`, `style.css` y `app.js`; no necesita instalación, servidor, cuenta ni base de datos.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub y coloca los cuatro archivos de esta carpeta en la raíz del repositorio.
2. En **Settings → Pages**, elige **Deploy from a branch**, la rama `main` y la carpeta `/ (root)`.
3. Guarda la configuración y abre la dirección que GitHub Pages indique.

También puedes colocar los archivos en una carpeta `docs` y elegir `/docs` en Pages. Los enlaces entre archivos son relativos, así que funcionan en repositorios de proyecto y en dominios propios.

## Uso

Configura la cantidad de páginas, valor inicial, dirección, paso, meta de toques y color antes de comenzar. Al elegir **Retroceder**, el valor inicial predeterminado pasa a ser la cantidad de páginas: con 50 páginas, la primera parte en 50 y la siguiente en 49. Puedes escribir otro valor inicial si lo prefieres. Cada página es un contador independiente. Su valor inicial se calcula así: `valor inicial ± (número de página − 1) × paso`. Por ejemplo, con 150 páginas, inicio 150, paso 1 y dirección descendente, las páginas 1, 2 y 3 parten en 150, 149 y 148.

El botón grande y el círculo cuentan en la dirección seleccionada. El botón pequeño cuenta en sentido contrario. La meta de toques controla el anillo de progreso de **cada página** y no detiene el conteo al llegar a ella. `Deshacer` revierte el último cambio de la página actual, incluido un reinicio. `Reiniciar` vuelve al valor inicial de esa página.

Atajos: `+`, `=` o espacio para avanzar; `-` para contar en sentido contrario; flechas izquierda y derecha para cambiar de página; `Z` para deshacer. La opción **Ir a página** permite saltar directamente a cualquier página.

La sesión se guarda automáticamente en `localStorage` de ese navegador. Al volver, pulsa **Continuar**. Empezar una sesión nueva reemplaza la anterior tras confirmación. Los datos no se sincronizan entre dispositivos ni entre navegadores. No existe un límite programado de páginas o valores; el límite práctico es la capacidad del dispositivo y de su almacenamiento local. Solo se guardan las páginas modificadas, por lo que configurar muchas páginas no genera una lista enorme de entrada.
