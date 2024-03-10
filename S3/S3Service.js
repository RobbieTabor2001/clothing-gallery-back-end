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
            console.log(`Image fetched successfully.`);
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
            console.log(`Image URL generated successfully.`);
            return url;
        } catch (error) {
            console.error("Error generating image URL:", error);
            throw error;
        }
    }
    

    // Method to upload a collection of images into a folder
    async uploadFolderToS3(localFolderPath, s3FolderName) {
        // Read all files in the folder excluding subdirectories
        const files = fs.readdirSync(localFolderPath).filter(file => fs.statSync(path.join(localFolderPath, file)).isFile());
    
        let uploadPromises = files.map(async (fileName) => {
            const filePath = path.join(localFolderPath, fileName); // Full path to the file
            const fileContent = fs.readFileSync(filePath);
            const key = `${s3FolderName}/${fileName}`; // Key includes the folder name and file name
    
            const params = {
                Bucket: this.bucketName,
                Key: key,
                Body: fileContent
                 // Adjust ACL according to your needs
            };
    
            try {
                const data = await this.s3.upload(params).promise();
                console.log(`File uploaded successfully at ${data.Location}`);
                return data.Location;
            } catch (error) {
                console.error(`Error uploading file ${fileName}:`, error);
                throw error;
            }
        });
    
        try {
            const results = await Promise.all(uploadPromises);
            console.log('All files in folder uploaded successfully');
            return results; // Returns an array of URLs where the files were uploaded
        } catch (error) {
            console.error("An error occurred during folder upload:", error);
            throw error;
        }
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
            console.log(`${s3FolderName} deleted successfully.`);
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
            console.log(`Images in ${s3FolderName}:`, images);
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
    
}

module.exports = S3Service;
