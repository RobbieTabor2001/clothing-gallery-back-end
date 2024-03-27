const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');

class S3Service {
    constructor(s3) {
        this.s3 = s3;
        this.bucketName = process.env.AWS_S3_BUCKET;
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
                const promise = this.uploadFileToS3(localFile, s3Key).then(() => s3Key);
                uploadPromises.push(promise);
            }
        }
    
        return Promise.all(uploadPromises);
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
            // (`Image URL generated successfully.`);
            return url;
        } catch (error) {
            console.error("Error generating image URL:", error);
            throw error;
        }
    }

    async getSingleImageVersions(s3FolderPath) {
        const listParams = {
            Bucket: this.bucketName,
            Prefix: `${s3FolderPath}/`,
        };
    
        try {
            (s3FolderPath);
            const listedObjects = await this.s3.listObjectsV2(listParams).promise();
            if (listedObjects.Contents.length === 0) {
                return {}; // Return an empty object if no images are found
            }
    
            // Initialize an object to hold image URLs organized by size
            let imagesDetails = {
                small: { compressed: null, lossless: null },
                medium: { compressed: null, lossless: null },
                large: { compressed: null, lossless: null },
            };
    
            // Update twoDimensionalSizeMap to match the expected size directory names
            const sizeMap = {
                '200': 'small',
                '300': 'medium',
                '400': 'large',
            };
    
            for (let { Key } of listedObjects.Contents) {
                const keyParts = Key.split('/');
                // Extract image name, size, and format

                const imageSizeKey = sizeMap[keyParts[keyParts.length - 2]];
                const imageName = keyParts[[keyParts.length-1]] // Assuming the format IMG_NAME_size_format.webp
                const isLossless = imageName.endsWith('lossless.webp');
                const isCompressed = imageName.endsWith('compressed.webp');


                if (imagesDetails.imageName === '') {
                    imagesDetails.imageName = imageName.split('_')[0]; // Set the image name if not already set
                }
    
                if (imageSizeKey) {
                    const imageUrl = await this.getImageUrl(Key);

                    if (isLossless) {
                        imagesDetails[imageSizeKey].lossless = imageUrl;
                    } else if (isCompressed) {
                        imagesDetails[imageSizeKey].compressed = imageUrl;
                    }
                }
            }
    
            return imagesDetails;
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

    //directly pulls everything out of Images folder without params
    async getAllImageURLs() {
        try {
            const listParams = {
                Bucket: this.bucketName,
                Prefix: 'images/', // List all objects under the 'images/' folder
            };
    
            const sizeMap = {
                '200': 'small',
                '300': 'medium',
                '400': 'large',
            };
    
            const listedObjects = await this.s3.listObjectsV2(listParams).promise();
    
            // Structure to collect images with detailed size and format info
            const imagesCollection = {};
    
            for (const { Key } of listedObjects.Contents) {
                const keyParts = Key.split('/');
                if (keyParts.length !== 5) continue; // Ensure key has the expected structure
    
                const [_, itemId, imageName, imageSize, fileName] = keyParts;
                const sizeWord = sizeMap[imageSize];
    
                if (!sizeWord) continue; // Skip if the size does not match any known size
    
                const imageUrl = await this.getImageUrl(Key);
    
                // Determine if the image is lossless or compressed from the file name
                let imageQuality;
                if (fileName.includes('lossless')) {
                    imageQuality = 'lossless';
                } else if (fileName.includes('compressed')) {
                    imageQuality = 'compressed';
                } else {
                    continue; // Skip if the file name doesn't include quality information
                }
    
                // Create unique image identifier
                const imageId = `${itemId}-${imageName}`;
    
                // Initialize image object if not already done
                if (!imagesCollection[imageId]) {
                    imagesCollection[imageId] = {
                        itemId,
                        imageName,
                        small: { lossless: null, compressed: null },
                        medium: { lossless: null, compressed: null },
                        large: { lossless: null, compressed: null },
                    };
                }
    
                // Assign the URL to the appropriate quality and size
                imagesCollection[imageId][sizeWord][imageQuality] = imageUrl;
            }
    
            // Convert to array format expected by the caller
            const allImages = Object.values(imagesCollection).map(image => {
                return {
                    itemId: image.itemId,
                    imageName: image.imageName,
                    sizes: {
                        small: image.small,
                        medium: image.medium,
                        large: image.large,
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
