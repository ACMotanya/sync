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

require('./routes/routes.js')(app);


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
    .query("SELECT dbo.CCA_ITEM_DESCRIPTIONS.vItemNumber AS vItemNumber, dbo.CCA_ITEM_DESCRIPTIONS.vLocation AS vLocation, dbo.CCA_ITEM_DESCRIPTIONS.vDescription AS vDescription, dbo.CCA_ITEM_DESCRIPTIONS.vShortDesc AS vShortDesc, dbo.CCA_ITEM_DESCRIPTIONS.vLook AS vLook, dbo.CCA_ITEM_DESCRIPTIONS.vLaunchSeason AS vLaunchSeason, dbo.CCA_ITEM_DESCRIPTIONS.vGenColor AS vGenColor, dbo.CCA_ITEM_DESCRIPTIONS.vGenItemType AS vGenItemType, dbo.CCA_ITEM_DESCRIPTIONS.vSizeType AS vSizetype, dbo.CCA_ITEM_DESCRIPTIONS.vMetalColor AS vMetalColor, dbo.CCA_ITEM_DESCRIPTIONS.vDimensions AS vDimensions, dbo.CCA_ITEM_DESCRIPTIONS.vKeywords AS vKeywords, dbo.CCA_ITEM_DESCRIPTIONS.vOnSale AS vOnSale, dbo.CCA_ITEM_DESCRIPTIONS.vFeaturedItem AS vFeaturedItem,  dbo.CCA_ITEM_DESCRIPTIONS.vSorting AS vSorting, dbo.CCA_ITEM_DESCRIPTIONS.vAggregation AS vAggregation, dbo.CCA_ITEM_DESCRIPTIONS.vLastUpdated AS vLastUpdated, dbo.CCA_ITEM_DESCRIPTIONS.vDetailDesc    AS vDetailDesc, dbo.CCA_ITEM_DESCRIPTIONS.vFeatureDesc   AS vFeatureDesc, dbo.CCA_ITEM_DESCRIPTIONS.vMaterialDesc AS vMaterialDesc, dbo.CCA_ITEM_DESCRIPTIONS.vShowOnSite AS vShowOnSite, dbo.SWCCSSTOK.itemprice_1 AS itemprice_1, dbo.SWCCSSTOK.itemprice_2 AS itemprice_2, dbo.SWCCSSTOK.quantityonhand AS quantityonhand FROM dbo.CCA_ITEM_DESCRIPTIONS LEFT JOIN dbo.SWCCSSTOK ON dbo.CCA_ITEM_DESCRIPTIONS.vItemNumber = dbo.SWCCSSTOK.stocknumber AND dbo.CCA_ITEM_DESCRIPTIONS.vLocation = dbo.SWCCSSTOK.locationnumber WHERE dbo.CCA_ITEM_DESCRIPTIONS.vShowOnSite = 'Y' AND dbo.CCA_ITEM_DESCRIPTIONS.vLocation = '800'");
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



//var connection = mysql.createConnection(cousindbconfig);

