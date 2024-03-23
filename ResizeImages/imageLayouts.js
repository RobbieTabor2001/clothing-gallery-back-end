
//--------------------
//Single Layouts
//--------------------
function createSingleSquareImageLayout(imagePath) {
  return {
    images: [
      {
        imagePath,
        orientation: 'square',
        width: 1000,
        height: 1000,
        position: { x: 0, y: 0 }
      }
    ]
  };
}

function createSingle43PortraitImageCenteredLayout(imagePath) {
  return {
    images: [
      {
        imagePath,
        orientation: 'portrait',
        width: 750,
        height: 1000,
        position: { x: 125, y: 0 }
      }
    ]
  };
}

function createSingle43LandscapeImageCenteredLayout(imagePath) {
  return {
    images: [
      {
        imagePath,
        orientation: 'landscape',
        width: 1000,
        height: 750,
        position: { x: 0, y: 125 }
      }
    ]
  };
}

function createSingle169PortraitImageCenteredLayout(imagePath) {
  return {
    images: [
      {
        imagePath,
        orientation: 'portrait',
        width: Math.round(1000 * (9 / 16)),
        height: 1000,
        position: { x: Math.round((1000 - (1000 * (9 / 16))) / 2), y: 0 }
      }
    ]
  };
}

function createSingle169LandscapeImageCenteredLayout(imagePath) {
  return {
    images: [
      {
        imagePath,
        orientation: 'landscape',
        width: 1000,
        height: Math.round(1000 * (9 / 16)),
        position: { x: 0, y: Math.round((1000 - (1000 * (9 / 16))) / 2) }
      }
    ]
  };
}
//--------------------
//Multi Layouts
//--------------------
function createThree169ImagesEvenlySpacedRowsLayout(imagePaths) {
  return {
    images: [
      { imagePath: imagePaths[0], orientation: 'landscape', width: 534, height: 300, position: { x: 233, y: 0 } },
      { imagePath: imagePaths[1], orientation: 'landscape', width: 534, height: 300, position: { x: 233, y: 350 } },
      { imagePath: imagePaths[2], orientation: 'landscape', width: 534, height: 300, position: { x: 233, y: 700 } }
    ]
  };
}

function createTwo169ImagesEvenlySpacedRowsLayout(imagePaths) {
  return {
    images: [
      { imagePath: imagePaths[0], orientation: 'landscape', width: 844, height: 475, position: { x: 78, y: 0 } },
      { imagePath: imagePaths[1], orientation: 'landscape', width: 844, height: 475, position: { x: 78, y: 525 } }
    ]
  };
}

function createThree169ImagesEvenlySpacedColumnsLayout(imagePaths) {
  return {
    images: [
      { imagePath: imagePaths[0], orientation: 'portrait', width: 300, height: 534, position: { x: 0, y: 233 } },
      { imagePath: imagePaths[1], orientation: 'portrait', width: 300, height: 534, position: { x: 350, y: 233 } },
      { imagePath: imagePaths[2], orientation: 'portrait', width: 300, height: 534, position: { x: 700, y: 233 } }
    ]
  };
}

function createTwo169ImagesEvenlySpacedColumnsLayout(imagePaths) {
  return {
    images: [
      { imagePath: imagePaths[0], orientation: 'portrait', width: 475, height: 844, position: { x: 0, y: 78 } },
      { imagePath: imagePaths[1], orientation: 'portrait', width: 475, height: 844, position: { x: 525, y: 78 } }
    ]
  };
}

//--------------------
//Squares and 4:3 Layouts
//--------------------
function createtwoSquareImagesOne43PortaitImage(imagePaths) {
  return {
    images: [
      { imagePath: imagePaths[0], orientation: 'square', width: 475, height: 475, position: { x: 525, y: 525 } },
      { imagePath: imagePaths[1], orientation: 'square', width: 475, height: 475, position: { x: 525, y: 0 } },
      { imagePath: imagePaths[1], orientation: 'portrait', width: 475, height: 634, position: { x: 0, y: 183 } }
    ]
  };
}

