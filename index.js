const express = require('express')
const app = express()
const cors = require('cors');
const Database = require('better-sqlite3');
const port = 3002;
const { createCanvas, loadImage } = require('canvas');

let db = new Database('coins.db');

function getData(id){
  const results = db.prepare(`SELECT * from 'coins' WHERE coins.ID == ${id};`).all();
  return results;
}

function getInventory(id){
  const results = db.prepare(`SELECT * from 'inventory' JOIN 'items' ON inventory.Item == items.ID WHERE inventory.User == ${id};`).all();
  return results;
}

function updateBanner(id){
  // Get user data
  const count = getData(id)[0];
        console.log(count);
  const inventory = getInventory(id).map(row => row.Name);
  // Draw the basic banner
  const canvas = createCanvas(800,200);
  const ctx = canvas.getContext('2d');
  loadImage('./coinbanner.png').then((image) =>{
    ctx.drawImage(image, 0, 0, 800, 200);
    ctx.font = "48px Arial";

    //Add item: Times New Roman Font
    if(inventory.includes("Times New Roman Font")) ctx.font = "48px Times New Roman";
    
    ctx.textAlign = "center";
    ctx.fillText(count.Coins, 642, 109);
    ctx.font = "24px Arial";
    
    //Add item: Times New Roman Font
    if(inventory.includes("Times New Roman Font")) ctx.font = "24px Times New Roman";

    ctx.textAlign = "right";
    ctx.fillText(count.Name, 600, 195)

    // Add item: Bone
    if(inventory.includes("Bone")) console.log("Found bone.")
    // Add item: Fancy Collar
    if(inventory.includes("Fancy Collar")) console.log("Found fancy collar.")
    // Add item: Golden Bone
    if(inventory.includes("Golden Bone")) db.prepare(`UPDATE 'coins' SET Coins = Coins + 1 WHERE 'coins'.ID = ${count.ID}`).run();

    // Write final changes
    const fs = require('fs');
    const out = fs.createWriteStream(__dirname + `/public/banner/${count.ID}.png`);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () => console.log('Image has been processed.'));
  })
}

app.get('/api/:id', (req, res) => {
  try {
    res.json(getData(req.params.id))
    updateBanner(req.params.id)
  } catch(err) {
    console.error('Invalid ID: ', err.message);
  }
})

app.post('/api/:id', (req, res) =>{ 
  try {
    const count = getData(req.params.id)[0]
    const update = db.prepare(`UPDATE 'coins' SET Coins = Coins + 1 WHERE 'coins'.ID = ${count.ID}`).run();
    updateBanner(count.ID)
    res.json(count);
    
  } catch(err) {
    console.error('Invalid ID: ', err.message);
  }
})

app.use(express.static('public'))

app.listen(port, () => {
  console.log(`Coin counting API listening on port ${port}`)
})
