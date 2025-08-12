Guía de Uso - Descargador de Artículos Académicos

📋 Descripción
 <br>Este proyecto permite descargar automáticamente artículos académicos en formato PDF desde Unpaywall utilizando sus DOIs (Digital Object Identifiers). El script procesa múltiples artículos y sus trabajos relacionados de forma organizada.

🚀 Prerrequisitos
1. Instalación de Node.js
 <br>Descarga e instala Node.js desde nodejs.org
 <br>Versión recomendada: v16 o superior
 <br>Verifica la instalación ejecutando en terminal:
 <br>node --version
 <br>npm --version

📁 Configuración del Proyecto
1. Instalación de dependencias
 <br>Abrí una terminal en la carpeta del proyecto y ejecuta:
 <br>npm i

2. Configuración del email
 <br>IMPORTANTE: Abre el archivo downloader.js y cambia la constante YOUR_EMAIL por tu email institucional real:
 <br>const YOUR_EMAIL = 'tu.email@universidad.edu';

 <br>⚠️ Nota: Unpaywall requiere un email válido para usar su API.


📄 Creación del archivo references.json
 <br>Copia el archivo resultante de la ejecución del proyecto "snowballingReview" llamado references.json en la raíz del proyecto

▶️ Ejecución del Script
1. Ejecutar desde terminal
 <br>node downloader.js

🤝 Consejos de Uso
* Rate Limiting: El script respeta las limitaciones de la API (1 segundo entre requests)
* Reanudación: Los archivos ya descargados se omiten automáticamente
* Metadatos: Se guardan archivos JSON con información adicional de cada PDF

