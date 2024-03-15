const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const resizeImagesInFoldersWebp = async (baseFolderPath, outputPath, widths) => {
  const processDirectory = async (directoryPath, outputBasePath) => {
    const files = fs.readdirSync(directoryPath, { withFileTypes: true })
                    .filter(dirent => dirent.isFile())
                    .map(dirent => dirent.name);

    for (const file of files) {
      const inputFilePath = path.join(directoryPath, file);
      // Assume the image name is a directory name in the outputPath

      for (const width of widths) {
        const imageFolderPath = path.join(outputBasePath, path.parse(file).name,`${width}`);
        const outputFileName = `${path.parse(file).name}.webp`; // New filename based on width
        const outputFilePath = path.join(imageFolderPath, outputFileName);
        fs.mkdirSync(imageFolderPath, { recursive: true }); // Ensure the output directory exists

        try {
          await sharp(inputFilePath)
            .resize({ width: width, fit: 'inside' })
            .toFormat('webp')
            .webp({ quality: 10 })
            .toFile(outputFilePath);
        } catch (error) {
          console.error(`Error processing image ${file}:`, error);
        }
      }
    }
  };

  // Check if baseFolderPath is a directory of images or directories
  if (fs.statSync(baseFolderPath).isFile()) {
    console.error('Expected a directory, but got a file. Please provide a directory path.');
    return;
  }

  const entries = fs.readdirSync(baseFolderPath, { withFileTypes: true });
  if (entries.some(entry => entry.isFile())) {
    // If there are files directly under baseFolderPath, process this directory
    await processDirectory(baseFolderPath, outputPath);
  } else if (entries.some(entry => entry.isDirectory())) {
    // If there are directories under baseFolderPath, process each directory
    for (const dirent of entries.filter(dirent => dirent.isDirectory())) {
      const directoryPath = path.join(baseFolderPath, dirent.name);
      await processDirectory(directoryPath, path.join(outputPath, dirent.name));
    }
  }
};

const resizeImagesInFoldersPng = async (baseFolderPath, outputPath, widths) => {
  const processDirectory = async (directoryPath, outputBasePath) => {
    const files = fs.readdirSync(directoryPath, { withFileTypes: true })
                    .filter(dirent => dirent.isFile())
                    .map(dirent => dirent.name);

    for (const file of files) {
      const inputFilePath = path.join(directoryPath, file);
      // Assume the image name is a directory name in the outputPath


      for (const width of widths) {
        const imageFolderPath = path.join(outputBasePath, path.parse(file).name,`${width}`);
        const outputFileName = `${path.parse(file).name}.png`; // New filename based on width
        const outputFilePath = path.join(imageFolderPath, outputFileName);
        fs.mkdirSync(imageFolderPath, { recursive: true }); // Ensure the output directory exists

        try {
          await sharp(inputFilePath)
            .resize({ width: width, fit: 'inside' })
            .png({ compressionLevel: 0, progressive: true, palette: true })
            .toFile(outputFilePath);
        } catch (error) {
          console.error(`Error processing image ${file}:`, error);
        }
      }
    }
  };

  // Check if baseFolderPath is a directory of images or directories
  if (fs.statSync(baseFolderPath).isFile()) {
    console.error('Expected a directory, but got a file. Please provide a directory path.');
    return;
  }

  const entries = fs.readdirSync(baseFolderPath, { withFileTypes: true });
  if (entries.some(entry => entry.isFile())) {
    // If there are files directly under baseFolderPath, process this directory
    await processDirectory(baseFolderPath, outputPath);
  } else if (entries.some(entry => entry.isDirectory())) {
    // If there are directories under baseFolderPath, process each directory
    for (const dirent of entries.filter(dirent => dirent.isDirectory())) {
      const directoryPath = path.join(baseFolderPath, dirent.name);
      await processDirectory(directoryPath, path.join(outputPath, dirent.name));
    }
  }
};

