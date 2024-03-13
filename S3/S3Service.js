const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');

class S3Service {
    constructor(s3) {
        this.s3 = s3;
        this.bucketName = process.env.AWS_S3_BUCKET;
    }

    // Method to get an image by file path
    async getImage(filePath) {
        const params = {
            Bucket: this.bucketName,
            Key: filePath,
        };

        try {
            // This example assumes you want to download the image. If you just want to get the URL, adjust accordingly.
            const data = await this.s3.getObject(params).promise();
            //console.log(`Image fetched successfully.`);
            return data.Body;
        } catch (error) {
            console.error("Error fetching image:", error);
            throw error;
        }
    }
    async getImageUrl(filePath) {
        const params = {
            Bucket: this.bucketName,
            Key: filePath,
            Expires: 60 * 5 // URL expires in 5 minutes
        };
    
        try {
            // Generate a signed URL for temporary access
            const url = await this.s3.getSignedUrlPromise('getObject', params);
            //console.log(`Image URL generated successfully.`);
            return url;
        } catch (error) {
            console.error("Error generating image URL:", error);
            throw error;
        }
    }
    

    // Method to upload a collection of images into a folder
    async uploadFolderToS3(localFolderPath, s3FolderName) {
        const uploadDirectoryRecursive = async (localPath, s3Path) => {
            // Get all items in the directory
            const items = fs.readdirSync(localPath, { withFileTypes: true });
    
            const uploadPromises = items.map(item => {
                const localItemPath = path.join(localPath, item.name);
                const s3ItemPath = `${s3Path}/${item.name}`;
    
                if (item.isDirectory()) {
                    // Recursively upload items in subdirectory
                    return uploadDirectoryRecursive(localItemPath, s3ItemPath);
                } else {
                    // Read file content and upload it to S3
                    const fileContent = fs.readFileSync(localItemPath);
                    return this.s3.upload({
                        Bucket: this.bucketName,
                        Key: s3ItemPath,
                        Body: fileContent,
                        // ACL: 'public-read', // Uncomment or modify according to your S3 policy
                    }).promise();
                }
            });
    
            // Wait for all the upload promises to resolve
            return Promise.all(uploadPromises);
        };
    
        // Start the recursive upload from the root directory
        return uploadDirectoryRecursive(localFolderPath, s3FolderName);
    }

    async deleteFolder(s3FolderName) {
        const listParams = {
            Bucket: this.bucketName,
            Prefix: `${s3FolderName}/`, // Ensure the folder name ends with a slash
        };

        try {
            const listedObjects = await this.s3.listObjectsV2(listParams).promise();

            if (listedObjects.Contents.length === 0) return;

            const deleteParams = {
                Bucket: this.bucketName,
                Delete: { Objects: [] },
            };

            listedObjects.Contents.forEach(({ Key }) => {
                deleteParams.Delete.Objects.push({ Key });
            });

            await this.s3.deleteObjects(deleteParams).promise();

            if (listedObjects.IsTruncated) await this.deleteFolder(s3FolderName); // Recurse to delete more if the list is truncated
            //console.log(`${s3FolderName} deleted successfully.`);
        } catch (error) {
            console.error("Error deleting folder:", error);
            throw error;
        }
    }

    // Method to read a folder and get all images
    async readFolder(s3FolderName) {
        const params = {
            Bucket: this.bucketName,
            Prefix: `${s3FolderName}/`,
        };

        try {
            const data = await this.s3.listObjectsV2(params).promise();
            const images = data.Contents.map(item => item.Key);
            //console.log(`Images in ${s3FolderName}:`, images);
            return images;
        } catch (error) {
            console.error("Error reading folder:", error);
            throw error;
        }
    }

    // Method to update a folder (replace its images)
    async updateFolder(localFolderPath, s3FolderName) {
        // Delete existing folder contents
        await this.deleteFolder(s3FolderName);
        // Upload new contents from the local folder
        return await this.uploadFolderToS3(localFolderPath, s3FolderName);
    }

