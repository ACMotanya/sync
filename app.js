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
const WooCommerce = new WooCommerceAPI( wooProps );

app.use(bodyParser.urlencoded({ extended: false}));
app.use(cors());
app.use(express.static('public'));

app.set('view engine', 'pug');

app.listen(process.env.PORT || 3000, () => {
  console.log('The application is running the product sync.');
});

//require('./routes')(app);

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

app.get('/getprods', function (req, res) {
  getProducts();
});
app.get('/getprods400', function (req, res) {
  getProducts400();
});
app.get('/getprods800', function (req, res) {
  getProducts800();
});

app.get('/getljevents', function (req, res) {
  getljevents();
});

app.get('/swdb800info', function (req, res) {
  getProducts800();
});

app.get('/customerData/:customerName', function (req, res) {
  var cust = req.params.customerName;
  console.log(cust);

  console.log(usernameToNumber(cust));
  //console.log(data);

  setTimeout(function(){ console.log(usernameToNumber(cust));}, 2000);
  //console.log(usernameToNumber(cust));
  //res.send(data);
});

function numbertest() {
  var numbertester = 12;
  return numbertester;
}


//Building the CousinDIY Queries
var diyColumns = "SELECT vItemNumber, vLocation, vDescription, vShortDesc, vLook, vGenColor, vGenMaterial, vGenItemType, vSizetype, vKeywords, vSorting, itemprice_1, itemprice_2, quantityonhand ";
var diyFrom    = "FROM dbo.CCA_ITEM_DESCRIPTIONS LEFT JOIN dbo.SWCCSSTOK ON dbo.CCA_ITEM_DESCRIPTIONS.vItemNumber = dbo.SWCCSSTOK.stocknumber AND dbo.CCA_ITEM_DESCRIPTIONS.vLocation = locationnumber ";
var diyWhere1  = "WHERE (vLocation = '900' and vShowOnSite = 'Y' and (dbo.SWCCSSTOK.quantityonhand - (dbo.SWCCSSTOK.quantitycommitted + dbo.SWCCSSTOK.qtyonbackorder + dbo.SWCCSSTOK.qtyinuse)) > 10) ";
var diyWhere2  = "OR (vLocation = '900' and vShowOnSite = 'Y' and vGenItemType LIKE '%bundle%' OR vLook LIKE '%bundle%' OR vLook LIKE '%Beadalon%')";