const SquareImagesInFoldersWebp = async (baseFolderPath, outputPath, dimensions) => {
  // Helper function to process a single directory
  const processDirectory = async (directoryPath, outputBasePath) => {
    const files = fs.readdirSync(directoryPath, { withFileTypes: true })
                    .filter(dirent => dirent.isFile())
                    .map(dirent => dirent.name);

    for (const file of files) {
      const inputFilePath = path.join(directoryPath, file);

      for (const dimension of dimensions) {
        const imageFolderPath = path.join(outputBasePath, path.parse(file).name,  `${dimension.width}x${dimension.height}`);
        const outputFileName = `${path.parse(file).name}.webp`; // New filename based on width
        const outputFilePath = path.join(imageFolderPath, outputFileName);
        fs.mkdirSync(imageFolderPath, { recursive: true }); // Ensure the output directory exists

        try {
          await sharp(inputFilePath)
            .resize(dimension.width, dimension.height, { fit: 'cover' })
            .toFormat('webp')
            .webp({ quality: 10 })
            .toFile(outputFilePath);
        } catch (error) {
          console.error(`Error processing image ${file}:`, error);
        }
      }
    }
  };

  // Determine if the base folder path is directly containing images or subdirectories
  const entries = fs.readdirSync(baseFolderPath, { withFileTypes: true });

  if (entries.some(entry => entry.isFile())) {
    // If there are files, process the base folder as a directory containing images
    await processDirectory(baseFolderPath, outputPath);
  } else if (entries.some(entry => entry.isDirectory())) {
    // If there are directories, iterate over each and process them
    for (const dirent of entries.filter(dirent => dirent.isDirectory())) {
      const directoryPath = path.join(baseFolderPath, dirent.name);
      await processDirectory(directoryPath, path.join(outputPath, dirent.name));
    }
  }
};


const SquareImagesInFoldersPng = async (baseFolderPath, outputPath, dimensions) => {
  // Helper function to process a single directory
  const processDirectory = async (directoryPath, outputBasePath) => {
    const files = fs.readdirSync(directoryPath, { withFileTypes: true })
                    .filter(dirent => dirent.isFile())
                    .map(dirent => dirent.name);

    for (const file of files) {
      const inputFilePath = path.join(directoryPath, file);

      for (const dimension of dimensions) {
        const imageFolderPath = path.join(outputBasePath, path.parse(file).name,  `${dimension.width}x${dimension.height}`);
        const outputFileName = `${path.parse(file).name}.png`; // New filename based on width
        const outputFilePath = path.join(imageFolderPath, outputFileName);
        fs.mkdirSync(imageFolderPath, { recursive: true }); // Ensure the output directory exists

        try {
          await sharp(inputFilePath)
            .resize(dimension.width, dimension.height, { fit: 'cover' })
            .png({ compressionLevel: 0, progressive: true })
            .toFile(outputFilePath);
        } catch (error) {
          console.error(`Error processing image ${file}:`, error);
        }
      }
    }
  };

  // Determine if the base folder path is directly containing images or subdirectories
  const entries = fs.readdirSync(baseFolderPath, { withFileTypes: true });

  if (entries.some(entry => entry.isFile())) {
    // If there are files, process the base folder as a directory containing images
    await processDirectory(baseFolderPath, outputPath);
  } else if (entries.some(entry => entry.isDirectory())) {
    // If there are directories, iterate over each and process them
    for (const dirent of entries.filter(dirent => dirent.isDirectory())) {
      const directoryPath = path.join(baseFolderPath, dirent.name);
      await processDirectory(directoryPath, path.join(outputPath, dirent.name));
    }
  }
};




// Example usage
async function processImagesForAllItems(baseImagesFolder) {
  const itemNames = fs.readdirSync(baseImagesFolder, { withFileTypes: true })
                      .filter(dirent => dirent.isDirectory())
                      .map(dirent => dirent.name);

  const desiredWidths = [300, 228, 174, 132, 100]; // Array of desired widths in pixels
  const squareDimensions = [ // Dimensions for square images
    { width: 700, height: 700 },
    { width: 532, height: 532 },
    { width: 406, height: 406 },
    { width: 308, height: 308 },
    { width: 233, height: 233 },
  ];

  for (const itemName of itemNames) {
    const baseFolderPath = path.join(baseImagesFolder, itemName);
    const outputPathWebp = path.join('./OutputImages', itemName, 'Images');
    const outputPathPng = path.join('./OutputImages', itemName, 'Images');
    const outputPathSquarePng = path.join('./OutputImages', itemName, 'SquareImages');
    const outputPathSquareWebp = path.join('./OutputImages', itemName, 'SquareImages');

    // Resizing operations for each item
    // console.log(baseFolderPath)
    await resizeImagesInFoldersWebp(baseFolderPath, outputPathWebp, desiredWidths);
    await resizeImagesInFoldersPng(baseFolderPath, outputPathPng, desiredWidths);
    await SquareImagesInFoldersWebp(baseFolderPath, outputPathSquareWebp, squareDimensions);
    await SquareImagesInFoldersPng(baseFolderPath, outputPathSquarePng, squareDimensions);

    // console.log(`${itemName} images have been processed.`);
  }
}

// Call the function with the path to the base Images folder
processImagesForAllItems('./Images').then(() => {
  // console.log("All items have been processed.");
});