
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const {
  createSingleSquareImageLayout,
  createSingle43PortraitImageCenteredLayout,
  createSingle169LandscapeImageCenteredLayout,
  createSingle43LandscapeImageCenteredLayout,
  createSingle169PortraitImageCenteredLayout,
  createThree169ImagesEvenlySpacedRowsLayout,
  createTwo169ImagesEvenlySpacedRowsLayout,
  createThree169ImagesEvenlySpacedColumnsLayout,
  createTwo169ImagesEvenlySpacedColumnsLayout,
  createtwoSquareImagesOne43PortaitImage,
  createtwoSquareImagesOne43LandscapeImage,
  createtwoSquareImagesOne169PortaitImage,
  createtwoSquareImagesOne169LandscapeImage,
  createtwoSquareImagesOne169PortaitImageReverse,
  createtwoSquareImagesOne169LandscapeImageReverse,
  createtwoSquareImagesOne43PortaitImageReverse,
  createtwoSquareImagesOne43LandscapeImageReverse
} = require('./imageLayouts');

async function saveWebpVersions(filePath) {
  try {
    // Check if the file exists
    await fs.access(filePath);

    // Create a directory with the base file name to store optimized versions
    const baseFileName = path.basename(filePath, path.extname(filePath));
    const outputDir = path.join(path.dirname(filePath), baseFileName);
    await fs.mkdir(outputDir, { recursive: true });

    // Read the image into a buffer
    const buffer = await fs.readFile(filePath);
    const metadata = await sharp(buffer).metadata(); // Get image metadata for aspect ratio calculation

    // Sizes to resize the images to (as widths)
    const sizes = [200, 300, 400];

    for (const size of sizes) {
      const sizeDir = path.join(outputDir, `${size}`);
      await fs.mkdir(sizeDir, { recursive: true });

      // Calculate height while maintaining aspect ratio, rounded to the nearest whole number
      const height = Math.round((metadata.height / metadata.width) * size);

      // Lossless compression with high quality (but larger file size)
      const losslessOutputPath = path.join(sizeDir, `${baseFileName}_lossless.webp`);
      await sharp(buffer)
        .resize(size, height) // Use calculated height
        .webp({ quality: 100, lossless: true })
        .toFile(losslessOutputPath);

      // High compression with low quality (but smaller file size)
      const compressedOutputPath = path.join(sizeDir, `${baseFileName}_compressed.webp`);
      await sharp(buffer)
        .resize(size, height) // Use calculated height
        .webp({ quality: 10 }) // 10 out of 100 for heavy compression
        .toFile(compressedOutputPath);
    }

    // Delete the original file
    await fs.unlink(filePath);

    console.log('WebP images saved for sizes:', sizes);
  } catch (error) {
    console.error("Error saving WebP versions:", error);
    throw error;
  }
}




async function determineSingleLayout(imagePath) {
  const metadata = await sharp(imagePath).metadata();
  const aspectRatio = metadata.width / metadata.height;
  if (aspectRatio === 1) return createSingleSquareImageLayout(imagePath);
  else if (aspectRatio > 1) {
    // Landscape orientation
    if (aspectRatio >= 16 / 9) return createSingle169LandscapeImageCenteredLayout(imagePath);
    else return createSingle43LandscapeImageCenteredLayout(imagePath);
  } else {
    // Portrait orientation
    if (aspectRatio <= 9 / 16) return createSingle169PortraitImageCenteredLayout(imagePath);
    else return createSingle43PortraitImageCenteredLayout(imagePath);
  }
}

