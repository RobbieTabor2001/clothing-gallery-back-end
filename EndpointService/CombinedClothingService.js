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
                // (`No item found with ID: ${itemId}`);
                return null;
            }
            // (item);
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
    
            // (`Item with image URLs retrieved successfully for ID: ${itemId}`);
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
            const itemResult = await this.clothingManagementService.insertItemOnly(itemData);
            const itemIdString = itemResult;
    
            const specificFolders = {
                'SquareImages': 1,
                'Images': 0
            };
    
            const imageDetails = []; // To hold the details including type for MongoDB insertion


            for (const [specificFolder, imageType] of Object.entries(specificFolders)) {
                const specificFolderPath = path.join(localFolderPath, specificFolder);

                if (fs.existsSync(specificFolderPath)) {
                    await this.uploadFolderAndSubfoldersToS3(specificFolderPath, `${specificFolder.toLowerCase()}/${itemIdString}`, '');
  
                    const imageDirs = fs.readdirSync(specificFolderPath, { withFileTypes: true })
                                    .filter(dirent => dirent.isDirectory())
                                    .map(dirent => dirent.name);
    
                    for (const dirName of imageDirs) {

                        const imagePath = `${specificFolder.toLowerCase()}/${itemIdString}/${dirName}`;
                        imageDetails.push({ imagePath, imageType });
                    }
                }
            }


            await this.clothingManagementService.insertImageDetails(itemIdString, imageDetails);
    
            // Use local folder name as itemName for return
            const localFolderName = path.basename(localFolderPath);
            return { itemIdString, localFolderName }; // Now returns an object with both values
        } catch (error) {
            console.error("Error adding new item with images:", error);
            throw error;
        } finally {
        }
    }
    
    async addNewItemsWithImagesBulk(itemsData) {
        try {
            const results = [];
            for (const { localFolderPath, itemData } of itemsData) {
                //console.log("starting another");
                const { itemIdString, localFolderName } = await this.addNewItemWithImages(localFolderPath, itemData);
                results.push({ itemIdString, localFolderName });
            }
    
            return results; // Returns an array of objects with itemIdString and localFolderName for each item
        } catch (error) {
            console.error("Error in bulk adding new items with images:", error);
            throw error;
        }
    }
    
    
    
    
    
    async uploadFolderAndSubfoldersToS3(localFolderPath, s3FolderName, subPath) {
        const fullPath = path.join(localFolderPath, subPath);
        const entries = fs.readdirSync(fullPath, { withFileTypes: true });
    
        let uploadPromises = [];
        for (let entry of entries) {
            const entryPath = path.join(subPath, entry.name);
            // (entry.name)
            if (entry.isDirectory()) {
                const morePromises = await this.uploadFolderAndSubfoldersToS3(localFolderPath, s3FolderName, entryPath);
                uploadPromises = uploadPromises.concat(morePromises);
            } else {
                const localFile = path.join(fullPath, entry.name);
                const s3Key = `${s3FolderName}/${entryPath}`;
                // (s3Key);
                const promise = this.s3Service.uploadFileToS3(localFile, s3Key).then(() => s3Key);
                uploadPromises.push(promise);
            }
        }
    
        return Promise.all(uploadPromises);
    }
    

    async getAllImageURLs() {
        try {
            await this.connect();
            // Retrieve all single image URLs
            const allSingleImageURLs = await this.s3Service.getAllImageURLs('squareimages');
            // Retrieve all multi image URLs
            const allMultiImageUrls = await this.getAllMultiImageUrls();
            // Return both collections
            return { allSingleImageURLs, allMultiImageUrls };
        } catch (error) {
            console.error("Error retrieving all image URLs:", error);
            throw error;
        } finally {
            await this.disconnect();
        }
    }
    
    

    async insertMultiImages(layouts) {
        try {
            for (const layout of layouts) {
                // Remove the .png extension if it exists in the layoutImagePath
                const parsedPath = path.parse(layout.layoutImagePath);
                const directoryNameWithoutExtension = path.join(parsedPath.dir, parsedPath.name);
                
                // Log the corrected path
                // (directoryNameWithoutExtension);

                // Construct the S3 folder name to upload the files
                const s3FolderName = `MultiImages/${parsedPath.name}`;

                // Upload all files from the directory to S3
                const s3Keys = await this.uploadFolderAndSubfoldersToS3(directoryNameWithoutExtension, s3FolderName, '');
                (s3Keys);
                // Insert multiple image records into MongoDB for all files uploaded
                if (s3Keys.length > 0) {
                    // Extract the base S3 folder path from one of the S3 keys
                    // All s3Keys will have a similar structure so taking the first one is sufficient
                    const baseS3FolderPath = s3Keys[0].split('/').slice(0, 2).join('/'); // This will extract something like 'MultiImages/square_with43Portrait_0'
    
                    // Insert a single image record into MongoDB
                    const multiImageRecord = {
                        itemIds: layout.itemIds,
                        imagePath: baseS3FolderPath,
                        imageType: 1 // Assuming imageType is determined by some logic or is provided; placeholder here
                    };
                    (multiImageRecord);
                    await this.clothingManagementService.insertMultiImage(
                        multiImageRecord.itemIds,
                        multiImageRecord.imagePath,
                        multiImageRecord.imageType
                    );
                }
            }
        } catch (error) {
            console.error("Error inserting multi images:", error);
            throw error;
        } finally {
        }
    }
    
    async getAllMultiImageUrls() {
        try {
            await this.connect();
            // Get all multi images from MongoDB
            const multiImages = await this.clothingManagementService.multiImageService.getAllMultiImages();
    
            // Iterate through each multi image to fetch URLs
            const multiImageUrls = await Promise.all(multiImages.map(async (multiImage) => {
                // Assume getSingleImageVersions method exists and returns the structured data as described
                const imageDetails = await this.s3Service.getSingleImageVersions(multiImage.imagePath);
    
                // Construct and return the final structured data for each multi image
                return {
                    itemIds: multiImage.itemIds.map(id => id.toString()), // Ensuring itemIds are strings
                    ...imageDetails // Spread the details obtained from S3Service
                };
            }));
    
            return multiImageUrls;
        } catch (error) {
            console.error("Error getting all multi image URLs:", error);
            throw error;
        } finally {
            await this.disconnect();
        }
    }
    

}

module.exports = CombinedClothingService;