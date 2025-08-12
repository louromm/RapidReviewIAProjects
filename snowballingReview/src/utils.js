const xlsx = require('xlsx');
const path = require('path');

const readDoisFromExcel = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(worksheet);

  const dois = jsonData
    .filter(row => {
      // Asegura que la columna "Selected by title" tenga una "x" o "X"
      const selected = row['Selected by title'];
      return selected && selected.toString().toLowerCase() === 'x';
    })
    .map(row => {
      // Busca el DOI específicamente en la columna "DOI"
      const doi = row['DOI'];
      return doi && typeof doi === 'string' ? doi.trim() : null;
    })
    .filter(Boolean);

  return dois;
};

module.exports = { readDoisFromExcel };