async function createMultiLayoutImagesWithItemIds(categories, outputFolderPath,itemFolderMappings ) {
  const layoutResults = [];
  // Helper function to select random images from a category
  const selectRandomImages = (imageArray, count) => {
    const shuffled = imageArray.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Generate layouts based on available images, scaling the layouts up or down
  for (const [category, images] of Object.entries(categories)) {
    if (images.length < 2) continue; // Skip categories with less than 2 images for multi-image layouts

    const totalLayouts = Math.min(Math.floor(images.length / 2), 5); // Limit to 5 layouts of each type for example

    for (let i = 0; i < totalLayouts; i++) {
      let layout, layoutName;
      switch (category) {
        case 'landscape169':
          if (images.length >= 3) {
            layout = createThree169ImagesEvenlySpacedRowsLayout(selectRandomImages(images, 3));
            layoutName = `landscape169_threeRows_${i}.png`;
          } else {
            layout = createTwo169ImagesEvenlySpacedRowsLayout(selectRandomImages(images, 2));
            layoutName = `landscape169_twoRows_${i}.png`;
          }
          break;
        case 'portrait169':
          if (images.length >= 3) {
            layout = createThree169ImagesEvenlySpacedColumnsLayout(selectRandomImages(images, 3));
            layoutName = `portrait169_threeColumns_${i}.png`;
          } else {
            layout = createTwo169ImagesEvenlySpacedColumnsLayout(selectRandomImages(images, 2));
            layoutName = `portrait169_twoColumns_${i}.png`;
          }
          break;
        case 'square':
          // Given that square images can fit with other categories too, choose layouts dynamically
          if (categories.portrait43 && categories.portrait43.length > 0) {
            layout = createtwoSquareImagesOne43PortaitImage(selectRandomImages([...images, ...categories.portrait43], 3));
            layoutName = `square_with43Portrait_${i}.png`;
          } else if (categories.landscape169 && categories.landscape169.length > 0) {
            layout = createtwoSquareImagesOne169LandscapeImage(selectRandomImages([...images, ...categories.landscape169], 3));
            layoutName = `square_with169Landscape_${i}.png`;
          }
          break;
        // Assuming categories for portrait43 and landscape43 exist and are filled similarly to portrait169 and landscape169
        case 'portrait43':
          if (images.length >= 2 && categories.square && categories.square.length > 0) {
            layout = createtwoSquareImagesOne43PortaitImage(selectRandomImages([...images, ...categories.square], 3));
            layoutName = `portrait43_withTwoSquares_${i}.png`;
          }
          break;
        case 'landscape43':
          if (images.length >= 2 && categories.square && categories.square.length > 0) {
            layout = createtwoSquareImagesOne43LandscapeImage(selectRandomImages([...images, ...categories.square], 3));
            layoutName = `landscape43_withTwoSquares_${i}.png`;
          }
          break;
        // Default case for unexpected categories - can log or handle as needed
        default:
          // (`No layout rule defined for category: ${category}`);
          break;
      }

      if (layout && layoutName) {
        const outputPath = path.join(outputFolderPath, layoutName);
        await createImageFromLayout(layout, outputPath);
        
        // Use the getItemIdsForLayout to determine the item IDs involved in the current layout
        const itemIds = getItemIdsForLayout(itemFolderMappings, layout);

        // Add to the layout results including item IDs and the local file path
        layoutResults.push({
          itemIds: itemIds,
          layoutImagePath: outputPath
        });
      }
    }
  }
  

  return layoutResults;
}

async function categorizeImage(filePath, categories) {
  const metadata = await sharp(filePath).metadata();
  const aspectRatio = metadata.width / metadata.height;

  if (aspectRatio === 1) {
    categories.square.push(filePath);
  } else if (aspectRatio > 1) {
    // Landscape
    if (aspectRatio >= 16 / 9) {
      categories.landscape169.push(filePath);
    } else {
      categories.landscape43.push(filePath);
    }
  } else {
    // Portrait
    if (aspectRatio <= 9 / 16) {
      categories.portrait169.push(filePath);
    } else {
      categories.portrait43.push(filePath);
    }
  }
}

async function categorizeImages(folderPath, categories = {
  square: [],
  portrait43: [],
  landscape43: [],
  portrait169: [],
  landscape169: []
}) {
  const entries = await fs.readdir(folderPath, { withFileTypes: true });
  // Iterate through each entry in the directory
  for (const entry of entries) {
    // Skip .DS_Store and other hidden files
    if (entry.name.startsWith('.')) {
      continue; // Skip this iteration if the file is .DS_Store or any hidden file
    }

    const entryPath = path.join(folderPath, entry.name);
    if (entry.isDirectory()) {
      // If entry is a directory, recursively call categorizeImages
      await categorizeImages(entryPath, categories);
    } else {
      // If entry is a file, categorize the image
      await categorizeImage(entryPath, categories);
    }
  }

  return categories;
}



async function createImageFromLayout(layout, outputPath) {
  // Determine the overall dimensions of the layout
  const overallWidth = layout.width;
  const overallHeight = layout.height;

  // Check if the output directory exists, if not create it
  const outputDir = path.dirname(outputPath);
  try {
    await fs.access(outputDir);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Directory does not exist
      await fs.mkdir(outputDir, { recursive: true });
      // (`Created directory: ${outputDir}`);
    } else {
      // Re-throw other errors
      throw error;
    }
  }

  // Start with a blank canvas
  let canvas = sharp({
    create: {
      width: overallWidth,
      height: overallHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 } // or any other background color
    }
  });

  // Prepare composites array
  const composites = [];

  // Fill composites array with image buffers and positions
  for (const image of layout.images) {
    const imageBuffer = await sharp(image.imagePath).resize(image.width, image.height).toBuffer();
    composites.push({ input: imageBuffer, left: image.position.x, top: image.position.y });
  }

  // Apply all composites at once
  canvas = canvas.composite(composites);

  // Save the final layout image
  await canvas.toFile(outputPath);
  await saveWebpVersions(outputPath);
}

function getItemIdsForLayout(itemFolderMappings, layout) {
  // Extract image paths from the layout
  const layoutImagePaths = layout.images.map(image => image.imagePath);

  // Create a set to hold unique item IDs
  const itemIds = new Set();

  // Iterate through each image path in the layout
  layoutImagePaths.forEach(layoutImagePath => {
      // Extract the folder name from the image path
      const imageFolderName = extractFolderNameFromImagePath(layoutImagePath);

      // Find the corresponding itemIdString for the folder name
      itemFolderMappings.forEach(({ itemIdString, localFolderName }) => {
          if (localFolderName === imageFolderName) {
              // If a match is found, add the itemIdString to the set
              itemIds.add(itemIdString);
          }
      });
  });

  // Convert the set of item IDs to an array and return
  return [...itemIds];
}

// Helper function to extract the folder name from an image path
function extractFolderNameFromImagePath(imagePath) {
  // Assuming imagePath format is like 'specificFolder/itemIdString/dirName'
  // And that 'dirName' correlates to 'localFolderName'
  const parts = imagePath.split('/');
  // Adjust the index as necessary depending on the exact format of your paths
  return parts[parts.length - 2];
}

// Assuming all your function definitions are above this line

module.exports = {
  determineSingleLayout,
  createMultiLayoutImagesWithItemIds,
  categorizeImage,
  categorizeImages,
  createImageFromLayout
};
