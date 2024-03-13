const fs = require('fs');
const { parse } = require('csv-parse');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Path to your input CSV file
const inputFilePath = 'S3ImageInfo.csv';

// Path to your output CSV file
const outputFilePath = 'ProcessedItemCSV.csv';

// CSV Writer setup
const csvWriter = createCsvWriter({
    path: outputFilePath,
    header: [
        {id: 'name', title: 'Item Name'},
        {id: 'filePaths', title: 'File Paths'},
        {id: 'description', title: 'Description'} // Added the 'description' field
    ]
});

// Read and parse the input CSV
fs.readFile(inputFilePath, (err, fileData) => {
    parse(fileData, {columns: true, trim: true}, (err, rows) => {
        if (err) {
            console.error('Error reading or parsing input CSV:', err);
            return;
        }

        // Aggregate file paths by Item Folder
        const items = {};
        rows.forEach(row => {
            const { 'File Path': filePath, 'Item Folder': itemFolder } = row;
            if (!items[itemFolder]) {
                items[itemFolder] = [];
            }
            items[itemFolder].push(filePath);
        });

        // Prepare data for the output CSV
        const outputData = Object.keys(items).map(itemName => ({
            name: itemName,
            filePaths: items[itemName].join(';'), // Concatenate file paths using semicolon
            description: '' // Set the 'description' field to an empty string for each item
        }));

        // Write the output CSV
        csvWriter.writeRecords(outputData)
            .then(() => // console.log('Output CSV file has been written successfully.'))
            .catch(err => console.error('Error writing output CSV:', err));
    });
});
