const fs = require('fs');
const sql = require('mssql');
const cors = require('cors');
const mysql = require('mysql');
const https = require('https');
const axios = require('axios');
const Client = require('ftp');
const express = require('express');
const wooProps = require('./config/wooParams');
const dbconfig = require('./config/DB');
const cProps900 = require('./config/ftpParams');
const cProps800 = require('./config/ftpParams800');
const cProps400 = require('./config/ftpParams400');
const bodyParser = require('body-parser');
const WooCommerceAPI = require('woocommerce-api');
const cousindbconfig = require('./config/CousinDB');

const app = express();
//const WooCommerce = new WooCommerceAPI( wooProps );

app.use(bodyParser.urlencoded({ extended: false}));
app.use(cors());
app.use(express.static('public'));

app.set('view engine', 'pug');

app.listen(process.env.PORT || 3000, () => {
  console.log('The application is running the product sync.');
});

//require('./routes')(app);


app.get('/', (req, res) => {
  res.render('index-2');
});
/*
app.get('/about', (req, res) => {
  res.render('card', {prompt: "Guys"});
});

app.get('/hello', (req, res) => {
  res.render('hello');
});

app.post('/hello', (req, res) => {
  res.render('hello', { name: req.body.username });
});

app.get('/save-old', function (req, res) {
  fs.writeFile('log.txt', 'This is my text', function (err) {
    if (err) throw err;
    console.log('Replaced!');
    res.send('Replaced!');
  });
});

app.use(express.json());
var jsonParser = bodyParser.json(); 
var urlencodedParser = bodyParser.urlencoded({ extended: true });
app.post('/save', urlencodedParser, function (req, res) {
  console.log(req.body);
  var jsonthing = req.body;

  fs.writeFile('log.json', JSON.stringify(jsonthing), function (err) {
    if (err) throw err;
    console.log('Replaced!');
    res.send('Replaced!');
  });
});

app.get('/loadorders', function (req, res) {
  var pendingOrders = fs.readFileSync('log.json', 'utf-8');
  pendingOrders = JSON.parse(pendingOrders);
  res.send(pendingOrders);
});
*/
app.get('/getprods', function (req, res) {
  getProducts();
});
app.get('/getprods400', function (req, res) {
  getProducts400();
});
app.get('/getprods800', function (req, res) {
  getProducts800();
});
app.get('/getNewProducts', function (req,res) {
  getNewProducts();
});
/*
app.get('/customerData/:customerName', function (req, res) {
  var cust = req.params.customerName;
  console.log(cust);

  console.log(usernameToNumber(cust));
  //console.log(data);

  setTimeout(function(){ console.log(usernameToNumber(cust));}, 2000);
  //console.log(usernameToNumber(cust));
  //res.send(data);
});
*/



//Building the CousinDIY Queries
var diyColumns = "SELECT vItemNumber, vLocation, vDescription, vShortDesc, vLook, vGenColor, vGenMaterial, vGenItemType, vSizeType, vShape, vDimensions, vPcCounts, vKeywords, vSorting, itemprice_1, itemprice_2, quantityonhand ";
var diyFrom    = "FROM dbo.CCA_ITEM_DESCRIPTIONS LEFT JOIN dbo.SWCCSSTOK ON dbo.CCA_ITEM_DESCRIPTIONS.vItemNumber = dbo.SWCCSSTOK.stocknumber AND dbo.CCA_ITEM_DESCRIPTIONS.vLocation = locationnumber ";
var diyWhere1  = "WHERE (vLocation = '900' and vShowOnSite = 'Y' and (dbo.SWCCSSTOK.quantityonhand - (dbo.SWCCSSTOK.quantitycommitted + dbo.SWCCSSTOK.qtyonbackorder + dbo.SWCCSSTOK.qtyinuse)) > 25) ";
var diyWhere2  = "OR (vLocation = '900' and vShowOnSite = 'Y' and (vGenItemType LIKE '%bundle%' OR vLook LIKE '%bundle%' OR vLook LIKE '%Beadalon%' OR vItemNumber = '34719038'))";
var missPic = `where vlocation = '900' and
vitemnumber in (
)`;

