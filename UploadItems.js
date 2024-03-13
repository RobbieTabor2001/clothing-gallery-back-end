require('dotenv').config();
const fs = require('fs');
const path = require('path');
const CombinedClothingService = require('./EndpointService/CombinedClothingService');

const itemData = [
    {
        name: "WarrentonHoodie",
        description: "A comfortable hoodie in Warrenton style."
    },
    {
        name: "DoubleFaceBlueWhite",
        description: "A reversible hoodie with one side blue and the other white."
    },
    {
        name: "MarlboroRacing",
        description: "Racing themed hoodie with Marlboro branding."
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
        name: "KeepOnTrucking",
        description: "A collection inspired by Keep on Trucking 50s style."
    }
];

const imagesDirectory = path.join(__dirname, './OutputImages'); // Ensure this directory path is correct

const combinedService = new CombinedClothingService();

async function processItems() {
    await combinedService.connect();

    for (const item of itemData) {
        const localFolderPath = path.join(imagesDirectory, item.name.replace(/\s+/g, '')); // Path to the item's images folder
        if (fs.existsSync(localFolderPath) && fs.lstatSync(localFolderPath).isDirectory()) {
            // console.log(`Processing item: ${item.name}`);
            await combinedService.addNewItemWithImages(localFolderPath, item);
            // console.log(`Successfully processed item: ${item.name}`);
        } else {
            console.error(`No directory found for item: ${item.name} at ${localFolderPath}`);
        }
    }

    await combinedService.disconnect();
}

processItems().catch(console.error);
