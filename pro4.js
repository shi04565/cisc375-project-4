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
	
	var vm=new Vue({
	
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
					var url= 'https://nominatim.openstreetmap.org/search?street='+temp[0]+"&format=json";
					xhttp.open("GET",url);
					xhttp.send();
					xhttp.onreadystatechange=function(){
						if(this.readyState==4 && this.status==200){
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
		vm.$data.message = map.getCenter().lat+","+ map.getCenter().lng;
		
	});
	

}


//University of St. Thomas