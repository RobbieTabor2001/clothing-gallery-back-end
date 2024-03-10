require('dotenv').config();
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const S3Service = require('./S3/S3Service'); // Adjust the path to where your S3Service file is located

// Initialize AWS S3 with your credentials
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3Service = new S3Service(s3);
const imagesDirectory = path.join(__dirname, 'Images'); // Adjust 'Images' if your directory has a different path or name

// Function to upload all folders in the Images directory
const uploadAllFoldersToS3 = async () => {
    try {
        const folders = fs.readdirSync(imagesDirectory, { withFileTypes: true })
                          .filter(dirent => dirent.isDirectory())
                          .map(dirent => dirent.name);

        for (const folderName of folders) {
            const localFolderPath = path.join(imagesDirectory, folderName);
            console.log(`Uploading folder: ${folderName}`);
            await s3Service.uploadFolderToS3(localFolderPath, folderName);
            console.log(`Successfully uploaded folder: ${folderName} to S3`);
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
};

uploadAllFoldersToS3();
