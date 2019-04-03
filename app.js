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

//require('./routes/routes.js')(app);

app.get('/login', function(req, res){
  res.render('login', {
      title: 'Express Login'
  });
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
    .query("SELECT dbo.CCA_ITEM_DESCRIPTIONS.vItemNumber AS vItemNumber, dbo.CCA_ITEM_DESCRIPTIONS.vLocation AS vLocation, dbo.CCA_ITEM_DESCRIPTIONS.vDescription AS vDescription, dbo.CCA_ITEM_DESCRIPTIONS.vShortDesc AS vShortDesc,	dbo.CCA_ITEM_DESCRIPTIONS.vLook AS vLook, dbo.CCA_ITEM_DESCRIPTIONS.vSpecificColor AS vSpecificColor, dbo.CCA_ITEM_DESCRIPTIONS.vGenColor AS vGenColor, dbo.CCA_ITEM_DESCRIPTIONS.vGenMaterial AS vGenMaterial, dbo.CCA_ITEM_DESCRIPTIONS.vGenItemType AS vGenItemType, dbo.CCA_ITEM_DESCRIPTIONS.vShape AS vShape, dbo.CCA_ITEM_DESCRIPTIONS.vSizeType AS vSizetype, dbo.CCA_ITEM_DESCRIPTIONS.vMetalColor AS vMetalColor, dbo.CCA_ITEM_DESCRIPTIONS.vMetalType AS vMetalType, dbo.CCA_ITEM_DESCRIPTIONS.vDimensions AS vDimensions, dbo.CCA_ITEM_DESCRIPTIONS.vPcCounts AS vPcCounts, dbo.CCA_ITEM_DESCRIPTIONS.vKeywords AS vKeywords, dbo.CCA_ITEM_DESCRIPTIONS.vOnSale AS vOnSale, dbo.CCA_ITEM_DESCRIPTIONS.vFeaturedItem AS vFeaturedItem,  dbo.CCA_ITEM_DESCRIPTIONS.vSorting AS vSorting, dbo.CCA_ITEM_DESCRIPTIONS.vAggregation AS vAggregation, dbo.SWCCSSTOK.itemprice_1 AS itemprice_1, dbo.SWCCSSTOK.itemprice_2 AS itemprice_2, dbo.SWCCSSTOK.quantityonhand AS quantityonhand FROM dbo.CCA_ITEM_DESCRIPTIONS LEFT JOIN dbo.SWCCSSTOK ON dbo.CCA_ITEM_DESCRIPTIONS.vItemNumber = dbo.SWCCSSTOK.stocknumber AND dbo.CCA_ITEM_DESCRIPTIONS.vLocation = dbo.SWCCSSTOK.locationnumber WHERE dbo.CCA_ITEM_DESCRIPTIONS.vLocation = '900' and dbo.CCA_ITEM_DESCRIPTIONS.vShowOnSite = 'Y' and dbo.SWCCSSTOK.quantityonhand > 10");
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
			});
      fs.writeFile('items900.js', JSON.stringify(items), 'utf8', (error) => {
        if (error)
          console.log(error);
        
        const Json2csvTransform = require('json2csv').Transform;
        const fields = ["vItemNumber", "vLocation", "vDescription", "vShortDesc", "vLook", "vSpecificColor", "vGenColor", "vGenMaterial", "vGenItemType", "vShape", "vSizeType", "vMetalColor", "vMetalType", "vDimensions", "vPcCounts", "vKeywords", "vOnSale", "vFeaturedItem", "vSorting", "vAggregation", "itemprice_1", "itemprice_2", "quantityonhand", "imagefilename", "lookAttr", "funcAttr", "materialAttr"];
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
    
    var Client = require('ftp');
    var c = new Client();
    c.on('ready', function() {
      c.put('items900.csv', 'items900-remote.csv', function(err) {
        if (err) throw err;
        c.end();
        console.log("CSV has been created.");
      });
    });
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

//testing2();
var cntr = 0;
var idx = 0;
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
     WooCommerce.put("products/" + itemdata[idx].id + "", data,  function(err, data, res){
     
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


//////////////////////////////////////
/////creating the simple products/////
//////////////////////////////////////
function updateSimple() {

}



/////////////////////////////////
///// Cosmo Update Images ///////
/////////////////////////////////
function getImages() {
  setTimeout( function() {
    data = {
      images: [
        {
          src: "https://cosmostylejewelry.com/CosmoImg/" + toAdd[idx] + ".jpg",
          position: 0
        },
        {
          src: "https://cosmostylejewelry.com/CosmoImg/" + toAdd[idx] + "-2.jpg",
          position: 1
        },
        {
          src: "https://cosmostylejewelry.com/CosmoImg/" + toAdd[idx] + "-3.jpg",
          position: 2
        }
      ]
    };
   WooCommerce.put("products?filter[sku]=" + toAdd[idx] + "--400_PROD", data, function(err, data, res) {
    
     result = JSON.parse(res);
     console.log(result);
     console.log(idx);
     idx++;
     cntr++;
     if (cntr <= toAdd.length) {
       getImages();
     }
   });
  }, 1000);
}




toAdd = ["C190550209",
"C190550109",
"C190552607",
"C190560209",
"C190560109",
"C190562607",
"C190570109",
"C190572607",
"C190570209",
"C190580202",
"C190580101",
"C190582627",
"C190590109",
"C190590209",
"C190592607",
"C190630109",
"C190630209",
"C190632607",
"C190650220",
"C190650227",
"C190670209",
"C190670109",
"C190680209",
"C190680109",
"C190682607",
"C190690127",
"C190690224",
"C190760109",
"C190760209",
"C190762607",
"C190790209",
"C190792607",
"C190790109",
"C190800209",
"C190800109",
"C190810101",
"C190822627",
"C190820101",
"C190860220",
"C190860127",
"C190870109",
"C190870209",
"C190872607",
"C190880109",
"C190880209",
"C190882607",
"C190890109",
"C190890209",
"C190892607",
"C190930202",
"C190940202",
"C190940101",
"C190950109",
"C190950209",
"C190952607",
"C190960209",
"C190962607",
"C190960109",
"C190980209",
"C190980109",
"C190982607",
"C190990209",
"C190990109",
"C190992607",
"C191000209",
"C191000109",
"C191002607",
"C191010109",
"C191010209",
"C191012607",
"C190840209",
"C190840109",
"C191280209",
"C191280109",
"C191282607",
"C191300202",
"C191300101",
"C191302627",
"C191400209",
"C191400109",
"C191402607",
"C191390209",
"C191390109",
"C191392607",
"C191420209",
"C191420109",
"C191820209",
"C191820109",
"C191822607",
"C191840109",
"C191840209",
"C191842607",
"C191850209",
"C191850109",
"19055PR",
"19056PR",
"19057PR",
"19096PR",
"19068PR",
"19058PR",
"19079PR",
"19087PR",
"19142NP",
"19065BP",
"19069NP",
"19139NP",
"C19394",
"400GRG",
"113RW"];

//getImages();