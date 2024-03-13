const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const resizeImagesInFolders = async (baseFolderPath, outputPath, widths) => {
  // Read all directories in the base folder path
  const directories = fs.readdirSync(baseFolderPath, { withFileTypes: true })
                         .filter(dirent => dirent.isDirectory())
                         .map(dirent => dirent.name);

  for (const directory of directories) {
    const directoryPath = path.join(baseFolderPath, directory);

    // Read all files in the current directory
    const files = fs.readdirSync(directoryPath, { withFileTypes: true })
                    .filter(dirent => dirent.isFile())
                    .map(dirent => dirent.name);

    for (const file of files) {
      const inputFilePath = path.join(directoryPath, file);
      // Create a folder specifically for this image
      const imageFolderPath = path.join(outputPath, directory, path.parse(file).name);

      for (const width of widths) {
        const outputFileName = `${width}.webp`; // New filename based on width
        const outputFilePath = path.join(imageFolderPath, outputFileName);

        // Ensure the output directory for this image exists
        fs.mkdirSync(imageFolderPath, { recursive: true });

        try {
          // Load the input image, resize, convert to WebP, and save
          await sharp(inputFilePath)
            .resize({ width: width, fit: 'inside' })
            .toFormat('webp')
            .webp({ lossless: true })
            .toFile(outputFilePath);

          // console.log(`Image ${file} processed and saved in ${imageFolderPath} as ${outputFileName}`);
        } catch (error) {
          console.error(`Error processing image ${file}:`, error);
        }
      }
    }
  }
};

// Example usage
const baseFolderPath = './Images'; // Path to the base folder containing subfolders with images
const outputPath = './OutputImages'; // Path where the resized images will be saved in their specific folders
const desiredWidths = [300, 228, 174, 132, 100]; // Array of desired widths in pixels

resizeImagesInFolders(baseFolderPath, outputPath, desiredWidths);
