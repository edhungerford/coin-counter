const express = require('express')
const app = express()
const cors = require('cors');
const Database = require('better-sqlite3');
const port = 3002;
const { createCanvas, loadImage } = require('canvas');

function getData(database){
  let db = new Database(database);
  const results = db.prepare(`SELECT * from 'coins'`).all();
  return results;
}

function updateBanner(id){
  const count = getData('coins.db')[id];
  const canvas = createCanvas(800,200);
  const ctx = canvas.getContext('2d');
  loadImage('./coinbanner.png').then((image) =>{
    ctx.drawImage(image, 0, 0, 800, 200);
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillText(count.Coins, 642, 109);
    const fs = require('fs');
    const out = fs.createWriteStream(__dirname + `/banner/${count.ID}.png`);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () => console.log('Image has been processed.'));
  })
}

app.get('/:id', (req, res) => {
  try {
    res.json(getData('coins.db')[req.params.id])
    updateBanner(req.params.id)
  } catch(err) {
    console.error('Invalid ID: ', err.message);
  }
})

app.post('/:id', (req, res) =>{ 
  try {
    const count = getData('coins.db')[req.params.id];
    const update = db.prepare(`UPDATE 'coins' SET Coins = Coins + 1 WHERE 'coins'.ID = ${count.ID}`).all();
    updateBanner(count.ID)
    res.json(count);
    
  } catch(err) {
    console.error('Invalid ID: ', err.message);
  }
})

app.use(express.static('banner'))

app.listen(port, () => {
  console.log(`Coin counting API listening on port ${port}`)
})
