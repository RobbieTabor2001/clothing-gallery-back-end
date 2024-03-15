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
            // console.log(`Image fetched successfully.`);
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
            // console.log(`Image URL generated successfully.`);
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
            // console.log(`${s3FolderName} deleted successfully.`);
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
            // console.log(`Images in ${s3FolderName}:`, images);
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
            Prefix: `${s3FolderPath}/`,
        };
    
        try {
            const listedObjects = await this.s3.listObjectsV2(listParams).promise();
            if (listedObjects.Contents.length === 0) {
                return []; // Return an empty array if no images are found
            }
    
            // Initialize an object to hold image URLs organized by size, each with png and webp fields
            let imagesBySize = {
                extrasmall: { png: null, webp: null },
                small: { png: null, webp: null },
                medium: { png: null, webp: null },
                large: { png: null, webp: null },
                extralarge: { png: null, webp: null },
            };
    
            const twoDimensionalSizeMap = {
                '233x233': 'extrasmall',
                '308x308': 'small',
                '406x406': 'medium',
                '532x532': 'large',
                '700x700': 'extralarge',
            };
    
            for (let { Key } of listedObjects.Contents) {
                const keyParts = Key.split('/');
                const imageSize = keyParts[keyParts.length - 2];
                const imageName = keyParts[keyParts.length - 1];
                const imageSizeKey = twoDimensionalSizeMap[imageSize];
    
                if (imageSizeKey) {
                    const imageUrl = await this.getImageUrl(Key);
                    if (imageName.endsWith('.png')) {
                        imagesBySize[imageSizeKey].png = imageUrl;
                    } else if (imageName.endsWith('.webp')) {
                        imagesBySize[imageSizeKey].webp = imageUrl;
                    }
                }
            }
    
            // Convert the imagesBySize object into an array of objects as per your requirement
            const imageSizeKeys = Object.keys(imagesBySize);
            const imagesArray = imageSizeKeys.map(size => ({
                size: size,
                png: imagesBySize[size].png,
                webp: imagesBySize[size].webp,
            }));
    
            return imagesArray;
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
    
            // Structure to collect images with detailed size and format info
            const imagesCollection = {};
    
            for (const { Key } of listedObjects.Contents) {
                const keyParts = Key.split('/');
                if (keyParts.length !== 5) continue; // Ensure key has the expected structure
    
                const [_, itemId, imageName, imageSize, fileName] = keyParts;
                const imageFormat = fileName.split('.').pop();
                const sizeWord = sizeMap[imageSize];
    
                if (!sizeWord) continue; // Skip if the size does not match any known size
    
                const imageUrl = await this.getImageUrl(Key);
    
                // Create unique image identifier
                const imageId = `${itemId}-${imageName}`;
    
                // Initialize image object if not already done
                if (!imagesCollection[imageId]) {
                    imagesCollection[imageId] = {
                        itemId,
                        imageName,
                        extrasmall: { png: null, webp: null },
                        small: { png: null, webp: null },
                        medium: { png: null, webp: null },
                        large: { png: null, webp: null },
                        extralarge: { png: null, webp: null },
                    };
                }
    
                // Assign the URL to the appropriate format and size
                imagesCollection[imageId][sizeWord][imageFormat] = imageUrl;
            }
    
            // Convert to array format expected by the caller
            const allImages = Object.values(imagesCollection).map(image => {
                return {
                    itemId: image.itemId,
                    imageName: image.imageName,
                    sizes: {
                        extrasmall: image.extrasmall,
                        small: image.small,
                        medium: image.medium,
                        large: image.large,
                        extralarge: image.extralarge,
                    }
                };
            });
    
            return allImages;
        } catch (error) {
            console.error("Error retrieving all image URLs:", error);
            throw error;
        }
    }
    
    
    

    
    
    
    
}

module.exports = S3Service;
