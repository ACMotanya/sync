const fs = require('fs');
const sql = require('mssql');
const cors = require('cors');
const mysql = require('mysql');
const https = require('https');
const axios = require('axios');
const cProps = require('./config/ftpParams');
const express = require('express');
const wooProps = require('./config/wooParams');
const dbconfig = require('./config/DB');

const bodyParser = require('body-parser');
const WooCommerceAPI = require('woocommerce-api');
const cousindbconfig = require('./config/CousinDB');

const app = express();
const WooCommerce = new WooCommerceAPI( wooProps );

app.use(bodyParser.urlencoded({ extended: false}));
app.use(cors());
app.use(express.static('public'));

app.set('view engine', 'pug');

app.listen(3000, () => {
  console.log('The application is running the product sync.');
});

app.get('/', (req, res) => {
  res.render('index-2');
});

app.get('/about', (req, res) => {
  res.render('card', {prompt: "Guys"});
});

app.get('/hello', (req, res) => {
  res.render('hello');
});

app.post('/hello', (req, res) => {
  res.render('hello', { name: req.body.username });
});

app.get('/save', function (req, res) {
  fs.writeFile('log.txt', 'This is my text', function (err) {
    if (err) throw err;
    console.log('Replaced!');
    res.send('Replaced!');
  });
});

app.get('/getprods', function (req, res) {
  getProducts();
});

app.get('/getljevents', function (req, res) {
  getljevents();
});

app.get('/swdb800info', function (req, res) {
  getProducts800() ;
});


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


