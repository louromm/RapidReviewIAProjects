const axios = require('axios');

const BASE_URL = 'https://api.openalex.org/works?filter=doi:';

const fetchRelatedWorks = async (doi) => {
  try {
    const response = await axios.get(`${BASE_URL}${encodeURIComponent(doi)}`);
    return response.data.results || [];
  } catch (error) {
    console.error(`Error fetching DOI ${doi}:`, error.message);
    return [];
  }
};

module.exports = { fetchRelatedWorks };
