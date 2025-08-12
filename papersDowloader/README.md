Guía de Uso - Descargador de Artículos Académicos

📋 Descripción
Este proyecto permite descargar automáticamente artículos académicos en formato PDF desde Unpaywall utilizando sus DOIs (Digital Object Identifiers). El script procesa múltiples artículos y sus trabajos relacionados de forma organizada.

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

2. Configuración del email
IMPORTANTE: Abre el archivo downloader.js y cambia la constante YOUR_EMAIL por tu email institucional real:
const YOUR_EMAIL = 'tu.email@universidad.edu';

⚠️ Nota: Unpaywall requiere un email válido para usar su API.


📄 Creación del archivo references.json
Copia el archivo resultante de la ejecución del proyecto "snowballingReview" llamado references.json en la raíz del proyecto

▶️ Ejecución del Script
1. Ejecutar desde terminal
node downloader.js

🤝 Consejos de Uso
Rate Limiting: El script respeta las limitaciones de la API (1 segundo entre requests)
Batch Processing: Procesa artículos en grupos para mejor organización
Reanudación: Los archivos ya descargados se omiten automáticamente
Metadatos: Se guardan archivos JSON con información adicional de cada PDF
Email Válido: Usa tu email institucional para mejores resultados

