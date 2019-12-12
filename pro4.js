function Init(){

	var map = L.map('map').setView([44.949642,-93.093124], 11);
	map.setMaxBounds([[44.892444,-93.206001],[44.991957,-93.005204]]);

	L.tileLayer('http://mt0.google.cn/vt/lyrs=m@160000000&hl=eng&gl=CN&src=app&y={y}&x={x}&z={z}&s=Ga', {
		attribution: '© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
		maxZoom: 18,
		minZoom: 11,
		id: 'mapbox/streets-v11',
		accessToken: 'pk.eyJ1IjoiZHUwMDUxNjIiLCJhIjoiY2szdzY5YmhjMHE2dTNnbzIwYnJsdTJhdSJ9.FFgaw3eAe8gSuxnqk9vz7Q'
	}).addTo(map);
	
	
	var ladLong=map.getCenter();
	
	var MAP=new Vue({
	
		el:"#app",
		data:{
			message:"",
			stpaulcrimes:[],
			centerOfNeighbor:[]
		},
		methods:{
			submit:function(){
				
				var temp=this.message.split(",");
				if(! isNaN(temp[0])){
					var goTo = L.latLng(parseFloat(temp[0]),parseFloat(temp[1]));
					map.setView(goTo);	
				}else{
					var xhttp = new XMLHttpRequest();
					console.log(temp[0]);
					var url= 'https://nominatim.openstreetmap.org/search?street='+temp[0]+"&city=St Paul&format=json";
					xhttp.open("GET",url);
					xhttp.send();
					xhttp.onreadystatechange=function(){
						if(this.readyState==4 && this.status==200){
							console.log(JSON.parse(xhttp.responseText));
							var address=JSON.parse(xhttp.responseText);
							console.log(address[0].lat);
							console.log(address[0].lon);
							var goTo = L.latLng(parseFloat(address[0].lat),parseFloat(address[0].lon));
							map.setView(goTo,15);	
						}
					}
				}

			}
			
		}
		
	});
	
	function insideArea( view_bounds,  nei_lat,  nei_lng){
		if(view_bounds._northEast.lat >= nei_lat && view_bounds._southWest.lat <= nei_lat && view_bounds._northEast.lng >= nei_lng && view_bounds._southWest.lng <= nei_lng){
			return true;
		}
		
		
	}
	map.on("moveend",function(){	
		MAP.$data.message = map.getCenter().lat+","+ map.getCenter().lng;
		var tem = [];

		for (var key in MAP.$data.stpaulcrimes) {

			
			var nei_lat = MAP.$data.centerOfNeighbor[MAP.$data.stpaulcrimes[key].neighborhood_number-1][0];
			var nei_lng = MAP.$data.centerOfNeighbor[MAP.$data.stpaulcrimes[key].neighborhood_number-1][1];
			var view_bounds = map.getBounds();

			if (insideArea(view_bounds, nei_lat, nei_lng)) {
				tem.push(MAP.$data.stpaulcrimes[key]);
				
				//console.log(tem);
				var old = MAP.$data.stpaulcrimes[key].time;
				var NEW = old.split(".");
				tem[tem.length-1].time = NEW[0];
				
			}
		}
		console.log(tem);
		TABLE.$data.tablelist = tem;
		for(var b= 0;b<TABLE.$data.tablelist.length;b++){
			var number = parseInt(TABLE.$data.tablelist[b].neighborhood_number)-1;
			TABLE.$data.tablelist.neighborhood_number = neighborDownload[number];
			var codeName;
			for(var a =0; a<codeDownload.length;a++){
				if("C"+TABLE.$data.tablelist[b].code == codeDownload[a]){
					codeName = codeDownloadName[a];
				}
			}
			TABLE.$data.tablelist[b].code = codeName;
		}
		
		
	});
	
	

	var TABLE = new Vue({
		el:"#table",
		data:{
			startdate:"",
			enddate:"",
			starttime:"",
			endtime:"",
			checkedNames:[],
			neighborhoods:[],
			tablelist:[],
			selectTable:[],
			backup:[],
			tableHead:['date','time','code','incident','police_grid','neighborhood_number','block']
			
		},
		methods:{
			search:function(){
				if(this.startdate != "" || this.enddate!=""){

					var url = 'http://localhost:8000/incidents?start_date='+this.startdate+'&end_date='+this.enddate;
					var tempTable = [];
					$.getJSON(url,(data)=>{
						console.log(data)
						$.each(data,function(i){
							var old = data[i].time;
							var NEW = old.split(".");
							data[i].time = NEW[0];
							var number = parseInt(data[i].neighborhood_number)-1;
							data[i].neighborhood_number = neighborDownload[number];
							var codeName;
							for(var a =0; a<codeDownload.length;a++){
								if("C"+data[i].code == codeDownload[a]){
									codeName = codeDownloadName[a];
								}
							}
							data[i].code = codeName;

							tempTable.push(data[i]);
							
							
						});
						//console.log(tempTable);
						this.tablelist = tempTable;
						console.log(this.tablelist);
						if(this.starttime=="" ){
							this.starttime="00:00:00";
						}
						if(this.endtime==""){
							this.endtime="23:59:59";
						}
						var temppp = this.starttime.split(":");
						
						var start = parseInt(temppp[0]+temppp[1]+temppp[2]);

						var temppp = this.endtime.split(":");
						var end = parseInt(temppp[0]+temppp[1]+temppp[2]);
						for(var i=0; i<this.tablelist.length;i++){
							var put = false;
							var tabletime = this.tablelist[i].time.split(":");
							var tabletimeInt = parseInt(tabletime[0]+tabletime[1]+tabletime[2]);
							var inc = this.tablelist[i].incident.split(",")[0];
							for(var j = 0; j<this.checkedNames.length;j++){
								
								if(inc==this.checkedNames[j]){
									put=true;
								}
								
							}
							
							var put1 = false;
							for(var k=0; k<this.neighborhoods.length;k++){
								if(this.tablelist[i].neighborhood_number==this.neighborhoods[k]){
									put1=true;
								}
							}
							var put2 = false;
							
							if(tabletimeInt>=start && tabletimeInt<=end){
								put2=true;
							}
							console.log(put+""+put1+""+put2);
							if(put==true && put1==true && put2==true){
								this.selectTable.push(this.tablelist[i]);
							}
							
							
							
						}
						
						this.tablelist = this.selectTable;
						console.log(this.tablelist);
						this.selectTable = [];						
					});

				}else{
					this.tablelist = this.backup;
					if(this.starttime=="" ){
						this.starttime="00:00:00";
					}
					if(this.endtime==""){
						this.endtime="23:59:59";
					}
					var temppp = this.starttime.split(":");
					
					var start = parseInt(temppp[0]+temppp[1]+temppp[2]);

					var temppp = this.endtime.split(":");
					var end = parseInt(temppp[0]+temppp[1]+temppp[2]);
					for(var i=0; i<this.tablelist.length;i++){
						var put = false;
						var tabletime = this.tablelist[i].time.split(":");
						var tabletimeInt = parseInt(tabletime[0]+tabletime[1]+tabletime[2]);
						var inc = this.tablelist[i].incident.split(",")[0];
						for(var j = 0; j<this.checkedNames.length;j++){
							
							if(inc==this.checkedNames[j]){
								put=true;
							}
							
						}
						
						var put1 = false;
						for(var k=0; k<this.neighborhoods.length;k++){
							if(this.tablelist[i].neighborhood_number==this.neighborhoods[k]){
								put1=true;
							}
						}
						var put2 = false;
						
						if(tabletimeInt>=start && tabletimeInt<=end){
							put2=true;
						}
						if(put==true && put1==true && put2==true){
							this.selectTable.push(this.tablelist[i]);
						}
						
						
						
					}
					
					console.log(this.selectTable);
					this.tablelist = this.selectTable;
					this.selectTable = [];
				}
			}
		}
		
	});
	var codeDownload = [];
	var codeDownloadName = [];
	var neighborDownload = [];
	
	//console.log(codeDownload[0]==null);
	$.getJSON('http://localhost:8000/codes',(data)=>{
		$.each(data,function(i){
			codeDownload.push(i);
			codeDownloadName.push(data[i]);
		});
	});	
	$.getJSON('http://localhost:8000/neighborhoods',(data)=>{
		$.each(data,function(i){
			neighborDownload.push(data[i]);
			
		});
	});
	
	$.getJSON('http://localhost:8000/incidents?start_date=2019-10-01&end_date=2019-10-31',(data)=>{
		$.each(data,function(i){
			var old = data[i].time;
			var NEW = old.split(".");
			data[i].time = NEW[0];
			var number = parseInt(data[i].neighborhood_number)-1;
			data[i].neighborhood_number = neighborDownload[number];
			var codeName;
			for(var a =0; a<codeDownload.length;a++){
				if("C"+data[i].code == codeDownload[a]){
					codeName = codeDownloadName[a];
				}
			}
			data[i].code = codeName;
			TABLE.$data.tablelist.push(data[i]);
			TABLE.$data.backup.push(data[i]);
			
		});		
		
	});
	
	
	$.getJSON('http://localhost:8000/incidents?start_date=2019-10-01&end_date=2019-10-31',(data)=>{
		MAP.$data.stpaulcrimes = data;
		//console.log(TABLE.$data.tablelist);
		var commited = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		for (var key in data) {
			commited[MAP.$data.stpaulcrimes[key].neighborhood_number-1]++;
		}
		
		MAP.$data.centerOfNeighbor.push([44.956758, -93.015139]);
		L.marker([44.956758, -93.015139]).addTo(map).bindPopup(commited[0]+' crimes commited').openPopup();
		MAP.$data.centerOfNeighbor.push([44.977519, -93.025290]);
		L.marker([44.977519, -93.025290]).addTo(map).bindPopup(commited[1]+' crimes commited').openPopup();
		MAP.$data.centerOfNeighbor.push([44.931369, -93.082249]);
		L.marker([44.931369, -93.082249]).addTo(map).bindPopup(commited[2]+' crimes commited').openPopup();
		MAP.$data.centerOfNeighbor.push([44.957164, -93.057100]);
		L.marker([44.957164, -93.057100]).addTo(map).bindPopup(commited[3]+' crimes commited').openPopup();
		MAP.$data.centerOfNeighbor.push([44.978208, -93.069673]);
		L.marker([44.978208, -93.069673]).addTo(map).bindPopup(commited[4]+' crimes commited').openPopup();
		MAP.$data.centerOfNeighbor.push([44.977405, -93.110969]);
		L.marker([44.977405, -93.110969]).addTo(map).bindPopup(commited[5]+' crimes commited').openPopup();
		MAP.$data.centerOfNeighbor.push([44.960265, -93.118686]);
		L.marker([44.960265, -93.118686]).addTo(map).bindPopup(commited[6]+' crimes commited').openPopup();
		MAP.$data.centerOfNeighbor.push([44.948581, -93.128205]);
		L.marker([44.948581, -93.128205]).addTo(map).bindPopup(commited[7]+' crimes commited').openPopup();
		MAP.$data.centerOfNeighbor.push([44.931735, -93.119224]);
		L.marker([44.931735, -93.119224]).addTo(map).bindPopup(commited[8]+' crimes commited').openPopup();
		MAP.$data.centerOfNeighbor.push([44.982860, -93.150844]);
		L.marker([44.982860, -93.150844]).addTo(map).bindPopup(commited[9]+' crimes commited').openPopup();
		MAP.$data.centerOfNeighbor.push([44.962891, -93.167436]);
		L.marker([44.962891, -93.167436]).addTo(map).bindPopup(commited[10]+' crimes commited').openPopup();
		MAP.$data.centerOfNeighbor.push([44.973546, -93.195991]);
		L.marker([44.973546, -93.195991]).addTo(map).bindPopup(commited[11]+' crimes commited').openPopup();
		MAP.$data.centerOfNeighbor.push([44.948401, -93.174050]);
		L.marker([44.948401, -93.174050]).addTo(map).bindPopup(commited[12]+' crimes commited').openPopup();
		MAP.$data.centerOfNeighbor.push([44.934301, -93.175363]);
		L.marker([44.934301, -93.175363]).addTo(map).bindPopup(commited[13]+' crimes commited').openPopup();
		MAP.$data.centerOfNeighbor.push([44.911489, -93.172075]);
		L.marker([44.911489, -93.172075]).addTo(map).bindPopup(commited[14]+' crimes commited').openPopup();
		MAP.$data.centerOfNeighbor.push([44.937493, -93.136353]);
		L.marker([44.937493, -93.136353]).addTo(map).bindPopup(commited[15]+' crimes commited').openPopup();
		MAP.$data.centerOfNeighbor.push([44.950459, -93.096462]);
		L.marker([44.950459, -93.096462]).addTo(map).bindPopup(commited[16]+' crimes commited').openPopup();
		
	
	});

}


