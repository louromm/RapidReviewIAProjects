const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sanitize = require('sanitize-filename');

const JSON_FILE = './references.json';
const DOWNLOAD_FOLDER = './downloads';
const DELAY_MS = 1000; // Rate limiting: 1 segundo entre requests
const YOUR_EMAIL = 'tuemail@gmail.com';

// Crear carpeta de descargas si no existe
if (!fs.existsSync(DOWNLOAD_FOLDER)) {
  fs.mkdirSync(DOWNLOAD_FOLDER, { recursive: true });
}

// Función para validar formato DOI
const isValidDOI = (doi) => {
  const doiRegex = /^10\.\d{4,}\/[-._;()\/:a-zA-Z0-9]+$/;
  return doiRegex.test(doi);
};

// Función para limpiar DOI (remover prefijos)
const cleanDOI = (doi) => {
  if (!doi) return null;
  return doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, '').trim();
};

// Función para esperar (rate limiting)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Leer referencias del archivo JSON
const readReferences = () => {
  try {
    if (!fs.existsSync(JSON_FILE)) {
      throw new Error(`Archivo ${JSON_FILE} no encontrado`);
    }
    return JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));
  } catch (error) {
    console.error(`❌ Error al leer ${JSON_FILE}:`, error.message);
    process.exit(1);
  }
};

// Consultar PDF en Unpaywall
const getPDFLinkFromUnpaywall = async (doi) => {
  const cleanedDOI = cleanDOI(doi);
  
  if (!cleanedDOI || !isValidDOI(cleanedDOI)) {
    console.warn(`⚠️  DOI inválido: ${doi}`);
    return null;
  }

  try {
    console.log(`🔍 Consultando Unpaywall para: ${cleanedDOI}`);
    const response = await axios.get(
      `https://api.unpaywall.org/v2/${cleanedDOI}?email=${YOUR_EMAIL}`,
      { timeout: 10000 }
    );
    
    const pdfUrl = response.data?.best_oa_location?.url_for_pdf;
    if (pdfUrl) {
      console.log(`✅ PDF encontrado en Unpaywall: ${cleanedDOI}`);
      return pdfUrl;
    } else {
      console.log(`🔒 PDF no disponible en acceso abierto: ${cleanedDOI}`);
      return null;
    }
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn(`❌ DOI no encontrado en Unpaywall: ${cleanedDOI}`);
    } else {
      console.warn(`❌ Error al consultar Unpaywall para ${cleanedDOI}:`, error.message);
    }
    return null;
  }
};

// Verificar si archivo ya existe
const fileExists = (filename) => {
  const filePath = path.join(DOWNLOAD_FOLDER, sanitize(filename) + '.pdf');
  return fs.existsSync(filePath);
};

// Descargar PDF
const downloadPDF = async (url, filename, metadata = {}) => {
  const sanitizedFilename = sanitize(filename);
  const filePath = path.join(DOWNLOAD_FOLDER, sanitizedFilename + '.pdf');
  
  // Verificar si ya existe
  if (fileExists(sanitizedFilename)) {
    console.log(`⏭️  Archivo ya existe: ${sanitizedFilename}.pdf`);
    return true;
  }

  try {
    console.log(`⬇️  Descargando: ${sanitizedFilename}.pdf`);
    const response = await axios.get(url, { 
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'User-Agent': 'Academic Research Tool (mailto:' + YOUR_EMAIL + ')'
      }
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`✅ PDF guardado: ${sanitizedFilename}.pdf`);
        // Guardar metadatos si se proporcionan
        if (Object.keys(metadata).length > 0) {
          const metadataPath = path.join(DOWNLOAD_FOLDER, sanitizedFilename + '_metadata.json');
          fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
        }
        resolve();
      });
      writer.on('error', reject);
    });

    return true;
  } catch (error) {
    console.error(`❌ Error al descargar desde ${url}:`, error.message);
    // Limpiar archivo parcial si existe
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return false;
  }
};

// Generar nombre de archivo basado en metadatos
const generateFilename = (metadata, isMain = false) => {
  let title, authors, year, doi;
  
  title = metadata.title || 'Sin_titulo';
  authors = metadata.authors?.[0] || 'Sin_autor';
  year = metadata.year || new Date().getFullYear();
  doi = metadata.doi || 'sin_doi';

  // Extraer ID corto del DOI para identificación
  const doiId = doi.split('/').pop()?.slice(0, 8) || 'unknown';
  
  // Limpiar título de etiquetas HTML y caracteres especiales
  const cleanTitle = title
    .replace(/<[^>]*>/g, '')
    .replace(/[^\w\s-]/g, '')
    .slice(0, 40)
    .trim()
    .replace(/\s+/g, '_');

  const cleanAuthor = authors
    .replace(/[^\w\s]/g, '')
    .slice(0, 15)
    .trim()
    .replace(/\s+/g, '_');

  const prefix = isMain ? 'MAIN' : 'REL';
  
  return `${year}_${prefix}_${cleanAuthor}_${cleanTitle}_${doiId}`;
};

