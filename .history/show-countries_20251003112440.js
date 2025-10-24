/**
 * Display all country names in English
 * 
 * This script reads the allCountries.json file and displays all country names in English
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the countries JSON file
const countriesFilePath = path.join(__dirname, 'src', 'assets', 'allCountries.json');

try {
  // Read and parse the JSON file
  const countriesData = JSON.parse(fs.readFileSync(countriesFilePath, 'utf8'));
  
  // Get all country names (keys of the object)
  const countryNames = Object.keys(countriesData);
  
  console.log('===================================');
  console.log('All Countries (English Names)');
  console.log('===================================');
  
  // Display all country names with numbering
  countryNames.forEach((name, index) => {
    console.log(`${index + 1}. ${name}`);
  });
  
  console.log('===================================');
  console.log(`Total: ${countryNames.length} countries`);
  console.log('===================================');
  
} catch (error) {
  console.error('Error reading countries data:', error.message);
}