    async getSingleImageVersions(s3FolderPath) {
        const listParams = {
            Bucket: this.bucketName,
            Prefix: `${s3FolderPath}`,
        };
        console.log(s3FolderPath);
        try {
            const listedObjects = await this.s3.listObjectsV2(listParams).promise();
            if (listedObjects.Contents.length === 0) {
                console.log("No images found in the folder.");
                return {};
            }
    
            // Initialize an empty object to hold our image URLs organized by size
            let imagesBySize = {
                "100": "",
                "132": "",
                "174": "",
                "228": "",
                "300": "",
                "default": "", // This will be the URL for the 300.webp image
            };
    
            // Iterate over each object in the folder, assuming the file names directly indicate the size
            for (const { Key } of listedObjects.Contents) {
                const fileName = Key.split('/').pop(); // Extract the file name
                const size = fileName.split('.')[0]; // Extract the size part of the file name
                // Generate a signed URL for the image
                const imageUrl = await this.getImageUrl(Key);
                
                // Check if the size is one we're organizing by and assign the URL
                if (imagesBySize.hasOwnProperty(size)) {
                    imagesBySize[size] = imageUrl;
                }
            }
    
            // Set the default image URL to be the one for "300.webp"
            imagesBySize.default = imagesBySize["300"];
    
            
            return imagesBySize;
        } catch (error) {
            console.error("Error generating image URLs:", error);
            throw error;
        }
    }
    
    
    async uploadFileToS3(filePath, s3Key) {
        const fileContent = fs.readFileSync(filePath);
        const params = {
            Bucket: this.bucketName,
            Key: s3Key,
            Body: fileContent,
        };
        return this.s3.upload(params).promise();
    }

    async getAllImageURLs() {
        try {
            const listParams = {
                Bucket: this.bucketName,
                Prefix: 'images/', // List all objects under the 'images/' folder
            };
    
            const sizeMap = {
                '100': 'extrasmall',
                '132': 'small',
                '174': 'medium',
                '228': 'large',
                '300': 'extralarge',
            };
    
            const listedObjects = await this.s3.listObjectsV2(listParams).promise();
            
            // Temporary structure to group images by itemId and imageName
            const imagesGroupedByItemAndName = {};
    
            for (const { Key } of listedObjects.Contents) {
                // Split the key to extract itemId, imageName, and image size
                const keyParts = Key.split('/');
                if (keyParts.length < 4) continue; // Ensure the key has the expected structure
                
                const itemId = keyParts[1];
                const imageName = keyParts[2];
                const fileName = keyParts[3];
                const sizeKey = fileName.split('.')[0]; // Extract size from the filename
                const sizeWord = sizeMap[sizeKey] || 'unknown'; // Map the numeric size to a descriptive word
                
                // Generate a signed URL for the image
                const imageUrl = await this.getImageUrl(Key);
                
                // Initialize the structure for this item if it doesn't exist
                if (!imagesGroupedByItemAndName[itemId]) {
                    imagesGroupedByItemAndName[itemId] = {};
                }
    
                // Initialize the structure for this image if it doesn't exist
                if (!imagesGroupedByItemAndName[itemId][imageName]) {
                    imagesGroupedByItemAndName[itemId][imageName] = {
                        itemId,
                        imageName,
                        imageUrls: {}, // Prepare to fill with size descriptors
                    };
                }
                
                // Assign the URL to the size descriptor
                imagesGroupedByItemAndName[itemId][imageName].imageUrls[sizeWord] = imageUrl;
    
                // Set the 'default' key to point to the 'extrasmall' version (or '300' version explicitly)
                imagesGroupedByItemAndName[itemId][imageName].imageUrls['default'] = imagesGroupedByItemAndName[itemId][imageName].imageUrls['extrasmall'] || imageUrl;
            }
    
            // Flatten the structure into an array of items with their images
            const allImageURLs = [];
            Object.keys(imagesGroupedByItemAndName).forEach(itemId => {
                Object.values(imagesGroupedByItemAndName[itemId]).forEach(image => {
                    allImageURLs.push({
                        itemId: image.itemId,
                        imageUrls: image.imageUrls,
                    });
                });
            });
    
            console.log('Retrieved all image URLs successfully.');
            return allImageURLs;
        } catch (error) {
            console.error("Error retrieving all image URLs:", error);
            throw error;
        } finally {
        }
    }
    

    
    
    
    
}

module.exports = S3Service;
