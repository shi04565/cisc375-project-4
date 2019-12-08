// Built-in Node.js modules
var fs = require('fs')
var path = require('path')

// NPM modules
var express = require('express')
var sqlite3 = require('sqlite3')
var bodyParser = require('body-parser');

var public_dir = path.join(__dirname, 'public');
var template_dir = path.join(__dirname, 'templates');
var db_filename = path.join(__dirname, 'db', 'stpaul_crime.sqlite3');

var app = express();
var port = 8000;

// open usenergy.sqlite3 database
var db = new sqlite3.Database(db_filename, (err) => {
    if (err) {
        console.log('Error opening ' + db_filename);
    }
    else {
        console.log('Now connected to ' + db_filename);
		    }
});



app.use(express.static(public_dir));
app.use(bodyParser.urlencoded({extended:true}));

// GET request handler for '/'
app.get('/codes',(req,res)=>{
	
	db.all("SELECT * FROM Codes ORDER BY code",function(err,rows){
		var object ={};
		var limit; 		
		
		if(req.query.code != null){
			limit = req.query.code.split(",");
		}
		if(req.query.code!=0&&req.query.code!=null){
			for(var i=0;i<rows.length;i++){
				for(var j=0; j<limit.length;j++){
					if(rows[i].code == limit[j]){
						var code = 'C'+rows[i].code;
						object[code] = rows[i].incident_type;
					}
				}
			}
		}else{
			for(var i=0;i<rows.length;i++){
				var code = 'C'+rows[i].code;
				object[code] = rows[i].incident_type;
				
			}
		}
		if(req.query.format == null || req.query.format==0){
			var sentJson = JSON.stringify(object,null,4);
			res.type('json').send(sentJson);
		}else{
			var xmlString = "";
			for(var i=0;i<rows.length;i++){
				var code = 'C'+rows[i].code;
				xmlString = xmlString +"<code>"+code+"</code>\n";
				xmlString = xmlString + "<incident_type>"+rows[i].incident_type+"</incident_type>\n";
			}
			xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n'+"<codes>\n"+xmlString+"</codes>";
			res.type('xml').send(xmlString);
		}
		
	});	
	
});


app.get('/neighborhoods',(req,res)=>{
	
	db.all("SELECT * FROM Neighborhoods ORDER BY neighborhood_number ",function(err,rows){
		var object ={};
		var limit; 		
		
		if(req.query.id != null){
			limit = req.query.id.split(",");
		}
		if(req.query.id!=0&&req.query.id!=null){
			for(var i=0;i<rows.length;i++){
				for(var j=0; j<limit.length;j++){
					if(rows[i].neighborhood_number == limit[j]){
						var neighborhood_number = 'N'+rows[i].neighborhood_number;
						object[neighborhood_number] = rows[i].neighborhood_name;
					}
				}
			}
		}else{
			for(var i=0;i<rows.length;i++){
				var neighborhood_number = 'N'+rows[i].neighborhood_number;
				object[neighborhood_number] = rows[i].neighborhood_name;
			}
		}
		if(req.query.format == null || req.query.format==0){
			var sentJson = JSON.stringify(object,null,4);
			res.type('json').send(sentJson);
		}else{
			var xmlString = "";
			for(var i=0;i<rows.length;i++){
				var neighborhood_number = 'N'+rows[i].neighborhood_number;
				xmlString = xmlString +"<neighborhood_number>"+neighborhood_number+"</neighborhood_number>\n";
				xmlString = xmlString + "<neighborhood_name >"+rows[i].neighborhood_name+"</neighborhood_name >\n";
			}
			xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n'+"<Neighborhoods>\n"+xmlString+"</Neighborhoods>";
			res.type('xml').send(xmlString);
		}
		
	});	
	
});

