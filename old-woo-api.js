

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



//g//var connection = mysql.createConnection(cousindbconfig);

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