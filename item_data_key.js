// New Data Item Key


data = {
	"id": " + itemdata[idx].id + ",
	"name": "" + itemdata[idx].vShortDesc + "",
	"type": "simple",
	"status": "publish",
	'visible': "" + itemdata[idx].vShowOnSite + "",
	"featured": " + itemdata[idx].vFeatured + ",
	"catalog_visibility": "visible",
	"short_description": "" + itemdata[idx].vDescription + "",
	"sku": "" + itemdata[idx].vItemNumber + "--800_PROD",
	"price": "" + itemdata[idx].item_price2 + "",
	"price_html": "<span class=\"woocommerce-Price-amount amount\"><span class=\"woocommerce-Price-currencySymbol\">&#36;<\/span>" + itemdata[idx].item_price2 + "<\/span>",
	"categories": [{
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
	}],
	"images": [
    {
      src: "https://laurajanelle.com/ljimg/" + itemdata[idx].vItemNumber + ".jpg",
      position: 0
    },{
      src: "https://laurajanelle.com/ljimg/" + itemdata[idx].vItemNumber + "-2.jpg",
      position: 1
    },{
      src: "https://laurajanelle.com/ljimg/" + itemdata[idx].vItemNumber + "-3.jpg",
      position: 2
    },{
      src: "https://laurajanelle.com/ljimg/" + itemdata[idx].vItemNumber + "-4.jpg",
      position: 4
    }
  ],
	"attributes": [{
		"name": "Program Name",
		"position": 0,
		"visible": true,
		"variation": false,
		"options": ["" + itemdata[idx].vProgramName + ""]
	}, {
		"name": "Look",
		"position": 0,
		"visible": true,
		"variation": false,
		"options": ["" + itemdata[idx].vLook + ""]
	},  {
		"name": "Type",
		"position": 0,
		"visible": true,
		"variation": false,
		"options": ["" + itemdata[idx].vGenItemType + ""]
	}, {
		"name": "Color",
		"position": 0,
		"visible": true,
		"variation": true,
		"options": ["" + itemdata[idx].vGenColor + ""]
	}, {
		"name": "Launch Season",
		"position": 0,
		"visible": true,
		"variation": false,
		"options": ["" + itemdata[idx].vLaunchSeason + ""]
	}, {
		"name": "Metal Color",
		"position": 0,
		"visible": true,
		"variation": false,
		"options": ["" + itemdata[idx].vMetalColor + ""]
	}, {
		"name": "Size",
		"position": 0,
		"visible": true,
		"variation": false,
		"options": ["" + itemdata[idx].vSizeType + ""]
	}],
	"variations": [118523],
	"menu_order": " + itemdata[idx].vSorting + ",
	"meta_data": [{
		"key": "_enable_role_based_price",
		"value": "true"
	}, {
		"key": "_role_based_price",
		"value": {
			"0": {
				"wholesale_customer": {
					"regular_price": "" + itemdata[idx].item_price1 + ""
				},
				"customer": {
					"regular_price": "" + itemdata[idx].item_price2 + ""
				},
				"administrator": {
					"regular_price": "" + itemdata[idx].item_price2 + ""
				},
				"logedout": {
					"regular_price": "" + itemdata[idx].item_price2 + ""
				}
			}
		}
	}, {
		"id": 2392887,
		"key": "_yoast_wpseo_metakeywords",
		"value": "" + itemdata[idx].vKeywords + ""
	}, {
		"id": 2392888,
		"key": "detail_description_list",
		"value": "" + itemdata[idx].vDetailDesc + ""
	}, {
		"id": 2392889,
		"key": "feature_description_list",
		"value": "" + itemdata[idx].vFeatureDesc + ""
	}, {
		"id": 2392890,
		"key": "material_description_list",
		"value": "" + itemdata[idx].vMaterialDesc + ""
	}]
};