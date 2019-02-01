const https  = require('https');
const fs     = require('fs');
const cors   = require('cors');
const sql    = require('mssql');
const dbconfig = require('./config/DB');
const dotenv = require('dotenv').config();
const hostname = '127.0.0.1';
const port = 3000;

const server = https.createServer((req, res) => {
	res.statusCode = 200;
  //res.setHeader('Content-Type', 'text/plain');
	res.end('Hello World\n');
});

server.listen(port, hostname, () => {
  console.log(`Server running at https://${hostname}:${port}/`);
});


// PULL BACK ALL CONTACTS WITH ACCOUNT NUMBER AND SAVE IN A VARIABLE  - DONEEE
////////////////////////////////////////////////////////////////////////
/*
1) getProducts -->   Create a JSON file that will contain the data you want to import. 
2) addImages   -->   Add in the imagefilename field data for items900 JSON file. NOT REAALLLLY NEEDED
2) json2csv    -->   Export that data into a valid CSV.
3) c.connect   -->   FTP that CSV file to a location ---> DIY or Google Docs
*/

function getProducts() {
	sql.connect(dbconfig).then(() =>  {
    var request = new sql.Request();
    request.query("SELECT dbo.CCA_ITEM_DESCRIPTIONS.vItemNumber AS vItemNumber, dbo.CCA_ITEM_DESCRIPTIONS.vLocation AS vLocation, dbo.CCA_ITEM_DESCRIPTIONS.vDescription AS vDescription, dbo.CCA_ITEM_DESCRIPTIONS.vShortDesc AS vShortDesc,	dbo.CCA_ITEM_DESCRIPTIONS.vLook AS vLook, dbo.CCA_ITEM_DESCRIPTIONS.vSpecificColor AS vSpecificColor, dbo.CCA_ITEM_DESCRIPTIONS.vGenColor AS vGenColor, dbo.CCA_ITEM_DESCRIPTIONS.vGenMaterial AS vGenMaterial, dbo.CCA_ITEM_DESCRIPTIONS.vGenItemType AS vGenItemType, dbo.CCA_ITEM_DESCRIPTIONS.vShape AS vShape, dbo.CCA_ITEM_DESCRIPTIONS.vSizeType AS vSizetype, dbo.CCA_ITEM_DESCRIPTIONS.vMetalColor AS vMetalColor, dbo.CCA_ITEM_DESCRIPTIONS.vMetalType AS vMetalType, dbo.CCA_ITEM_DESCRIPTIONS.vDimensions AS vDimensions, dbo.CCA_ITEM_DESCRIPTIONS.vPcCounts AS vPcCounts, dbo.CCA_ITEM_DESCRIPTIONS.vKeywords AS vKeywords, dbo.CCA_ITEM_DESCRIPTIONS.vOnSale AS vOnSale, dbo.CCA_ITEM_DESCRIPTIONS.vFeaturedItem AS vFeaturedItem,  dbo.CCA_ITEM_DESCRIPTIONS.vSorting AS vSorting, dbo.CCA_ITEM_DESCRIPTIONS.vAggregation AS vAggregation, dbo.SWCCSSTOK.itemprice_1 AS itemprice_1, dbo.SWCCSSTOK.itemprice_2 AS itemprice_2, dbo.SWCCSSTOK.quantityonhand AS quantityonhand FROM dbo.CCA_ITEM_DESCRIPTIONS LEFT JOIN dbo.SWCCSSTOK ON dbo.CCA_ITEM_DESCRIPTIONS.vItemNumber = dbo.SWCCSSTOK.stocknumber AND dbo.CCA_ITEM_DESCRIPTIONS.vLocation = dbo.SWCCSSTOK.locationnumber WHERE dbo.CCA_ITEM_DESCRIPTIONS.vShowOnSite = 'Y' AND dbo.CCA_ITEM_DESCRIPTIONS.vLocation = '900'", (err, result) => {
      items = JSON.stringify(result.recordset);
			items = JSON.parse(items.replace(/"\s+|\s+"/g,'"'));
			Object.keys(items).forEach (function (k) {
				items[k].imagefilename = "http://www.clearancebeads.com/diyimages/" + items[k].vItemNumber + ".jpg, http://www.clearancebeads.com/diyimages/" + items[k].vItemNumber + "-2.jpg, http://www.clearancebeads.com/diyimages/" + items[k].vItemNumber + "-3.jpg, http://www.clearancebeads.com/diyimages/" + items[k].vItemNumber + "-4.jpg, http://www.clearancebeads.com/diyimages/" + items[k].vItemNumber + "-5.jpg";
				console.log(items[k]);
			//	counter++;
			});
      fs.writeFile('items900.js', JSON.stringify(items), 'utf8', (error) => {
        if (error)
          console.log(error);
        console.log("Query Complete");
      });
    });
  });
}
getProducts();