function getProducts() {
  sql.connect(dbconfig).then(pool =>  {
    //const request = new sql.Request();
    return pool.request()
    .query(diyColumns + diyFrom + diyWhere1 + diyWhere2);
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
      fs.writeFile('900/items900.json', JSON.stringify(items), 'utf8', (error) => {
        if (error)
          console.log(error);
        
        const Json2csvTransform = require('json2csv').Transform;
        const fields = ["vItemNumber", "vLocation", "vDescription", "vShortDesc", "vLook", "vGenColor", "vGenMaterial", "vGenItemType", "vSizeType", "vKeywords", "vSorting", "vAggregation", "itemprice_1", "itemprice_2", "quantityonhand", "imagefilename", "lookAttr", "funcAttr", "materialAttr"];
        const opts = { fields };
        const transformOpts = { highWaterMark: 16384, encoding: 'utf-8' };
        const input = fs.createReadStream('900/items900.json', { encoding: 'utf8' });
        const output = fs.createWriteStream('900/items900.csv', { encoding: 'utf8' });
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
      c.put('900/items900.csv', 'items900-remote.csv', function(err) {
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



function getProducts800() {
  sql.connect(dbconfig).then(pool => {
  return pool.request()
    .query("SELECT vItemNumber, vLocation, vDescription, vShortDesc, vLook, vGenColor, vGenItemType, vMetalColor, vSizeType, vSorting, vKeywords, vAggregation, vMaterialDesc, vFeatureDesc, vDetailDesc, itemprice_1, itemprice_2, vEvents, vOnSale FROM dbo.CCA_ITEM_DESCRIPTIONS LEFT JOIN dbo.SWCCSSTOK ON vItemNumber = stocknumber AND vLocation = locationnumber WHERE (vLocation = '800' and vShowOnSite = 'Y' and (quantityonhand - (quantitycommitted + qtyonbackorder + qtyinuse)) > 5) OR (vLocation = '800' and vShowOnSite = 'Y' and vGenItemType LIKE '%program%' OR vGenItemType LIKE '%assortment%') ORDER BY vAggregation");
  }).then(result => {
      items = JSON.stringify(result.recordset);
      items = JSON.parse(items.replace(/"\s+|\s+"/g,'"'));
      Object.keys(items).forEach (function (k) {
        if (items[k].vAggregation !== null && items[k].vAggregation !== "") {
          items[k].vAggregation = items[k].vAggregation + "-agg";		
        }
        if (items[k].vOnSale == 'Y') {
          items[k].vEvents = items[k].vEvents + "Specials,";
        }
        
        var lookAttr = items[k].vLook.split(",");
        items[k].lookAttr = lookAttr[0];

        var funcAttr = items[k].vGenItemType.split(",");
        items[k].funcAttr = funcAttr[0];

        if (cat.indexOf(items[k].vItemNumber) !== -1) {
          items[k].vEvents = items[k].vEvents + "gemstones,";
        }
      });
      fs.writeFile('800/items800.json', JSON.stringify(items), 'utf8', (error) => {
        if (error)
          console.log(error);
        
        const Json2csvTransform = require('json2csv').Transform;
        const fields = ["vItemNumber", "vLocation", "vDescription", "vShortDesc", "vLook", "vGenColor", "vGenItemType", "vMetalColor", "vSizeType", "vSorting", "vAggregation", "vKeywords", "vMaterialDesc", "vFeatureDesc", "vDetailDesc", "itemprice_1", "itemprice_2", "vEvents", "lookAttr", "funcAttr"];
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



function getProducts400() {
  sql.connect(dbconfig).then(pool =>  {
    return pool.request()
    .query("SELECT vItemNumber, vLocation, vDescription, vShortDesc, vLook, vGenColor, vGenItemType, vMetalColor, vSizeType, vMetalType, vKeywords, vOnSale, vFeaturedItem, vSorting, vAggregation, vMaterialDesc, vFeatureDesc, vDetailDesc, itemprice_1, itemprice_2 FROM dbo.CCA_ITEM_DESCRIPTIONS LEFT JOIN dbo.SWCCSSTOK ON vItemNumber = stocknumber AND vLocation = locationnumber WHERE vLocation = '400' and vShowOnSite = 'Y' and (quantityonhand - (quantitycommitted + qtyonbackorder + qtyinuse)) > 10 ORDER BY vAggregation");
  }).then(result => {
      items = JSON.stringify(result.recordset);
			items = JSON.parse(items.replace(/"\s+|\s+"/g,'"'));
			Object.keys(items).forEach (function (k) {
        items[k].imagefilename = "https://www.cosmostylejewelry.com/CosmoImg/" + items[k].vItemNumber + ".JPG, https://www.cosmostylejewelry.com/CosmoImg/" + items[k].vItemNumber + "-2.JPG, https://www.cosmostylejewelry.com/CosmoImg/" + items[k].vItemNumber + "-3.JPG, https://www.cosmostylejewelry.com/CosmoImg/" + items[k].vItemNumber + "-4.JPG, https://www.cosmostylejewelry.com/CosmoImg/" + items[k].vItemNumber + "-5.JPG";
			});
      fs.writeFile('400/items400.json', JSON.stringify(items), 'utf8', (error) => {
        if (error)
          console.log(error);
        
        const Json2csvTransform = require('json2csv').Transform;
        const fields = ["vItemNumber", "vLocation", "vDescription", "vShortDesc", "vLook", "vGenColor", "vGenItemType", "vMetalColor", "vSizeType", "vMetalType", "vKeywords", "vOnSale", "vFeaturedItem", "vSorting", "vAggregation", "vMaterialDesc", "vFeatureDesc", "vDetailDesc", "itemprice_1", "itemprice_2", "imagefilename"];
        const opts = { fields };
        const transformOpts = { highWaterMark: 16384, encoding: 'utf-8' };
        const input = fs.createReadStream('400/items400.json', { encoding: 'utf8' });
        const output = fs.createWriteStream('400/items400.csv', { encoding: 'utf8' });
        const json2csv = new Json2csvTransform(opts, transformOpts);
        const processor = input.pipe(json2csv).pipe(output);
        json2csv
        //  .on('header', header => console.log(header))
        //  .on('line', line => console.log(line))
          .on('error', err => console.log(err));
        console.log("JSON has been created.");
      });
  }).then(() => {
   // var Client = require('ftp');
    var c = new Client();
    c.on('ready', function() {
      c.put('./400/items400.csv', 'items400-remote.csv', function(err) {
        if (err) throw err;
        c.end();
        console.log("CSV has been created.");
      });
    });
    c.connect(cProps400);
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

var custdata;
//var account;
//var accountNumber;
function usernameToNumber (username) {
  sql.connect(dbconfig).then(pool =>  {
    //const request = new sql.Request();
    return pool.request()
    .query("SELECT * FROM SWCCRCUST Left JOIN SWCCNLRQR ON RTRIM(LTRIM(dbo.SWCCRCUST.customernumber)) = RTRIM(LTRIM(dbo.SWCCNLRQR.relatedanytype)) WHERE requestorid = '" + username +"'" );
  }).then( result => {
    userdata = JSON.stringify(result.recordset);
    userdata = JSON.parse(userdata.replace(/"\s+|\s+"/g,'"'));
    //console.log(userdata);
    number = 12;
    sql.close();
    return number;
  });
}

function numbertoAccount (number) {
  sql.connect(dbconfig).then(pool =>  {
    //const request = new sql.Request();
    return pool.request()
    .query("select * from [dbo].[SWCCRCUST] where RTRIM(LTRIM(dbo.SWCCRCUST.customernumber)) = '" + number +"'" );
  }).then( result => {
    account = JSON.stringify(result.recordset);
    account = JSON.parse(account.replace(/"\s+|\s+"/g,'"'));
    sql.close();
    //console.log(account);
    return account;
  });
}

function getCustomerDetails (custdata) {

}



//getImages();


var cat = 
["11929",
"11930",
"11932",
"11935",
"11936",
"11937",
"11939",
"11940",
"11942",
"11946",
"11947",
"11949",
"11950",
"11953",
"11954",
"11955",
"11958",
"11969",
"11978",
"11981",
"11983",
"11985",
"11988",
"11991",
"11992",
"11994",
"11996",
"11997",
"11998",
"11999",
"12000",
"12001",
"12002",
"12003",
"12004",
"12005",
"12006",
"12007",
"12009",
"12010",
"12011",
"12012",
"12013",
"12014",
"12015",
"12016",
"12017",
"12018",
"12019",
"18057LBLK",
"18057LBLU",
"18057LGLD",
"18057LGRN",
"18057LPNK",
"18057LWHT",
"18058LBLK",
"18058LBLU",
"18058LGLD",
"18058LGRN",
"18058LPNK",
"18058LWHT",
"18059LBLK",
"18059LBLU",
"18059LGLD",
"18059LGRN",
"18059LPNK",
"18059LWHT",
"L181960150",
"L181960222",
"L181970123",
"L181970212",
"L181980126",
"L181980517",
"L181990106",
"L181990627",
"L182000214",
"L182000251",
"L182000515",
"L182000621",
"L182120127",
"L182120517",
"L182130220",
"L182132106",
"L182140120",
"L182140222",
"L182160123",
"L182160212",
"L182170127",
"L182170214",
"L182190120",
"L182190222",
"L182200127",
"L182200214",
"L182210214",
"L182210220",
"L182210505",
"L182210606",
"L182220127",
"L182220517",
"L182230123",
"L182230212"];