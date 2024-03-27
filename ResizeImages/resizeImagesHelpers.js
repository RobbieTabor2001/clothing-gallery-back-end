
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
  createtwoSquareImagesOne43LandscapeImageReverse,
  createfourSquareImagesInCorners
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

function getAllMultiLayouts() {
  const layouts = [
    {
      function: createThree169ImagesEvenlySpacedRowsLayout,
      requirements: ['16:9', '16:9', '16:9']
    },
    {
      function: createTwo169ImagesEvenlySpacedRowsLayout,
      requirements: ['16:9', '16:9']
    },
    {
      function: createThree169ImagesEvenlySpacedColumnsLayout,
      requirements: ['9:16', '9:16', '9:16']
    },
    {
      function: createTwo169ImagesEvenlySpacedColumnsLayout,
      requirements: ['9:16', '9:16']
    },
    {
      function: createtwoSquareImagesOne43PortaitImage,
      requirements: ['1:1', '1:1', '3:4']
    },
    {
      function: createtwoSquareImagesOne43LandscapeImage,
      requirements: ['1:1', '1:1', '4:3']
    },
    {
      function: createtwoSquareImagesOne169PortaitImage,
      requirements: ['1:1', '1:1', '9:16']
    },
    {
      function: createtwoSquareImagesOne169LandscapeImage,
      requirements: ['1:1', '1:1', '16:9']
    },
    {
      function: createtwoSquareImagesOne169PortaitImageReverse,
      requirements: ['1:1', '1:1', '9:16']
    },
    {
      function: createtwoSquareImagesOne169LandscapeImageReverse,
      requirements: ['1:1', '1:1', '16:9']
    },
    {
      function: createtwoSquareImagesOne43PortaitImageReverse,
      requirements: ['1:1', '1:1', '3:4']
    },
    {
      function: createtwoSquareImagesOne43LandscapeImageReverse,
      requirements: ['1:1', '1:1', '4:3']
    },
    {
      function: createfourSquareImagesInCorners,
      requirements: ['1:1', '1:1', '1:1', '1:1']
    }
  ];

  return layouts;
}


async function categorizeImage(filePath, categories) {
  const metadata = await sharp(filePath).metadata();
  const aspectRatio = metadata.width / metadata.height;
  const aspectRatioLabel = aspectRatio === 1 ? '1:1' : 
                           aspectRatio > 1 ? (aspectRatio >= 16 / 9 ? '16:9' : '4:3') : 
                           (aspectRatio <= 9 / 16 ? '9:16' : '3:4');

  const imageInfo = { path: filePath, aspectRatio: aspectRatioLabel };

  if (aspectRatio === 1) {
    categories.square.push(imageInfo);
  } else if (aspectRatio > 1) {
    // Landscape
    if (aspectRatio >= 16 / 9) {
      categories.landscape169.push(imageInfo);
    } else {
      categories.landscape43.push(imageInfo);
    }
  } else {
    // Portrait
    if (aspectRatio <= 9 / 16) {
      categories.portrait169.push(imageInfo);
    } else {
      categories.portrait43.push(imageInfo);
    }
  }
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

function extractFolderNameFromImagePath(imagePath) {
  // Assuming imagePath format is like 'specificFolder/itemIdString/dirName'
  // And that 'dirName' correlates to 'localFolderName'
  const parts = imagePath.split('/');
  // Adjust the index as necessary depending on the exact format of your paths
  return parts[parts.length - 2];
}




//main funcs
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

async function createMultiLayoutImagesWithItemIds(categories, outputFolderPath, itemFolderMappings) {
  const layoutResults = [];
  const allMultiLayouts = getAllMultiLayouts(); // Get all layout definitions including requirements
  const imagesCreated = 100; // The total number of multi-images you aim to create
  
  // Helper function to select random images from any category that matches the required aspect ratio
  const selectRandomImagesByAspectRatio = (aspectRatio, count) => {
    let allMatchingImages = [];
    // Aggregate all images that match the required aspect ratio
    for (const [category, images] of Object.entries(categories)) {
      const matchingImages = images.filter(image => image.aspectRatio === aspectRatio);
      allMatchingImages = [...allMatchingImages, ...matchingImages];
    }
    // Shuffle and slice to get the desired count
    return allMatchingImages.sort(() => 0.5 - Math.random()).slice(0, count);
  };

  for (let i = 0; i < imagesCreated; i++) {
    // Randomly select a layout function
    const layoutIndex = Math.floor(Math.random() * allMultiLayouts.length);
    const {function: layoutFunc, requirements} = allMultiLayouts[layoutIndex];
    
    let selectedImages = [];
    let canFulfillRequirements = true;
    
    // Iterate through each requirement to collect images
    for (const aspectRatio of requirements) {
      const images = selectRandomImagesByAspectRatio(aspectRatio, 1);
      if (images.length < 1) {
        canFulfillRequirements = false;
        break;
      }
      selectedImages = [...selectedImages, ...images];
    }
    
    if (!canFulfillRequirements) continue; // Skip if cannot fulfill the layout requirements

    // Assuming your layout function expects paths, map selected images to their paths
    const imagePaths = selectedImages.map(image => image.path);
    
    // Generate the layout
    const layout = layoutFunc(imagePaths);
    const layoutName = `multi_image_layout_${i}.png`;
    const outputPath = path.join(outputFolderPath, layoutName);
    
    await createImageFromLayout(layout, outputPath);
    
    // Assuming a function to determine the item IDs from the selected images
    const itemIds = getItemIdsForLayout(itemFolderMappings,layout);// Adjust based on your data structure
    
    // Add to the layout results including item IDs and the local file path
    layoutResults.push({
      itemIds: itemIds,
      layoutImagePath: outputPath
    });
  }

  return layoutResults;
}

// Note: This function assumes that images in your categories object have a property 'aspectRatio' and 'path'.
// You may need to adjust the logic of selectRandomImagesByAspectRatio or the structure of your images 
// to match these expectations for this function to work correctly.



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

// Assuming all your function definitions are above this line

module.exports = {
  determineSingleLayout,
  createMultiLayoutImagesWithItemIds,
  categorizeImages,
  createImageFromLayout
};