/*
const Json2csvTransform = require('json2csv').Transform;
const fields = ["vItemNumber", "vLocation", "vDescription", "vShortDesc", "vLook", "vSpecificColor", "vGenColor", "vGenMaterial", "vGenItemType", "vShape", "vSizeType", "vMetalColor", "vMetalType", "vDimensions", "vPcCounts", "vKeywords", "vOnSale", "vFeaturedItem", "vSorting", "vAggregation", "itemprice_1", "itemprice_2", "quantityonhand", "imagefilename"];
const opts = { fields };
const transformOpts = { highWaterMark: 16384, encoding: 'utf-8' };
const input = fs.createReadStream('items900.js', { encoding: 'utf8' });
const output = fs.createWriteStream('items900.csv', { encoding: 'utf8' });
const json2csv = new Json2csvTransform(opts, transformOpts);
const processor = input.pipe(json2csv).pipe(output);
json2csv
  .on('header', header => console.log(header))
  .on('line', line => console.log(line))
	.on('error', err => console.log(err));



var Client = require('ftp');
var c = new Client();
var connectionProperties = (CousinDB);

c.on('ready', function() {
	c.put('items900.csv', 'items900-remote.csv', function(err) {
		if (err) throw err;
		c.end();
	});
});
//c.connect(connectionProperties);


*/








counter = 0;
updated_json = {};
function addImages() {
	var itemdata = fs.readFileSync('items900.js', 'utf-8');
	itemdata = JSON.parse(itemdata);
	Object.keys(itemdata).forEach (function (k) {
		itemdata[k].imagefilename = "http://www.clearancebeads.com/diyimages/" + itemdata[k].vItemNumber + ".jpg, http://www.clearancebeads.com/diyimages/" + itemdata[k].vItemNumber + "-2.jpg, http://www.clearancebeads.com/diyimages/" + itemdata[k].vItemNumber + "-3.jpg, http://www.clearancebeads.com/diyimages/" + itemdata[k].vItemNumber + "-4.jpg, http://www.clearancebeads.com/diyimages/" + itemdata[k].vItemNumber + "-5.jpg";
		console.log(itemdata[k]);
		counter++;
	});

	if (counter === itemdata.length) {
		itemdata = JSON.stringify(itemdata);
		fs.writeFile("items900.js", itemdata, function(err){
			if(err) throw err;
			console.log('IS WRITTEN');
		});
		
	}
	console.log(counter);
}
//addImages();



