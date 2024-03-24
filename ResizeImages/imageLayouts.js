
//--------------------
//Single Layouts
//--------------------
function createSingleSquareImageLayout(imagePath) {
  return {
    width: 1000,
    height: 1000,
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
    width: 1000,
    height: 1333,
    images: [
      {
        imagePath,
        orientation: 'portrait',
        width: 1000,
        height: 1333,
        position: { x: 0, y: 0 }
      }
    ]
  };
}

function createSingle43LandscapeImageCenteredLayout(imagePath) {
  return {
    width: 1000,
    height: 750,
    images: [
      {
        imagePath,
        orientation: 'landscape',
        width: 1000,
        height: 750,
        position: { x: 0, y: 0 }
      }
    ]
  };
}

function createSingle169PortraitImageCenteredLayout(imagePath) {
  return {
    width: 1000,
    height: 1778,
    images: [
      {
        imagePath,
        orientation: 'portrait',
        width: 1000,
        height: 1778,
        position: { x: 0, y: 0 }
      }
    ]
  };
}

function createSingle169LandscapeImageCenteredLayout(imagePath) {
  return {
    width: 1000,
    height: 563,
    images: [
      {
        imagePath,
        orientation: 'landscape',
        width: 1000,
        height: 563,
        position: { x: 0, y: 0 }
      }
    ]
  };
}
//--------------------
//Multi Layouts
//--------------------
function createThree169ImagesEvenlySpacedRowsLayout(imagePaths) {
  return {
    width: 1000,
    height: 1789,
    images: [
      { imagePath: imagePaths[0], orientation: 'landscape', width: 1000, height: 563, position: { x: 0, y: 0 } },
      { imagePath: imagePaths[1], orientation: 'landscape', width: 1000, height: 563, position: { x: 0, y: 613 } },
      { imagePath: imagePaths[2], orientation: 'landscape', width: 1000, height: 563, position: { x: 0, y: 1226 } }
    ]
  };
}

function createTwo169ImagesEvenlySpacedRowsLayout(imagePaths) {
  return {
    width: 1000,
    height: 1176,
    images: [
      { imagePath: imagePaths[0], orientation: 'landscape', width: 1000, height: 563, position: { x: 0, y: 0 } },
      { imagePath: imagePaths[1], orientation: 'landscape', width: 1000, height: 563, position: { x: 0, y: 613 } }
    ]
  };
}

function createThree169ImagesEvenlySpacedColumnsLayout(imagePaths) {
  return {
    width: 1000,
    height: 534,
    images: [
      { imagePath: imagePaths[0], orientation: 'portrait', width: 300, height: 534, position: { x: 0, y: 0 } },
      { imagePath: imagePaths[1], orientation: 'portrait', width: 300, height: 534, position: { x: 350, y: 0 } },
      { imagePath: imagePaths[2], orientation: 'portrait', width: 300, height: 534, position: { x: 700, y: 0 } }
    ]
  };
}

function createTwo169ImagesEvenlySpacedColumnsLayout(imagePaths) {
  return {
    width: 1000,
    height: 844,
    images: [
      { imagePath: imagePaths[0], orientation: 'portrait', width: 475, height: 844, position: { x: 0, y: 0 } },
      { imagePath: imagePaths[1], orientation: 'portrait', width: 475, height: 844, position: { x: 525, y: 0 } }
    ]
  };
}

//--------------------
//Squares and 4:3 Layouts
//--------------------
function createtwoSquareImagesOne43PortaitImage(imagePaths) {
  return {
    width: 1000,
    height: 1000,
    images: [
      { imagePath: imagePaths[0], orientation: 'square', width: 475, height: 475, position: { x: 525, y: 525 } },
      { imagePath: imagePaths[1], orientation: 'square', width: 475, height: 475, position: { x: 525, y: 0 } },
      { imagePath: imagePaths[1], orientation: 'portrait', width: 475, height: 634, position: { x: 0, y: 183 } }
    ]
  };
}

function createtwoSquareImagesOne43LandscapeImage(imagePaths) {
  return {
    width: 1000,
    height: 1000,
    images: [
      { imagePath: imagePaths[0], orientation: 'square', width: 475, height: 475, position: { x: 525, y: 525 } },
      { imagePath: imagePaths[1], orientation: 'square', width: 475, height: 475, position: { x: 0, y: 525 } },
      { imagePath: imagePaths[1], orientation: 'landscape', width: 634, height: 475, position: { x: 183, y: 0 } }
    ]
  };
}

function createtwoSquareImagesOne43PortaitImageReverse(imagePaths) {
  return {
    width: 1000,
    height: 1000,
    images: [
      { imagePath: imagePaths[0], orientation: 'square', width: 475, height: 475, position: { x: 0, y: 525 } },
      { imagePath: imagePaths[1], orientation: 'square', width: 475, height: 475, position: { x: 0, y: 0 } },
      { imagePath: imagePaths[1], orientation: 'portrait', width: 475, height: 634, position: { x: 525, y: 183 } }
    ]
  };
}

function createtwoSquareImagesOne43LandscapeImageReverse(imagePaths) {
  return {
    width: 1000,
    height: 1000,
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
    width: 1000,
    height: 1000,
    images: [
      { imagePath: imagePaths[0], orientation: 'square', width: 475, height: 475, position: { x: 525, y: 525 } },
      { imagePath: imagePaths[1], orientation: 'square', width: 475, height: 475, position: { x: 525, y: 0 } },
      { imagePath: imagePaths[1], orientation: 'portrait', width: 475, height: 846, position: { x: 0, y: 77 } }
    ]
  };
}

function createtwoSquareImagesOne169LandscapeImage(imagePaths) {
  return {
    width: 1000,
    height: 1088,
    images: [
      { imagePath: imagePaths[0], orientation: 'square', width: 475, height: 475, position: { x: 525, y: 613 } },
      { imagePath: imagePaths[1], orientation: 'square', width: 475, height: 475, position: { x: 0, y: 613 } },
      { imagePath: imagePaths[1], orientation: 'landscape', width: 1000, height: 563, position: { x: 0, y: 0 } }
    ]
  };
}

function createtwoSquareImagesOne169PortaitImageReverse(imagePaths) {
  return {
    width: 1000,
    height: 1000,
    images: [
      { imagePath: imagePaths[0], orientation: 'square', width: 475, height: 475, position: { x: 0, y: 525 } },
      { imagePath: imagePaths[1], orientation: 'square', width: 475, height: 475, position: { x: 0, y: 0 } },
      { imagePath: imagePaths[1], orientation: 'portrait', width: 475, height: 846, position: { x: 525, y: 77 } }
    ]
  };
}

function createtwoSquareImagesOne169LandscapeImageReverse(imagePaths) {
  return {
    width: 1000,
    height: 1088,
    images: [
      { imagePath: imagePaths[0], orientation: 'square', width: 475, height: 475, position: { x: 525, y: 0 } },
      { imagePath: imagePaths[1], orientation: 'square', width: 475, height: 475, position: { x: 0, y: 0 } },
      { imagePath: imagePaths[1], orientation: 'landscape', width: 1000, height: 563, position: { x: 0, y: 525 } }
    ]
  };
}

//--------------------
//All Squares
//--------------------
function createfourSquareImagesInCorners(imagePaths) {
  return {
    width: 1000,
    height: 1000,
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
  createtwoSquareImagesOne43LandscapeImageReverse,
  createfourSquareImagesInCorners
};