app.get('/incidents',(req,res)=>{
	
	if(req.query.limit != null){
		db.all("SELECT * FROM Incidents ORDER BY date_time DESC",function(err,rows){
			var limit;
			if(req.query.limit == 0){
				limit = 10000;
			}else{
				limit= req.query.limit;
			}

			var object = {};
			for(var i = 0; i<limit;i++){
				var temp = {};
				var number = 'I'+rows[i].case_number;
				var timedate = rows[i].date_time.split("T");
				temp["date"] = timedate[0]; 
				temp["time"] = timedate[1]; 
				temp["code"] = rows[i].code;
				temp["incident"] = rows[i].incident;
				temp["police_grid"] = rows[i].police_grid;
				temp["neighborhood_number"] = rows[i].neighborhood_number;
				temp["block"] = rows[i].block;
				object[number] = temp;
			}
			var answer = JSON.stringify(object,null,4);
			res.type("json").send(answer);

		});
	}else{
			
		db.all("SELECT * FROM Incidents ORDER BY case_number",function(err,rows){
			if(req.query.start_date !=null){
				var time = req.query.start_date.split("-");
				var tt = parseInt(time[0]+time[1]+time[2]);
				var object = {};
				for(var i = 0; i<rows.length;i++){
					var temp = {};
					var timedate = rows[i].date_time.split("T");
					var number = 'I'+rows[i].case_number;
					var t = timedate[0].split("-");
					var inputTime = parseInt(t[0]+t[1]+t[2]);
					if(tt<=inputTime){
						temp["date"] = timedate[0]; 
						temp["time"] = timedate[1]; 
						temp["code"] = rows[i].code;
						temp["incident"] = rows[i].incident;
						temp["police_grid"] = rows[i].police_grid;
						temp["neighborhood_number"] = rows[i].neighborhood_number;
						temp["block"] = rows[i].block;
						object[number] = temp;
					}
				}
				var answer = JSON.stringify(object,null,4);
				res.type("json").send(answer);
				
			}else if(req.query.end_date !=null){
				var time = req.query.end_date.split("-");
				var tt = parseInt(time[0]+time[1]+time[2]);
				var object = {};
				for(var i = 0; i<rows.length;i++){
					var temp = {};
					var timedate = rows[i].date_time.split("T");
					var number = 'I'+rows[i].case_number;
					var t = timedate[0].split("-");
					var inputTime = parseInt(t[0]+t[1]+t[2]);
					if(tt>=inputTime){
						temp["date"] = timedate[0]; 
						temp["time"] = timedate[1]; 
						temp["code"] = rows[i].code;
						temp["incident"] = rows[i].incident;
						temp["police_grid"] = rows[i].police_grid;
						temp["neighborhood_number"] = rows[i].neighborhood_number;
						temp["block"] = rows[i].block;
						object[number] = temp;
					}
					
				}
				var answer = JSON.stringify(object,null,4);
				res.type("json").send(answer);
				
			}else if(req.query.code !=null){
				if (req.query.code == 0) {
					var object = {};
					for(var i = 0; i<rows.length;i++){
						var temp = {};
						var number = 'I'+rows[i].case_number;
						var timedate = rows[i].date_time.split("T");
						temp["date"] = timedate[0]; 
						temp["time"] = timedate[1]; 
						temp["code"] = rows[i].code;
						temp["incident"] = rows[i].incident;
						temp["police_grid"] = rows[i].police_grid;
						temp["neighborhood_number"] = rows[i].neighborhood_number;
						temp["block"] = rows[i].block;
						object[number] = temp;
					}
				} else {
					var limit = req.query.code.split(",");
					var object = {};
					for(var i = 0; i<rows.length;i++){
						var temp = {};
						for(var j = 0; j<limit.length; j++){
							if(rows[i].code == limit[j]){
								var number = 'I'+rows[i].case_number;
								var timedate = rows[i].date_time.split("T");
								temp["date"] = timedate[0]; 
								temp["time"] = timedate[1]; 
								temp["code"] = rows[i].code;
								temp["incident"] = rows[i].incident;
								temp["police_grid"] = rows[i].police_grid;
								temp["neighborhood_number"] = rows[i].neighborhood_number;
								temp["block"] = rows[i].block;
								object[number] = temp;
							}
						}
					}
				}
				var answer = JSON.stringify(object,null,4);
				res.type("json").send(answer);
			}else if(req.query.grid!=null){
				if (req.query.grid == 0) {
					var object = {};
					for(var i = 0; i<rows.length;i++){
						var temp = {};
						var number = 'I'+rows[i].case_number;
						var timedate = rows[i].date_time.split("T");
						temp["date"] = timedate[0]; 
						temp["time"] = timedate[1]; 
						temp["code"] = rows[i].code;
						temp["incident"] = rows[i].incident;
						temp["police_grid"] = rows[i].police_grid;
						temp["neighborhood_number"] = rows[i].neighborhood_number;
						temp["block"] = rows[i].block;
						object[number] = temp;
					}
				} else {
					var limit = req.query.grid.split(",");
					var object = {};
					for(var i = 0; i<rows.length;i++){
						var temp = {};
						for(var j = 0; j<limit.length; j++){
							if(rows[i].police_grid == limit[j]){
								var number = 'I'+rows[i].case_number;
								var timedate = rows[i].date_time.split("T");
								temp["date"] = timedate[0]; 
								temp["time"] = timedate[1]; 
								temp["code"] = rows[i].code;
								temp["incident"] = rows[i].incident;
								temp["police_grid"] = rows[i].police_grid;
								temp["neighborhood_number"] = rows[i].neighborhood_number;
								temp["block"] = rows[i].block;
								object[number] = temp;	
							}
						}
					}
				}
				var answer = JSON.stringify(object,null,4);
				res.type("json").send(answer);
			}else if(req.query.id != null){
				if(req.query.id!=0){
					var limit = req.query.id.split(",");
					var object = {};
					for(var i = 0; i<rows.length;i++){
						var temp = {};
						for(var j=0;j<limit.length;j++){
							if(rows[i].neighborhood_number==limit[j]){
								var number = 'I'+rows[i].case_number;
								var timedate = rows[i].date_time.split("T");
								temp["date"] = timedate[0]; 
								temp["time"] = timedate[1]; 
								temp["code"] = rows[i].code;
								temp["incident"] = rows[i].incident;
								temp["police_grid"] = rows[i].police_grid;
								temp["neighborhood_number"] = rows[i].neighborhood_number;
								temp["block"] = rows[i].block;
								object[number] = temp;	
							}
						}

					}
					var answer = JSON.stringify(object,null,4);
					res.type("json").send(answer);
				}else{
					var object = {};
					for(var i = 0; i<rows.length;i++){
						var temp = {};
						var number = 'I'+rows[i].case_number;
						var timedate = rows[i].date_time.split("T");
						temp["date"] = timedate[0]; 
						temp["time"] = timedate[1]; 
						temp["code"] = rows[i].code;
						temp["incident"] = rows[i].incident;
						temp["police_grid"] = rows[i].police_grid;
						temp["neighborhood_number"] = rows[i].neighborhood_number;
						temp["block"] = rows[i].block;
						object[number] = temp;	

					}
					var answer = JSON.stringify(object,null,4);
					res.type("json").send(answer);
					
				}
			}else if(req.query.format != null && req.query.format!=0){
				if (req.query.format=='xml'){
					var xml = "";
					for(var i = 0; i<rows.length;i++){
						var xmlString = "";
						var number = 'I'+rows[i].case_number;
						var timedate = rows[i].date_time.split("T");
						var date = timedate[0]; 
						var time= timedate[1]; 
						var code = rows[i].code;
						var incident= rows[i].incident;
						var police_grid= rows[i].police_grid;
						var neighborhood_number= rows[i].neighborhood_number;
						var block = rows[i].block;
						block = block.split("&").join("&amp;");
						xmlString = xmlString+"\n<date>"+date+"</date>\n"+"<time>"+time+"</time>\n"+"<code>"+code+"</code>\n"
									+"<incident>"+incident+"</incident>\n"+"<police_grid>"+police_grid+"</police_grid>\n"+"<neighborhood_number>"+neighborhood_number+"</neighborhood_number>\n"
									+"<block>"+block+"</block>\n";
						xmlString = "<case_number>"+number+xmlString+"</case_number>\n";
						xml = xml + xmlString;
					}
					xml = '<?xml version="1.0" encoding="UTF-8"?>\n'+"<Incidents>\n"+xml+"</Incidents>";
					res.type('xml').send(xml);
				} else {
					var object = {};
					for(var i = 0; i<rows.length;i++){
						var temp = {};
						var number = 'I'+rows[i].case_number;
						var timedate = rows[i].date_time.split("T");
						temp["date"] = timedate[0]; 
						temp["time"] = timedate[1]; 
						temp["code"] = rows[i].code;
						temp["incident"] = rows[i].incident;
						temp["police_grid"] = rows[i].police_grid;
						temp["neighborhood_number"] = rows[i].neighborhood_number;
						temp["block"] = rows[i].block;
						object[number] = temp;
					}
					var answer = JSON.stringify(object,null,4);
					res.type("json").send(answer);
				}
			}else{
				var object = {};
				for(var i = 0; i<rows.length;i++){
					var temp = {};
					var number = 'I'+rows[i].case_number;
					var timedate = rows[i].date_time.split("T");
					temp["date"] = timedate[0]; 
					temp["time"] = timedate[1]; 
					temp["code"] = rows[i].code;
					temp["incident"] = rows[i].incident;
					temp["police_grid"] = rows[i].police_grid;
					temp["neighborhood_number"] = rows[i].neighborhood_number;
					temp["block"] = rows[i].block;
					object[number] = temp;
				}
				var answer = JSON.stringify(object,null,4);
				res.type("json").send(answer);
			}	
		});

	}
	
});