function getProducts() {
  sql.connect(dbconfig).then(pool =>  {
    //const request = new sql.Request();
    return pool.request()
    .query("SELECT dbo.CCA_ITEM_DESCRIPTIONS.vItemNumber AS vItemNumber, dbo.CCA_ITEM_DESCRIPTIONS.vLocation AS vLocation, dbo.CCA_ITEM_DESCRIPTIONS.vDescription AS vDescription, dbo.CCA_ITEM_DESCRIPTIONS.vShortDesc AS vShortDesc,	dbo.CCA_ITEM_DESCRIPTIONS.vLook AS vLook, dbo.CCA_ITEM_DESCRIPTIONS.vSpecificColor AS vSpecificColor, dbo.CCA_ITEM_DESCRIPTIONS.vGenColor AS vGenColor, dbo.CCA_ITEM_DESCRIPTIONS.vGenMaterial AS vGenMaterial, dbo.CCA_ITEM_DESCRIPTIONS.vGenItemType AS vGenItemType, dbo.CCA_ITEM_DESCRIPTIONS.vShape AS vShape, dbo.CCA_ITEM_DESCRIPTIONS.vSizeType AS vSizetype, dbo.CCA_ITEM_DESCRIPTIONS.vMetalColor AS vMetalColor, dbo.CCA_ITEM_DESCRIPTIONS.vMetalType AS vMetalType, dbo.CCA_ITEM_DESCRIPTIONS.vDimensions AS vDimensions, dbo.CCA_ITEM_DESCRIPTIONS.vPcCounts AS vPcCounts, dbo.CCA_ITEM_DESCRIPTIONS.vKeywords AS vKeywords, dbo.CCA_ITEM_DESCRIPTIONS.vOnSale AS vOnSale, dbo.CCA_ITEM_DESCRIPTIONS.vFeaturedItem AS vFeaturedItem,  dbo.CCA_ITEM_DESCRIPTIONS.vSorting AS vSorting, dbo.CCA_ITEM_DESCRIPTIONS.vAggregation AS vAggregation, dbo.SWCCSSTOK.itemprice_1 AS itemprice_1, dbo.SWCCSSTOK.itemprice_2 AS itemprice_2, dbo.SWCCSSTOK.quantityonhand AS quantityonhand FROM dbo.CCA_ITEM_DESCRIPTIONS LEFT JOIN dbo.SWCCSSTOK ON dbo.CCA_ITEM_DESCRIPTIONS.vItemNumber = dbo.SWCCSSTOK.stocknumber AND dbo.CCA_ITEM_DESCRIPTIONS.vLocation = dbo.SWCCSSTOK.locationnumber WHERE dbo.CCA_ITEM_DESCRIPTIONS.vShowOnSite = 'Y' AND dbo.CCA_ITEM_DESCRIPTIONS.vLocation = '900'");
  }).then(result => {
      items = JSON.stringify(result.recordset);
			items = JSON.parse(items.replace(/"\s+|\s+"/g,'"'));
			Object.keys(items).forEach (function (k) {
				items[k].imagefilename = "http://www.clearancebeads.com/diyimages/" + items[k].vItemNumber + ".jpg, http://www.clearancebeads.com/diyimages/" + items[k].vItemNumber + "-2.jpg, http://www.clearancebeads.com/diyimages/" + items[k].vItemNumber + "-3.jpg, http://www.clearancebeads.com/diyimages/" + items[k].vItemNumber + "-4.jpg, http://www.clearancebeads.com/diyimages/" + items[k].vItemNumber + "-5.jpg";
			});
      fs.writeFile('items900.js', JSON.stringify(items), 'utf8', (error) => {
        if (error)
          console.log(error);
        
        const Json2csvTransform = require('json2csv').Transform;
        const fields = ["vItemNumber", "vLocation", "vDescription", "vShortDesc", "vLook", "vSpecificColor", "vGenColor", "vGenMaterial", "vGenItemType", "vShape", "vSizeType", "vMetalColor", "vMetalType", "vDimensions", "vPcCounts", "vKeywords", "vOnSale", "vFeaturedItem", "vSorting", "vAggregation", "itemprice_1", "itemprice_2", "quantityonhand", "imagefilename"];
        const opts = { fields };
        const transformOpts = { highWaterMark: 16384, encoding: 'utf-8' };
        const input = fs.createReadStream('items900.js', { encoding: 'utf8' });
        const output = fs.createWriteStream('items900.csv', { encoding: 'utf8' });
        const json2csv = new Json2csvTransform(opts, transformOpts);
        const processor = input.pipe(json2csv).pipe(output);
        json2csv
        //  .on('header', header => console.log(header))
        //  .on('line', line => console.log(line))
          .on('error', err => console.log(err));
        console.log("JSON has been created.");
      });
  }).then(() => {
    c.connect(cProps);
    
  }).then(() => {
    sql.close();
  }).catch(err => {
    // ... error checks
    console.log(err);
  });
  sql.on('error', err => {
    // ... error handler
    console.log(err);
  });
}