function updateDescQuery() {
	connection.connect();
  var sortdata = fs.readFileSync('800items_swdb.js', 'utf-8');
  sortdata = JSON.parse(sortdata);

  Object.keys(sortdata).forEach(function (k) {
  	connection.query("UPDATE `CousinDB`.`CCA_ITEM_DESCRIPTIONS` set vLook = '" + sortdata[k].vLook + "', vgencolor = '" + sortdata[k].vGenColor + "', vLaunchSeason = '" + sortdata[k].vLaunchSeason + "', vgenmaterial = '" + sortdata[k].vGenMaterial + "', vgenitemtype = '" + sortdata[k].vGenItemType + "',  vsizetype = '" + sortdata[k].vSizetype + "',  vmetalcolor = '" + sortdata[k].vMetalColor + "',  vdimensions = '" + sortdata[k].vDimensions + "', vonsale = '" + sortdata[k].vOnSale + "',  vfeatureditem = '" + sortdata[k].vFeaturedItem + "', vsorting = '" + sortdata[k].vSorting + "', vaggregation = '" + sortdata[k].vAggregation + "', vDetailDesc = '" + sortdata[k].vDetailDesc + "', vFeatureDesc = '" + sortdata[k].vFeatureDesc + "', vLastUpdated = '" + sortdata[k].vLastUpdated + "', vShowOnSite = '" + sortdata[k].vShowOnSite + "' WHERE vItemnumber = '" + sortdata[k].vItemNumber + "' and vlocation = '800'", (error, results, fields) => {
  		if (error) throw error;
    });
  });
  /*
 Object.keys(sortdata).forEach(function (k) {
  connection.query("UPDATE `CousinDB`.`SWCCSSTOK` set quantityonhand = '" + sortdata[k].quantityonhand + "', itemprice_2 = '" + sortdata[k].itemprice_2 + "', itemprice_1 = '" + sortdata[k].itemprice_1 + "' WHERE stocknumber = '" + sortdata[k].vItemNumber + "' and locationnumber = '800'", (error, results, fields) => {
    if (error) throw error;
  });
  
});
*/
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
    "meta_data": [{
      "key": "_role_based_price",
      "value": {
        "0": {
          "wholesale_customer": {
            "regular_price": "8.7500"
          },
          "customer": {
            "regular_price": "19.9900"
          },
          "administrator": {
            "regular_price": "19.9900"
          },
          "logedout": {
            "regular_price": "19.9900"
          }
        }
      }
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

testing2();
//var cntr = 0;
//var idx = 0;
/*
var itemdata = fs.readFileSync('oldevents.js', 'utf-8');
itemdata = JSON.parse(itemdata);
itemdata = JSON.parse(itemdata[0]);
//console.log(itemdata);

newdata = [];
Object.keys(itemdata).forEach (function (k) {
  go_in = [];
  sku = itemdata[k].sku.toString();
  cats = JSON.stringify(itemdata[k].categories);
  go_in.push(sku, cats);
  
  //newdata.push(go_in);
  fs.appendFile("slimoldevents.js", go_in, function(err){
    if(err) throw err;
    console.log('IT IS WRITTEN');
  });
});
*/
//var itemdata = fs.readFileSync('prod_id.js', 'utf-8');
//itemdata = JSON.parse(itemdata);
//console.log( itemdata[idx].vItemNumber);


function assignCats()
{
  setTimeout( function() {
    WooCommerce.get("products/" + itemdata[idx].id + "", function(err, data, res){
     
      result = JSON.parse(res);
    
      console.log(result.sku);
      go_in = [];
      sku = JSON.stringify(result.sku);
    
      cats = JSON.stringify(result.categories);
      go_in.push(sku, cats);
    
      fs.appendFile("oldevents.js", go_in, function(err){
        if(err) throw err;
        console.log('IT IS WRITTEN');
      });
     
      console.log(idx);
      idx++;
      cntr++;
      if (cntr <= itemdata.length) {
        assignCats();
      }
    });
  }, 1000);
}
//assignCats();
//newset = [];
/*
var itemdata = fs.readFileSync('newevents.js', 'utf-8');
itemdata = JSON.parse(itemdata);

var eventdata = fs.readFileSync('prod_id.js', 'utf-8');
eventdata = JSON.parse(eventdata);


Object.keys(itemdata).forEach (function (k) {
  sku = itemdata[k].sku;

 //sku = sku.slice(0, sku.indexOf("--"));
  Object.keys(eventdata).forEach (function (m) {
    item = eventdata[m].sku;
    eventcat = eventdata[m].id;
    if (sku === item ){
      
        itemdata[k].id = eventcat;
    
    }
  });
  console.log(itemdata[k]);
  newset.push(itemdata[k]);
});

setTimeout( function() {

fs.writeFile("newevents2.js", JSON.stringify(newset), function(err){
});

}, 4000);
*/


//var itemdata = fs.readFileSync('newevents2.js', 'utf-8');
//itemdata = JSON.parse(itemdata);

function assignNewCats()
{
  setTimeout( function() {
     data = {categories :  itemdata[idx].categories};
    WooCommerce.put("products/" + itemdata[idx].id + "",data,  function(err, data, res){
     
      result = JSON.parse(res);
    
      console.log(result.categories);
      
     
      console.log(idx);
      idx++;
      cntr++;
      if (cntr <= itemdata.length) {
        assignNewCats();
      }
    });
  }, 1000);
}


//assignNewCats();


