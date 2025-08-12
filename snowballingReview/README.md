Guía de Uso - Proyecto OpenAlex Research

📋 Descripción
Este proyecto automatiza la búsqueda de trabajos académicos relacionados utilizando la API de OpenAlex. Toma una lista de DOIs (Digital Object Identifiers) desde un archivo Excel y encuentra artículos científicos relacionados con cada uno.

🚀 Prerrequisitos
1. Instalación de Node.js
Descarga e instala Node.js desde nodejs.org
Versión recomendada: v16 o superior
Verifica la instalación ejecutando en terminal:
    node --version
    npm --version

📁 Configuración del Proyecto
1. Instalación de dependencias
Abrí una terminal en la carpeta del proyecto y ejecuta:
npm i

2. Preparación de Datos
Guardar el archivo excel dentro de la carpeta data con el siguiente formato: lens-results.xlsx
Es requerimiento que el archivo excel tenga la columna “DOI” (ya viene con el excel exportado desde LENS) y la columna “Selected by title” cuyos valores deben ser una x o X, como en la siguiente imagen:
https://drive.google.com/file/d/1AFJ96P-dd22jeiU_C1Yq1jGHzDidh74z/view?usp=sharing

▶️ Ejecución del Script
1. Ejecutar desde terminal
node src/index.js