// Procesar un artículo y sus trabajos relacionados
const processArticleEntry = async (entry, entryIndex, totalEntries) => {
  console.log(`\n📄 Procesando grupo ${entryIndex + 1}/${totalEntries}...`);
  
  const allDOIs = [];
  
  // Agregar DOI principal si existe
  if (entry.doi) {
    allDOIs.push({
      doi: entry.doi,
      isMain: true,
      metadata: {
        doi: entry.doi,
        title: `Artículo principal - ${entry.doi}`,
        source: 'main_entry'
      }
    });
  }

  // Agregar DOIs de trabajos relacionados
  if (entry.relatedWorks && Array.isArray(entry.relatedWorks)) {
    entry.relatedWorks.forEach(work => {
      if (work.doi) {
        allDOIs.push({
          doi: work.doi,
          isMain: false,
          metadata: work
        });
      }
    });
  }

  console.log(`📊 Total de DOIs en este grupo: ${allDOIs.length}`);

  let successCount = 0;
  let errorCount = 0;

  for (const [index, doiEntry] of allDOIs.entries()) {
    console.log(`\n🔄 Procesando DOI ${index + 1}/${allDOIs.length} del grupo ${entryIndex + 1}...`);
    
    const pdfLink = await getPDFLinkFromUnpaywall(doiEntry.doi);
    
    if (pdfLink) {
      const filename = generateFilename(doiEntry.metadata, doiEntry.isMain);
      
      const metadata = {
        doi: doiEntry.doi,
        url: pdfLink,
        isMainArticle: doiEntry.isMain,
        downloadDate: new Date().toISOString(),
        groupIndex: entryIndex,
        ...doiEntry.metadata
      };

      const success = await downloadPDF(pdfLink, filename, metadata);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
    } else {
      console.log(`🔍 PDF no encontrado para: ${doiEntry.doi}`);
      errorCount++;
    }

    // Rate limiting - esperar entre requests
    if (index < allDOIs.length - 1) {
      console.log(`⏱️  Esperando ${DELAY_MS}ms...`);
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n📈 Resumen del grupo ${entryIndex + 1}: ${successCount} exitosos, ${errorCount} fallidos`);
  return { successCount, errorCount };
};

// Procesar todas las entradas del array JSON
const processAllArticles = async (data) => {
  if (!Array.isArray(data)) {
    throw new Error('El archivo JSON debe contener un array de artículos');
  }

  console.log(`\n🎯 Total de grupos de artículos a procesar: ${data.length}`);
  
  let totalSuccess = 0;
  let totalErrors = 0;

  for (const [index, entry] of data.entries()) {
    const result = await processArticleEntry(entry, index, data.length);
    totalSuccess += result.successCount;
    totalErrors += result.errorCount;

    // Pausa entre grupos de artículos
    if (index < data.length - 1) {
      console.log(`\n⏸️  Pausa entre grupos (${DELAY_MS * 2}ms)...`);
      await sleep(DELAY_MS * 2);
    }
  }

  return { totalSuccess, totalErrors };
};

// Función principal
const run = async () => {
  console.log('🚀 Iniciando descarga de artículos académicos...\n');
  
  // Verificar email válido
  if (YOUR_EMAIL === 'tu.email@universidad.edu') {
    console.error('❌ IMPORTANTE: Debes cambiar YOUR_EMAIL por tu email institucional real');
    console.error('   Unpaywall requiere un email válido para su uso.');
    process.exit(1);
  }

  try {
    const data = readReferences();
    
    // Verificar estructura del JSON
    if (!Array.isArray(data)) {
      throw new Error('El archivo JSON debe contener un array de artículos');
    }

    console.log(`📚 Cargando ${data.length} grupos de artículos desde ${JSON_FILE}`);

    const startTime = Date.now();
    const result = await processAllArticles(data);
    const endTime = Date.now();
    
    console.log('\n🎉 Proceso completado!');
    console.log(`⏱️  Tiempo total: ${((endTime - startTime) / 1000).toFixed(2)} segundos`);
    console.log(`📁 Archivos guardados en: ${path.resolve(DOWNLOAD_FOLDER)}`);
    console.log(`✅ Descargas exitosas: ${result.totalSuccess}`);
    console.log(`❌ Errores: ${result.totalErrors}`);
    console.log(`📊 Tasa de éxito: ${((result.totalSuccess / (result.totalSuccess + result.totalErrors)) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('\n💥 Error fatal:', error.message);
    process.exit(1);
  }
};

// Ejecutar solo si es el archivo principal
if (require.main === module) {
  run().catch(error => {
    console.error('💥 Error no manejado:', error);
    process.exit(1);
  });
}

module.exports = {
  readReferences,
  getPDFLinkFromUnpaywall,
  downloadPDF,
  processArticleEntry,
  processAllArticles,
  run
};