function getProducts() {
  sql.connect(dbconfig).then(pool =>  {
    //const request = new sql.Request();
    return pool.request()
    .query(diyColumns + diyFrom + diyWhere1 + diyWhere2);
  }).then(result => {
      items = JSON.stringify(result.recordset);
			items = JSON.parse(items.replace(/"\s+|\s+"/g,'"'));
			Object.keys(items).forEach (function (k) {

        items[k].imagefilename = "https://www.cousindiy.com/diyimages/" + items[k].vItemNumber + ".jpg, https://www.cousindiy.com/diyimages/" + items[k].vItemNumber + "-2.jpg, https://www.cousindiy.com/diyimages/" + items[k].vItemNumber + "-3.jpg, https://www.cousindiy.com/diyimages/" + items[k].vItemNumber + "-4.jpg, https://www.cousindiy.com/diyimages/" + items[k].vItemNumber + "-5.jpg, https://www.cousindiy.com/diyimages/" + items[k].vItemNumber + "-6.jpg, https://www.cousindiy.com/diyimages/" + items[k].vItemNumber + "-7.jpg, https://www.cousindiy.com/diyimages/" + items[k].vItemNumber + "-8.jpg, https://www.cousindiy.com/diyimages/" + items[k].vItemNumber + "-9.jpg";
        
        var lookAttr = items[k].vLook.split(",");
        items[k].lookAttr = lookAttr[0];

        var funcAttr = items[k].vGenItemType.split(",");
        items[k].funcAttr = funcAttr[0];

        var materialAttr = items[k].vGenMaterial.split(",");
        items[k].materialAttr = materialAttr[0];

        // items[k].vLook = items[k].vLook + ", Sale";
			});
      fs.writeFile('900/items900.json', JSON.stringify(items), 'utf8', (error) => {
        if (error)
          console.log(error);
        
        const Json2csvTransform = require('json2csv').Transform;
        const fields = ["vItemNumber", "vLocation", "vDescription", "vShortDesc", "vLook", "vGenColor", "vGenMaterial", "vGenItemType", "vSizeType", "vShape", "vDimensions", "vPcCounts", "vKeywords", "vSorting", "itemprice_1", "itemprice_2", "quantityonhand", "imagefilename", "lookAttr", "funcAttr", "materialAttr"];
        const opts = { fields };
        const transformOpts = { highWaterMark: 16384, encoding: 'utf-8' };
        const input = fs.createReadStream('900/items900.json', { encoding: 'utf8' });
        const output = fs.createWriteStream('900/items900.csv', { encoding: 'utf8' });
        const json2csv = new Json2csvTransform(opts, transformOpts);
        const processor = input.pipe(json2csv).pipe(output);
        json2csv
          .on('header', header => console.log(header))
          //.on('line', line => console.log(line))
          .on('error', err => console.log(err));
        console.log("JSON has been created.");
      });
    var c = new Client();
    c.on('ready', function() {
      c.put('900/items900.csv', 'item900-remote.csv', function(err) {
        if (err) throw err;
        c.end();
        console.log("CSV has been created.");
        
      });
    });
    c.connect(cProps900);
    
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





//Building the LJ Queries
var ljColumns = "SELECT vItemNumber, vLocation, vDescription, vShortDesc, vLook, vGenColor, vGenItemType, vMetalColor, vSizeType, vSorting, vKeywords, vAggregation, vMaterialDesc, vFeatureDesc, vDetailDesc, vFeaturedItem, itemprice_1, itemprice_2, vEvents, vOnSale, orderynpdxam, quantityonhand, quantitycommitted, qtyonbackorder, qtyinuse ";
var ljFrom    = "FROM dbo.CCA_ITEM_DESCRIPTIONS LEFT JOIN dbo.SWCCSSTOK ON vItemNumber = stocknumber AND vLocation = locationnumber ";
var ljWhere1  = "WHERE vLocation = '800' and vShowOnSite = 'Y' ORDER BY vSorting ASC";
//var ljWhere2  = "OR (vLocation = '800' and vShowOnSite = 'Y' and vGenItemType LIKE '%program%' OR vGenItemType LIKE '%assortment%') ORDER BY vSorting ASC";
var missPiJKKJBc = `where vlocation = '800' and
vitemnumber in (
)`;


function getProducts800() {
  sql.connect(dbconfig).then(pool => {
  return pool.request()
    .query(ljColumns + ljFrom + ljWhere1);
  }).then(result => {
      items = JSON.stringify(result.recordset);
      items = JSON.parse(items.replace(/"\s+|\s+"/g,'"'));
      Object.keys(items).forEach (function (k) {

        items[k].vEvents = " ";
        items[k].qtyinstock = "";

        //Code for aggregation
        if (items[k].vSizeType !== null && items[k].vSizeType !== "") {
          items[k].vAggregation = items[k].vAggregation + "-agg";		
        } else  {
          items[k].vAggregation = " ";
        }

        //Code for specials 
        if (items[k].vOnSale == 'Y') {
          items[k].vLook = " ";
          items[k].vGenItemType = items[k].vGenItemType + "-SP";

          items[k].vEvents = "Specials";

          items[k].salePriceWhol = items[k].itemprice_1;
          items[k].salePriceRetail = items[k].itemprice_2;

          items[k].itemprice_1 = (items[k].itemprice_1 + 15).toFixed(2);
          items[k].itemprice_2 = (items[k].itemprice_2 + 15).toFixed(2);
        } else {
          items[k].salePriceWhol = " ";
          items[k].salePriceRetail = " ";
        }

        if (items[k].vFeaturedItem == 'Y') {
          items[k].vEvents = items[k].vEvents + "New,";
        }
        
        if(Array.isArray(items[k].vLook)) {
          var lookAttr = items[k].vLook.split(",");
          items[k].lookAttr = lookAttr[0];
        }

        if (items[k].vGenItemType !== null) {
          var funcAttr = items[k].vGenItemType.split(",");
          items[k].funcAttr = funcAttr[0];
        }

        if ( items[k].orderynpdxam === 'M') {
          items[k].qtyinstock = '15';
        } else {
          items[k].qtyinstock = (items[k].quantityonhand - (items[k].quantitycommitted + items[k].qtyonbackorder + items[k].qtyinuse));
        }
        
      });
      fs.writeFile('800/items800.json', JSON.stringify(items), 'utf8', (error) => {
        if (error)
          console.log(error);
        
        const Json2csvTransform = require('json2csv').Transform;
        const fields = ["vItemNumber", "vLocation", "vDescription", "vShortDesc", "vLook", "vGenColor", "vGenItemType", "vMetalColor", "vSizeType", "vSorting", "vKeywords", "vAggregation", "vMaterialDesc", "vFeatureDesc", "vDetailDesc", "vFeaturedItem", "itemprice_1", "itemprice_2", "vEvents", "vOnSale", "salePriceWhol", "salePriceRetail", "lookAttr", "funcAttr", "qtyinstock"];
        const opts = { fields };
        const transformOpts = { highWaterMark: 16384, encoding: 'utf-8' };
        const input = fs.createReadStream('800/items800.json', { encoding: 'utf8' });
        const output = fs.createWriteStream('800/items800.csv', { encoding: 'utf8' });
        const json2csv = new Json2csvTransform(opts, transformOpts);
        const processor = input.pipe(json2csv).pipe(output);
        json2csv
        //  .on('header', header => console.log(header))
        //  .on('line', line => console.log(line))
          .on('error', err => console.log(err));
        console.log("JSON has been created.");
      });
  }).then(() => {
    var c = new Client();
    c.on('ready', function() {
      c.put('800/items800.csv', 'items800-remote.csv', function(err) {
        if (err) throw err;
        c.end();
        console.log("CSV has been created.");
      });
    });
    c.connect(cProps800);
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



//Building the new item Cosmo Queries
var newDiyColumns = "SELECT TOP 40 vItemNumber, vLocation, vDescription, vShortDesc, vLook, vGenColor, vGenMaterial, vGenItemType, vSizetype, vKeywords, vSorting, itemprice_1, itemprice_2, quantityonhand ";
var newDiyFrom    = "FROM dbo.CCA_ITEM_DESCRIPTIONS LEFT JOIN dbo.SWCCSSTOK ON dbo.CCA_ITEM_DESCRIPTIONS.vItemNumber = dbo.SWCCSSTOK.stocknumber AND dbo.CCA_ITEM_DESCRIPTIONS.vLocation = locationnumber ";
var newDiyWhere1  = "WHERE (vLocation = '900' and vShowOnSite = 'Y' and (dbo.SWCCSSTOK.quantityonhand - (dbo.SWCCSSTOK.quantitycommitted + dbo.SWCCSSTOK.qtyonbackorder + dbo.SWCCSSTOK.qtyinuse)) > 10) ";
var newDiyWhere2  = "OR (vLocation = '900' and vShowOnSite = 'Y' and vGenItemType LIKE '%bundle%' OR vLook LIKE '%bundle%' OR vLook LIKE '%Beadalon%' OR vItemNumber = '34719038') ORDER BY vDateAdded DESC";

function getNewProducts() {
  sql.connect(dbconfig).then(pool =>  {
    //const request = new sql.Request();
    return pool.request() 
    .query(newDiyColumns + newDiyFrom + newDiyWhere1 + newDiyWhere2);
  }).then(result => {
      items = JSON.stringify(result.recordset);
			items = JSON.parse(items.replace(/"\s+|\s+"/g,'"'));
			Object.keys(items).forEach (function (k) {
        items[k].imagefilename = "https://www.cousindiy.com/diyimages/" + items[k].vItemNumber + ".jpg, https://www.cousindiy.com/diyimages/" + items[k].vItemNumber + "-2.jpg, https://www.cousindiy.com/diyimages/" + items[k].vItemNumber + "-3.jpg, https://www.cousindiy.com/diyimages/" + items[k].vItemNumber + "-4.jpg, https://www.cousindiy.com/diyimages/" + items[k].vItemNumber + "-5.jpg";
        var lookAttr = items[k].vLook.split(",");
        items[k].lookAttr = lookAttr[0];

        var funcAttr = items[k].vGenItemType.split(",");
        items[k].funcAttr = funcAttr[0];

        var materialAttr = items[k].vGenMaterial.split(",");
        items[k].materialAttr = materialAttr[0];

        items[k].vLook = items[k].vLook + ", New";
			});
      fs.writeFile('900/item900.json', JSON.stringify(items), 'utf8', (error) => {
        if (error)
          console.log(error);
        
        const Json2csvTransform = require('json2csv').Transform;
        const fields = ["vItemNumber", "vLocation", "vDescription", "vShortDesc", "vLook", "vGenColor", "vGenMaterial", "vGenItemType", "vSizeType", "vKeywords", "vSorting", "itemprice_1", "itemprice_2", "quantityonhand", "imagefilename", "lookAttr", "funcAttr", "materialAttr"];
        const opts = { fields };
        const transformOpts = { highWaterMark: 16384, encoding: 'utf-8' };
        const input = fs.createReadStream('900/item900.json', { encoding: 'utf8' });
        const output = fs.createWriteStream('900/item900.csv', { encoding: 'utf8' });
        const json2csv = new Json2csvTransform(opts, transformOpts);
        const processor = input.pipe(json2csv).pipe(output);
        json2csv
          .on('header', header => console.log(header))
          //.on('line', line => console.log(line))
          .on('error', err => console.log(err));
        console.log("JSON has been created.");
      });
  }).then(() => {
    var c = new Client();
    c.on('ready', function() {
      c.put('900/item900.csv', 'item900-remote.csv', function(err) {
        if (err) throw err;
        c.end();
        console.log("CSV has been created.");
      });
    });
    c.connect(cProps900);
    
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




// access token

//    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

