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
            // (`Image fetched successfully.`);
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
            // (`Image URL generated successfully.`);
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
            // (`${s3FolderName} deleted successfully.`);
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
            // (`Images in ${s3FolderName}:`, images);
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
            (s3FolderPath);
            const listedObjects = await this.s3.listObjectsV2(listParams).promise();
            if (listedObjects.Contents.length === 0) {
                return {}; // Return an empty object if no images are found
            }
    
            // Initialize an object to hold image URLs organized by size
            let imagesDetails = {
                imageName: '',
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

    async getAllImageURLs() {
        try {
            const listParams = {
                Bucket: this.bucketName,
                Prefix: 'squareimages/', // List all objects under the 'images/' folder
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
