const ClothingManagementService = require('./ClothingManagement/ClothingManagementService');
const service = new ClothingManagementService();

const itemsWithImages = [
    {
      name: "WarrentonHoodie",
      description: "A comfortable hoodie in Warrenton style.",
      imagePaths: [
        'WarrentonHoodie/IMG_7167.png',
        'WarrentonHoodie/IMG_7189.png'
      ]
    },
    {
      name: "DoubleFaceBlueWhite",
      description: "A reversible hoodie with one side blue and the other white.",
      imagePaths: [
        'DoubleFaceBlueWhite/IMG_8197.png',
        'DoubleFaceBlueWhite/IMG_8198.png',
        'DoubleFaceBlueWhite/IMG_8199.png',
        'DoubleFaceBlueWhite/IMG_8200.png',
        'DoubleFaceBlueWhite/IMG_8201.png',
        'DoubleFaceBlueWhite/IMG_8202.png',
        'DoubleFaceBlueWhite/IMG_8203.png',
        'DoubleFaceBlueWhite/IMG_8204.png',
        'DoubleFaceBlueWhite/IMG_8205.png',
        'DoubleFaceBlueWhite/IMG_8206.png',
        'DoubleFaceBlueWhite/IMG_8207.png',
        'DoubleFaceBlueWhite/IMG_8214.png',
        'DoubleFaceBlueWhite/IMG_8215.png',
        'DoubleFaceBlueWhite/IMG_8216.png',
        'DoubleFaceBlueWhite/IMG_8217.png',
        'DoubleFaceBlueWhite/IMG_8218.png'
      ]
    },
    {
      name: "MarlboroRacing",
      description: "Racing themed hoodie with Marlboro branding.",
      imagePaths: [
        'MarlboroRacing/IMG_2323.png',
        'MarlboroRacing/IMG_2330.png'
      ]
    },
    {
      name: "Robbie",
      description: "Special edition hoodie designed by Robbie.",
      imagePaths: [
        'Robbie/IMG_8168.png',
        'Robbie/IMG_8179.png',
        'Robbie/IMG_8181.png'
      ]
    },
    {
      name: "Schroeder",
      description: "A collection inspired by Schroeder's style.",
      imagePaths: [
        'Schroeder/IMG_5883.png',
        'Schroeder/IMG_5909.png',
        'Schroeder/IMG_5923.png',
        'Schroeder/IMG_5952.png',
        'Schroeder/IMG_5983.png'
      ]
    }
  ];
  



async function bulkInsertItems() {
  try {
    await service.connect();
    
    for (const item of itemsWithImages) {
      const { name, description, imagePaths } = item;
      await service.insertItemWithImages({ name, description }, imagePaths);
      console.log(`Inserted ${name} with its images successfully.`);
    }
    
  } catch (error) {
    console.error("Bulk insert failed:", error);
  } finally {
    await service.disconnect();
  }
}

bulkInsertItems();
