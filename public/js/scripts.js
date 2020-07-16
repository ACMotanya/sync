function startSync()
{
	$.get("http://localhost:3000/getprods/");
}

function startSync400()
{
	$.get("http://localhost:3000/getprods400/");
}

function testing()
{
	$.get("http://localhost:3000/save/");
}

function ljevents()
{
	$.get("http://localhost:3000/getljevents/");
}

function saveSWDBinfo()
{
	$.get("http://localhost:3000/getprods800/");
}

function customerData(username)
{
	$.get("http://srv-sw:8082/ace/customerdetails.php/?customer=" + username +"", function (data) {
		$(".itemTable").remove();
		custData = JSON.parse(data);
		console.log(custData);
		if (Object.keys(custData).length > 3) {
			$('.add-items-after').after('<div class="table-responsive itemTable"><table class="table table-striped"><thead><tr><th>Field</th><th>Data</th></tr></thead><tbody id="details"></tbody></table></div>');
      $(".page-header").show();  
			for (var key in custData) {
				console.log(key);
				
				if (!custData.hasOwnProperty(key)) continue;
					switch(key) {
						case "accountbalance" :
					  case "pastduebalance" :
                details = '<tr><td>' + key + '</td><td>' + "$"+custData[key] + '</td></tr>';
                break;
            default:
							details = '<tr><td>' + key + '</td><td>' + custData[key] + '</td></tr>';
					}
					
					$('#details').append(details);
				
				
			}
		}
	});
}