const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const {
  determineSingleLayout,
  createMultiLayoutImagesWithItemIds,
  categorizeImages,
  createImageFromLayout
} = require('./resizeImagesHelpers');




async function processImages(folderPath, outputFolderPath) {

  const files = await fs.readdir(folderPath);

  // Process each file in the folder
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) continue; // Skip directories

    const layout = await determineSingleLayout(filePath);
    const fileName = path.basename(filePath, path.extname(filePath)) + '_processed.png';
    const outputPath = path.join(outputFolderPath, fileName);

    await createImageFromLayout(layout, outputPath);
  }

  // Create multi-layout images from categorized paths

}

async function categorizeAndCreateLayoutsFromFolder(sourceFolderPath, outputFolderPath, itemFolderMappings) {
  // Step 1: Categorize images

  const categories = await categorizeImages(sourceFolderPath);

  // Ensure the output directory exists
  try {
    await fs.access(outputFolderPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Directory does not exist, create it
      await fs.mkdir(outputFolderPath, { recursive: true });
      // (`Created output directory: ${outputFolderPath}`);
    } else {
      throw error;
    }
  }

  // Step 2: Create multi-layout images based on the categorized images
  // Now calling the modified function that includes item ID mapping
  const layoutResults = await createMultiLayoutImagesWithItemIds(categories, outputFolderPath, itemFolderMappings);
  // Optionally, you can do something with layoutResults here, such as logging or further processing
  return layoutResults;
}


async function processFoldersInImages(sourceBaseFolderPath, destinationBaseFolderPath) {
  // No longer hardcoding paths, using the function parameters instead
  const sourceFolders = await fs.readdir(sourceBaseFolderPath);

  for (const folderName of sourceFolders) {
    const folderPath = path.join(sourceBaseFolderPath, folderName);
    const stat = await fs.stat(folderPath);
    if (!stat.isDirectory()) continue; // Skip files, process only directories

    const outputFolderPath = path.join(destinationBaseFolderPath, folderName, "Images");
    (`Processing ${folderName}...`);
    await processImages(folderPath, outputFolderPath); // Assuming processImages is defined elsewhere
  }
   ('All folders processed successfully.');
}


// Assuming all the required imports and function definitions are above

module.exports = {
  processImages,
  categorizeAndCreateLayoutsFromFolder,
  processFoldersInImages
};
