Guía de Uso - Proyecto OpenAlex Research

📋 Descripción
 <br>Este proyecto automatiza la búsqueda de trabajos académicos relacionados utilizando la API de OpenAlex. Toma una lista de DOIs (Digital Object Identifiers) desde un archivo Excel y encuentra artículos científicos relacionados con cada uno.

🚀 Prerrequisitos
1. Instalación de Node.js
 <br>Descarga e instala Node.js desde nodejs.org - Versión recomendada: v16 o superior
 <br>Verifica la instalación ejecutando en terminal:
 <br>node --version
 <br>npm --version

📁 Configuración del Proyecto
1. Instalación de dependencias
 <br>Abrí una terminal en la carpeta del proyecto y ejecuta:
 <br>npm i

2. Preparación de Datos
 <br>Guardar el archivo excel dentro de la carpeta data con el siguiente formato: lens-results.xlsx
 <br>Es requerimiento que el archivo excel tenga la columna “DOI” (ya viene con el excel exportado desde LENS) y la columna “Selected by title” cuyos valores deben ser x o X, como en la siguiente imagen:
https://drive.google.com/file/d/1AFJ96P-dd22jeiU_C1Yq1jGHzDidh74z/view?usp=sharing

▶️ Ejecución del Script
1. Ejecutar desde la terminal
 <br>node src/index.js



