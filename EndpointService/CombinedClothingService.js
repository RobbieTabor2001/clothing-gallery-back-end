const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');


const S3Service = require('../S3/S3Service');
const ClothingManagementService = require('../ClothingManagement/ClothingManagementService');

class CombinedClothingService {
    constructor() {
        // Initialize AWS S3 with your configuration
        this.s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        });
        this.s3Service = new S3Service(this.s3);
        this.clothingManagementService = new ClothingManagementService();
    }

    async connect() {
        await this.clothingManagementService.connect();
    }

    async disconnect() {
        await this.clothingManagementService.disconnect();
    }


    async getItemWithImageUrls(itemId) {
        try {
            await this.connect();
            // Use ClothingManagementService to get the item with its MongoDB document images
            const item = await this.clothingManagementService.getItemWithImagesByType(itemId,1); //1 is square images
            if (!item) {
                // console.log(`No item found with ID: ${itemId}`);
                return null;
            }
            // console.log(item);
            // For each image associated with the item, use getSingleImageVersions to get the dictionary of versions
            const imageVersionsPromises = item.squareImages.map(async (image) => {
                // The imagePath directly becomes the s3FolderPath parameter for getSingleImageVersions

                return this.s3Service.getSingleImageVersions(image.imagePath);
            });
    
            // Await all promises to resolve, getting an array of dictionaries for image versions
            const imagesVersions = await Promise.all(imageVersionsPromises);
    
            // Adjust the item structure to include the structured array of image URLs
            const itemWithImageUrls = {
                id: item._id, // Assuming you want the item ID here
                name: item.name,
                description: item.description,
                images: imagesVersions // Storing structured image URLs
            };
    
            // console.log(`Item with image URLs retrieved successfully for ID: ${itemId}`);
            return itemWithImageUrls;
        } catch (error) {
            console.error(`Error retrieving item with image URLs for ID: ${itemId}:`, error);
            throw error;
        } finally {
            await this.disconnect();
        }
    }
    

    async addNewItemWithImages(localFolderPath, itemData) {
        try {
            await this.connect();
            // Insert the item and get the inserted item's ID as a string
            // console.log("ada");
            const itemIdString = await this.clothingManagementService.insertItemOnly(itemData);
    
            // Define the specific subdirectories for handling and their corresponding image type values
            const specificFolders = {
                'SquareImages': 1,
                'Images': 0
            };
    
            const uniqueImagePaths = new Set();
            const imageDetails = []; // To hold the details including type for MongoDB insertion
    
            // Iterate through the specified folders, uploading their contents to the correct S3 path
            for (const [specificFolder, imageType] of Object.entries(specificFolders)) {
                const specificFolderPath = path.join(localFolderPath, specificFolder);
                // Check if the specific folder exists
                if (fs.existsSync(specificFolderPath)) {
                    await this.uploadFolderAndSubfoldersToS3(specificFolderPath, `${specificFolder.toLowerCase()}/${itemIdString}`, '');
    
                    // For each directory, get image directories and construct the S3 path for each image
                    const imageDirs = fs.readdirSync(specificFolderPath, { withFileTypes: true })
                                    .filter(dirent => dirent.isDirectory())
                                    .map(dirent => dirent.name);
                                    
                    for (const dirName of imageDirs) {
                        // Construct the full path for each image and add it to the set
                        const imagePath = `${specificFolder.toLowerCase()}/${itemIdString}/${dirName}`;
                        // Add imagePath and imageType to a structured object for MongoDB insertion
                        imageDetails.push({ imagePath, imageType });
                    }
                }
            }
    
            // Insert the image details into MongoDB - adjust this according to your actual MongoDB schema/method
            await this.clothingManagementService.insertImageDetails(itemIdString, imageDetails);
    
            return itemIdString; // Return the ID of the newly added item
        } catch (error) {
            console.error("Error adding new item with images:", error);
            throw error;
        } finally {
            await this.disconnect();
        }
    }
    
    
    
    
    async uploadFolderAndSubfoldersToS3(localFolderPath, s3FolderName, subPath) {
        const fullPath = path.join(localFolderPath, subPath);
        const entries = fs.readdirSync(fullPath, { withFileTypes: true });
    
        let uploadPromises = [];
        for (let entry of entries) {
            const entryPath = path.join(subPath, entry.name);
            // console.log(entry.name)
            if (entry.isDirectory()) {
                const morePromises = await this.uploadFolderAndSubfoldersToS3(localFolderPath, s3FolderName, entryPath);
                uploadPromises = uploadPromises.concat(morePromises);
            } else {
                const localFile = path.join(fullPath, entry.name);
                const s3Key = `${s3FolderName}/${entryPath}`;
                // console.log(s3Key);
                const promise = this.s3Service.uploadFileToS3(localFile, s3Key).then(() => s3Key);
                uploadPromises.push(promise);
            }
        }
    
        return Promise.all(uploadPromises);
    }
    

    async getAllImageURLs() {
        try {
            await this.connect();
            // Delegate the call to S3Service to retrieve all image URLs
            const allImageURLs = await this.s3Service.getAllImageURLs('images');
            // Process or format the data further if needed
            // For now, it just returns the data as-is
            return allImageURLs;
        } catch (error) {
            console.error("Error retrieving all image URLs:", error);
            throw error;
        } finally {
            await this.disconnect();
        }
    }
    

}

module.exports = CombinedClothingService;