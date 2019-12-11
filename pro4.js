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
			message:""
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
	
	
	map.on("moveend",function(){	
		MAP.$data.message = map.getCenter().lat+","+ map.getCenter().lng;
		
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
			tableHead:['date','time','code','incident','police_grid','neighborhood_number','block']
		},
		methods:{
			search:function(){
					if(this.startdate==null&&this.enddate==null&&this.starttime==null&&this.endtime==null){
						$.getJSON('http://localhost:8000/incidents?start_data=2019-10-01&end_data=2019-10-31',(data)=>{
							if(checkedNames==null && neighborhoods==null){
								//all
							}else{
								//
							}
						});
					}else{	
						var requestURL='http://localhost:8000/incidents?';
						if(this.startdate !=null){
							requestURL = requestURL+'start_date='+this.startdate;
						}else if (this.enddate !=null){
							requestURL = requestURL+'end_date='+this.enddate;
						}
						if(this.starttime==null ){
							this.starttime="00:00:00";
						}else if(this.endtime==null){
							this.endtime="23:59:59";
						}
						var temp = this.starttime.split(":");
						var start = parseInt(temp[0]+temp[1]+temp[2]);

						var temp = this.endtime.split(":");
						var end = parseInt(temp[0]+temp[1]+temp[2]);								
						var newResult=[];
						$.getJSON(requestURL,(data)=>{
							var result=JSON.parse(data);
							for(var i=0;i<result.length;i++){
								var temp = result[i].time.split(":");
								var input = parseInt(temp[0]+temp[1]+temp[2]);
								if(input<=end && input>=start){
									newResult.push(result[i]);
								}
							}
						});
						for(var i=0; i<newResult.length;i++){
							var url = 'http://localhost:8000/incidents?'+'code='+newResult[i].code;
							$.getJSON(url,(data)=>{
								var codeTemp = "C"+newResult[i].code
								var Code = data.codeTemp;
								var newCode =Code.split(",")[0];
								newResult[i].code = newCode;
							});
							var url = 'http://localhost:8000/neighborhoods?'+'id='+newResult[i].neighborhood_number;
							$.getJSON(url,(data)=>{
								var tempId = "N"+newResult[i].neighborhood_number;
								var Id = data.tempId;
								newResult[i].neighborhood_number =Id;
							});							
						}
						var temparray = [];
						for(var i=0; i<neighborhoods.length;i++){
							for(var j=0; j<newResult.length;j++){
								if(neighborhoods[i]==newResult[j].neighborhood_number){
									temparray.push(newResult[j]);
								}
							}
						}
						var goToTable = [];
						for(var i=0; i<checkedNames.length;i++){
							for(var j=0; j<temparray.length;j++){
								if(checkedNames[i]==temparray[j].code){
									goToTable.push(temparray[j]);
								}
							}
						}
						this.tablelist = goToTable;
						
						
					}
				}
		}
		
	});
	
	$.getJSON('http://localhost:8000/incidents?start_date=2019-10-01&end_date=2019-10-31',(data)=>{
		$.each(data,function(i){
			var old = data[i].time;
			var NEW = old.split(".");
			data[i].time = NEW[0];
			TABLE.$data.tablelist.push(data[i]);
		});
	});
	
	

}


