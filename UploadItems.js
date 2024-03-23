require('dotenv').config();
const fs = require('fs');
const path = require('path');
const CombinedClothingService = require('./EndpointService/CombinedClothingService');

const {
    categorizeAndCreateLayoutsFromFolder,
    processFoldersInImages
  } = require('./ResizeImages/resizeImagesV2'); // Make sure to replace './path/to/your/file' with the actual path to the file where you placed the export
  
  const itemData = [
    {
      name: "BlueShadowLoop",
      description: "Description for BlueShadowLoop."
    },
    {
      name: "CutOffBigE",
      description: "Description for CutOffBigE."
    },
    {
      name: "DoubleFaceBlueWhite",
      description: "Description for DoubleFaceBlueWhite."
    },
    {
      name: "FishingVest",
      description: "Description for FishingVest4Os."
    },
    {
      name: "GreenBrownLoop",
      description: "Description for GreenBrownLoop."
    },
    {
      name: "GreyRedDadLeather",
      description: "Description for GreyRedDadLeather."
    },
    {
      name: "KeepOnTrucking",
      description: "Description for KeepOnTrucking."
    },
    {
      name: "MarlboroRacingJacket",
      description: "Description for MarlboroRacingJacket."
    },
    {
      name: "NYCDeli",
      description: "Description for NYCDeli."
    },
    {
      name: "Prianna",
      description: "Description for Prianna."
    },
    {
      name: "Robbie",
      description: "Special edition hoodie designed by Robbie."
    },
    {
      name: "Schroeder",
      description: "A collection inspired by Schroeder's style."
    },
    {
      name: "WarrentonHoodie",
      description: "A comfortable hoodie in Warrenton style."
    }
  ];
  

const imagesDirectory = path.join(__dirname, './Images'); 
const outputImagesDirectory = path.join(__dirname,'./OutputImages')
const outputMultiImagesDirectory = path.join(__dirname,'./OutputMultiImages')
const combinedService = new CombinedClothingService();

async function processItemsBulk() {

   await processFoldersInImages(imagesDirectory,outputImagesDirectory);

    await combinedService.connect();

    // Map each item to a structure expected by addNewItemsWithImagesBulk
    const itemsWithPaths = itemData.map(item => {
        const localFolderPath = path.join(outputImagesDirectory, item.name.replace(/\s+/g, ''));
        return {
            localFolderPath,
            itemData: item
        };
        
    }).filter(item => fs.existsSync(item.localFolderPath) && fs.lstatSync(item.localFolderPath).isDirectory());

    // Call the bulk method if there are items to process
    if (itemsWithPaths.length > 0) {
        const itemIdsToFolderName = await combinedService.addNewItemsWithImagesBulk(itemsWithPaths);
        //console.log("Bulk processing completed with item IDs and folder names mapping:", itemIdsToFolderName);
       const multiImages = await categorizeAndCreateLayoutsFromFolder(imagesDirectory, outputMultiImagesDirectory,itemIdsToFolderName);
       await combinedService.insertMultiImages(multiImages);
    } else {
        console.error("No valid directories found for items.");
    }

    await combinedService.disconnect();
}

processItemsBulk().catch(console.error);