function createtwoSquareImagesOne43LandscapeImage(imagePaths) {
  return {
    images: [
      { imagePath: imagePaths[0], orientation: 'square', width: 475, height: 475, position: { x: 525, y: 525 } },
      { imagePath: imagePaths[1], orientation: 'square', width: 475, height: 475, position: { x: 0, y: 525 } },
      { imagePath: imagePaths[1], orientation: 'landscape', width: 634, height: 475, position: { x: 183, y: 0 } }
    ]
  };
}

function createtwoSquareImagesOne43PortaitImageReverse(imagePaths) {
  return {
    images: [
      { imagePath: imagePaths[0], orientation: 'square', width: 475, height: 475, position: { x: 0, y: 525 } },
      { imagePath: imagePaths[1], orientation: 'square', width: 475, height: 475, position: { x: 0, y: 0 } },
      { imagePath: imagePaths[1], orientation: 'portrait', width: 475, height: 634, position: { x: 525, y: 183 } }
    ]
  };
}

function createtwoSquareImagesOne43LandscapeImageReverse(imagePaths) {
  return {
    images: [
      { imagePath: imagePaths[0], orientation: 'square', width: 475, height: 475, position: { x: 525, y: 0 } },
      { imagePath: imagePaths[1], orientation: 'square', width: 475, height: 475, position: { x: 0, y: 0 } },
      { imagePath: imagePaths[1], orientation: 'landscape', width: 634, height: 475, position: { x: 183, y: 525 } }
    ]
  };
}

//--------------------
//Squares and 16:9 Layouts
//--------------------
function createtwoSquareImagesOne169PortaitImage(imagePaths) {
  return {
    images: [
      { imagePath: imagePaths[0], orientation: 'square', width: 475, height: 475, position: { x: 525, y: 525 } },
      { imagePath: imagePaths[1], orientation: 'square', width: 475, height: 475, position: { x: 525, y: 0 } },
      { imagePath: imagePaths[1], orientation: 'portrait', width: 475, height: 846, position: { x: 0, y: 77 } }
    ]
  };
}

function createtwoSquareImagesOne169LandscapeImage(imagePaths) {
  return {
    images: [
      { imagePath: imagePaths[0], orientation: 'square', width: 475, height: 475, position: { x: 525, y: 525 } },
      { imagePath: imagePaths[1], orientation: 'square', width: 475, height: 475, position: { x: 0, y: 525 } },
      { imagePath: imagePaths[1], orientation: 'landscape', width: 846, height: 475, position: { x: 77, y: 0 } }
    ]
  };
}

function createtwoSquareImagesOne169PortaitImageReverse(imagePaths) {
  return {
    images: [
      { imagePath: imagePaths[0], orientation: 'square', width: 475, height: 475, position: { x: 0, y: 525 } },
      { imagePath: imagePaths[1], orientation: 'square', width: 475, height: 475, position: { x: 0, y: 0 } },
      { imagePath: imagePaths[1], orientation: 'portrait', width: 475, height: 846, position: { x: 525, y: 77 } }
    ]
  };
}

function createtwoSquareImagesOne169LandscapeImageReverse(imagePaths) {
  return {
    images: [
      { imagePath: imagePaths[0], orientation: 'square', width: 475, height: 475, position: { x: 525, y: 0 } },
      { imagePath: imagePaths[1], orientation: 'square', width: 475, height: 475, position: { x: 0, y: 0 } },
      { imagePath: imagePaths[1], orientation: 'landscape', width: 846, height: 475, position: { x: 77, y: 525 } }
    ]
  };
}

//--------------------
//All Squares
//--------------------
function createfourSquareImagesInCorners(imagePaths) {
  return {
    images: [
      { imagePath: imagePaths[0], orientation: 'square', width: 475, height: 475, position: { x: 0, y: 0 } },
      { imagePath: imagePaths[1], orientation: 'square', width: 475, height: 475, position: { x: 525, y: 0 } },
      { imagePath: imagePaths[2], orientation: 'square', width: 475, height: 475, position: { x: 0, y: 525 } },
      { imagePath: imagePaths[3], orientation: 'square', width: 475, height: 475, position: { x: 525, y: 525 } },
    ]
  };
}


//--------------------
//4:3 with 16:9
//--------------------
// main.js
// imageLayouts.js
// imageLayouts.js
module.exports = {
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
};