app.put('/new-incident',(req,res)=>{
	console.log(req.body);
	var together = req.body.date+"T"+req.body.time;
	
	var input = {
		case_number:req.body.case_number,
		date_time:together,
		block: req.body.block,
		incident: req.body.incident,
		code: parseInt(req.body.code,10),
		police_grid:parseInt(req.body.police_grid,10),
		neighborhood_number: parseInt(req.body.neighborhood_number,10)
	};
	
	db.all("SELECT * FROM Incidents ORDER BY case_number",function(err,rows){	
		var count = 0;
		var check = false;
		while(rows.length>count){
			if(rows[count].case_number==input.case_number){
				check = true;
			}
			count = count+1;
		}
		if(check){
			res.status(500).send("the incedent was already exist");
		}else{
			db.all("INSERT INTO Incidents (case_number ,date_time ,code ,incident ,police_grid ,neighborhood_number ,block) VALUE(?,?,?,?,?,?,?,?)"
				,[input.case_number,input.date_time,input.code,input.incident,input.police_grid,input.neighborhood_number,input.block],(err,rows)=>{
					
				res.status(200).send("success adding new incedent!");	
					
				
			});
		}
	});

});

function ReadFile(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data.toString());
            }
        });
    });
}

function Write404Error(res) {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.write('Error: file not found');
    res.end();
}

function WriteHtml(res, html) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(html);
    res.end();
}


var server = app.listen(port);
