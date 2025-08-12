const fs = require('fs');
const path = require('path');
const { readDoisFromExcel } = require('./utils');
const { fetchRelatedWorks } = require('./openalex');

const inputFile = path.join(__dirname, '..', 'data', 'lens-results.xlsx');
const outputFile = path.join(__dirname, '..', 'data', 'related-papers.json');

const delay = ms => new Promise(res => setTimeout(res, ms));

const main = async () => {
  const dois = readDoisFromExcel(inputFile);
  console.log(`📄 Se encontraron ${dois.length} DOIs`);

  const allResults = [];

  for (const doi of dois) {
    console.log(`🔍 Consultando OpenAlex para DOI: ${doi}`);
    const related = await fetchRelatedWorks(doi);

    allResults.push({
      doi,
      relatedWorks: related.map(work => ({
        title: work.title,
        doi: work.doi,
        id: work.id,
        authors: work.authorships?.map(a => a.author.display_name)
      }))
    });

    await delay(500); // Para evitar rate limiting
  }

  fs.writeFileSync(outputFile, JSON.stringify(allResults, null, 2));
  console.log(`✅ Resultados guardados en: ${outputFile}`);
};

main();
