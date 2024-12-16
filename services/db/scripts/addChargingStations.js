import { readFile, writeFile } from 'fs';
import { path } from 'path';

// Define the source file path
const sourceFilePath = path.join(__dirname, 'data', 'avec_map_data.json');

// Define the output file path
const outputFilePath = path.join(__dirname, 'output.json');

// Read the source file
fs.readFile(sourceFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading source file:', err);
    return;
  }

  // Parse the JSON data
  let sourceData;
  try {
    sourceData = JSON.parse(data);
  } catch (parseErr) {
    console.error('Error parsing JSON:', parseErr);
    return;
  }

  // Function to extract and reformat features
  function extractFeatures(data) {
    return data.features
      .filter(feature => feature.properties.name.startsWith("c0"))
      .map(feature => ({
        geometry: feature.geometry,
        plugs: [
          { id: 1, available: true },
          { id: 2, available: true },
          { id: 3, available: true }
        ]
      }));
  }

  // Perform the extraction and reformatting
  const formattedFeatures = extractAndReformatFeatures(sourceData);

  // Write to the output file
  fs.writeFile(outputFilePath, JSON.stringify(formattedFeatures, null, 2), (writeErr) => {
    if (writeErr) {
      console.error('Error writing to output file:', writeErr);
    } else {
      console.log(`File successfully written to ${outputFilePath}`);
    }
  });
});