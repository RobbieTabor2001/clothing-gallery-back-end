const { MongoClient, ObjectId } = require("mongodb");
const fs = require('fs');
const { parse } = require('csv-parse/sync');
require('dotenv').config();

//const uri = `mongodb+srv://${process.env.MONGO_ACCESS_USERID}:${process.env.MONGO_ACCESS_ACCESS_KEY}@${process.env.MONGO_CLUSTER_ADDRESS}/${process.env.MONGO_DATABASE_NAME}?retryWrites=true&w=majority&appName=${process.env.MONGO_DATABASE_NAME}`;
const uri = `mongodb+srv://${"roberttabor2001"}:${"vKZMZeVWenjgSBRQ"}@${"clothingitems.kertjvk.mongodb.net"}/${"clothingDB"}?retryWrites=true&w=majority&appName=${"clothingDB"}`;
class ClothingItemsService {
    constructor() {
        this.client = new MongoClient(uri);
        this.db = null; // Initialize this to null and set in connect method
        this.collection = null; // Initialize this to null and set in connect method
    }

    async connect() {
        try {
            await this.client.connect();
            console.log("Connected to MongoDB");
            this.db = this.client.db(process.env.MONGO_DATABASE_NAME);
            this.collection = this.db.collection("clothingItems");
        } catch (error) {
            console.error("Failed to connect to MongoDB", error);
            throw error;
        }
    }

    async disconnect() {
        try {
            await this.client.close();
            console.log("Disconnected from MongoDB");
        } catch (error) {
            console.error("Failed to disconnect from MongoDB", error);
            throw error;
        }
    }

    async insertItemsFromCSV(csvFilePath) {
        const csvData = fs.readFileSync(csvFilePath);
        const records = parse(csvData, { columns: true, skip_empty_lines: true });
        const items = records.map(record => ({
            name: record['Item Name'],
            description: record['Description'] || '',
        }));

        const result = await this.collection.insertMany(items);
        console.log(`${result.insertedCount} documents were inserted from CSV`);
    }

    async insertOneItem(item) {
        const result = await this.collection.insertOne(item);
        console.log(`A document was inserted with the _id: ${result.insertedId}`);
    }


    async updateItemById(id, updateDoc) {
        const result = await this.collection.updateOne({ _id: new ObjectId(id) }, { $set: updateDoc });
        console.log(`${result.matchedCount} document(s) matched the query. Updated ${result.modifiedCount} document(s).`);
    }

    async findAllItems() {
        const items = await this.collection.find({}).toArray();
        console.log(items);
        return items;
    }

    async findItemById(id) {
        const item = await this.collection.findOne({ _id: new ObjectId(id) });
        console.log(item);
        return item;
    }
}

module.exports = ClothingItemsService;