function getProducts800() {
  sql.connect(dbconfig).then(pool =>  {
    //const request = new sql.Request();
    return pool.request()
    .query("SELECT dbo.CCA_ITEM_DESCRIPTIONS.vItemNumber AS vItemNumber, dbo.CCA_ITEM_DESCRIPTIONS.vLocation AS vLocation, dbo.CCA_ITEM_DESCRIPTIONS.vDescription AS vDescription, dbo.CCA_ITEM_DESCRIPTIONS.vShortDesc AS vShortDesc, dbo.CCA_ITEM_DESCRIPTIONS.vLook AS vLook, dbo.CCA_ITEM_DESCRIPTIONS.vGenColor AS vGenColor, dbo.CCA_ITEM_DESCRIPTIONS.vGenItemType AS vGenItemType, dbo.CCA_ITEM_DESCRIPTIONS.vSizeType AS vSizetype, dbo.CCA_ITEM_DESCRIPTIONS.vMetalColor AS vMetalColor, dbo.CCA_ITEM_DESCRIPTIONS.vDimensions AS vDimensions, dbo.CCA_ITEM_DESCRIPTIONS.vKeywords AS vKeywords, dbo.CCA_ITEM_DESCRIPTIONS.vOnSale AS vOnSale, dbo.CCA_ITEM_DESCRIPTIONS.vFeaturedItem AS vFeaturedItem,  dbo.CCA_ITEM_DESCRIPTIONS.vSorting AS vSorting, dbo.CCA_ITEM_DESCRIPTIONS.vAggregation AS vAggregation, dbo.CCA_ITEM_DESCRIPTIONS.vLastUpdated AS vLastUpdated, dbo.CCA_ITEM_DESCRIPTIONS.vDetailDesc    AS vDetailDesc, dbo.CCA_ITEM_DESCRIPTIONS.vFeatureDesc   AS vFeatureDesc, dbo.CCA_ITEM_DESCRIPTIONS.vMaterialDesc AS vMaterialDesc, dbo.CCA_ITEM_DESCRIPTIONS.vShowOnSite AS vShowOnSite, dbo.SWCCSSTOK.itemprice_1 AS itemprice_1, dbo.SWCCSSTOK.itemprice_2 AS itemprice_2, dbo.SWCCSSTOK.quantityonhand AS quantityonhand FROM dbo.CCA_ITEM_DESCRIPTIONS LEFT JOIN dbo.SWCCSSTOK ON dbo.CCA_ITEM_DESCRIPTIONS.vItemNumber = dbo.SWCCSSTOK.stocknumber AND dbo.CCA_ITEM_DESCRIPTIONS.vLocation = dbo.SWCCSSTOK.locationnumber WHERE dbo.CCA_ITEM_DESCRIPTIONS.vShowOnSite = 'Y' AND dbo.CCA_ITEM_DESCRIPTIONS.vLocation = '800'");
  }).then(result => {
      items = JSON.stringify(result.recordset);
			items = JSON.parse(items.replace(/"\s+|\s+"/g,'"'));
      fs.writeFile('800items_swdb.js', JSON.stringify(items), 'utf8', (error) => {
        if (error)
          console.log(error);

        console.log("JSON has been created.");
      });
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



var connection = mysql.createConnection(cousindbconfig);

function updateDescQuery() {
	connection.connect();
  var sortdata = fs.readFileSync('800items_swdb.js', 'utf-8');
  sortdata = JSON.parse(sortdata);

  Object.keys(sortdata).forEach(function (k) {
  	connection.query("UPDATE `CousinDB`.`CCA_ITEM_DESCRIPTIONS` set vLook = '" + sortdata[k].vLook + "', vgencolor = '" + sortdata[k].vGenColor + "', vgenmaterial = '" + sortdata[k].vGenMaterial + "', vgenitemtype = '" + sortdata[k].vGenItemType + "',  vsizetype = '" + sortdata[k].vSizetype + "',  vmetalcolor = '" + sortdata[k].vMetalColor + "',  vdimensions = '" + sortdata[k].vDimensions + "', vonsale = '" + sortdata[k].vOnSale + "',  vfeatureditem = '" + sortdata[k].vFeaturedItem + "', vsorting = '" + sortdata[k].vSorting + "', vaggregation = '" + sortdata[k].vAggregation + "', vDetailDesc = '" + sortdata[k].vDetailDesc + "', vFeatureDesc = '" + sortdata[k].vFeatureDesc + "', vLastUpdated = '" + sortdata[k].vLastUpdated + "', vMaterialDesc = '" + sortdata[k].vMaterialDesc + "', vShowOnSite = '" + sortdata[k].vShowOnSite + "' WHERE vItemnumber = '" + sortdata[k].vItemNumber + "' and vlocation = '800'", (error, results, fields) => {
  		if (error) throw error;
    });
  });
}

//updateDescQuery();


function getljevents() {
  sql.connect(dbconfig).then(pool =>  {
    return pool.request()
    .query("SELECT dbo.CCA_ITEM_DESCRIPTIONS.vItemNumber AS vItemNumber, dbo.CCA_ITEM_DESCRIPTIONS.vEvents AS vEvents FROM dbo.CCA_ITEM_DESCRIPTIONS WHERE dbo.CCA_ITEM_DESCRIPTIONS.vShowOnSite = 'Y' AND dbo.CCA_ITEM_DESCRIPTIONS.vLocation = '800' AND dbo.CCA_ITEM_DESCRIPTIONS.vEvents <> ''");
  }).then(result => {
      items = JSON.stringify(result.recordset);
      items = JSON.parse(items.replace(/"\s+|\s+"/g,'"'));

      Object.keys(items).forEach (function (k) {
        var lastChar = items[k].vEvents[items[k].vEvents.length -1];
        items[k].vEvents =	items[k].vEvents.split(",");
        if (lastChar === ',')
          items[k].vEvents.pop();
			});

      fs.writeFile('ljevents.js', JSON.stringify(items), 'utf8', (error) => {
        if (error)
          console.log(error);
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



var Client = require('ftp');
var c = new Client();
c.on('ready', function() {
	c.put('items900.csv', 'items900-remote.csv', function(err) {
		if (err) throw err;
    c.end();
    console.log("CSV has been created.");
	});
});
//c.connect(cProps);


function testing() {
  var range  = [0, 1];
  range.forEach(function(i) {
    WooCommerce.get("products/categories/764" + i +"", function(err, data, res){
    // err will return any errors that occur
    // data will contain the body content from the request
    // res is the full response object, use this to get headers etc
      console.log(res);
    });
  });
}
//testing();
function testing2() {
  var exdata = {
    categories: [{"id": 7643, "name": "Holiday Party", "slug": "holiday-party"}]
  };
  var data = {
    categories: [{
      "id": 6148,
      "name": "FABRIC",
      "slug": "item_material-fabric"
    }, {
      "id": 6166,
      "name": "Green",
      "slug": "color-green"
    }, {
      "id": 6146,
      "name": "MANTRA",
      "slug": "look-mantra"
    }, {
      "id": 7313,
      "name": "Mantra Scarves V1 Assortment",
      "slug": "program_name-mantra-scarves-v1-assortment"
    }, {
      "id": 7479,
      "name": "Scarves",
      "slug": "item_type-scarves"
    }, {
      "id": 7521,
      "name": "SS17 Catalog",
      "slug": "launch_season-ss17-catalog"
    }]
  };
    WooCommerce.put("products/118521", data, function(err, data, res){
    // err will return any errors that occur
    // data will contain the body content from the request
    // res is the full response object, use this to get headers etc
    
    console.log(res);
    //console.log(err);
    });
 
}

//testing2();
var cntr = 0;
var idx = 0;

var itemdata = fs.readFileSync('ljevents.js', 'utf-8');
itemdata = JSON.parse(itemdata);

function assignCats()
{
  //Get JSON object of items with their current categories.
  setTimeout( function() {
   // Object.keys(itemdata).forEach (function (k) {
      //console.log(itemdata[k].vItemNumber);
      
      WooCommerce.get("products/?filter[sku]=" + itemdata[idx].vItemNumber + "--800_PROD", function(err, data, res){
        console.log(res);
        cntr++;
        if (cntr <= itemdata.length) {
          assignCats();
        }
      });
   // });
  }, 3000);
}
assignCats();






















