// This array contains the coordinates for all bus stops between MIT and Harvard
const busStops = [
  [-71.093729, 42.359244],
  [-71.094915, 42.360175],
  [-71.0958, 42.360698],
  [-71.099558, 42.362953],
  [-71.103476, 42.365248],
  [-71.106067, 42.366806],
  [-71.108717, 42.368355],
  [-71.110799, 42.369192],
  [-71.113095, 42.370218],
  [-71.115476, 42.372085],
  [-71.117585, 42.373016],
  [-71.118625, 42.374863],
];

// TODO: add your own access token
mapboxgl.accessToken =
  'pk.eyJ1IjoiZHJhZ29uYWhvbGljIiwiYSI6ImNrbWVwcndhaTB4ODEycGxqYXFiOTl6c3UifQ.q2kB68Ji2dpkERnvF3YF3A';

// TODO: create the map object using mapboxgl.map() function
let map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-71.104081, 42.365554],
  zoom: 14,
});

//TODO: add stop markers
addStops = ()=>{
	busStops.forEach((item)=>{
	busStopMarker = document.createElement('img');
	busStopMarker.src = 'images/busstop.png';
	busStopMarker.style.width = busStopMarker.style.height = '40px';
	new mapboxgl.Marker(busStopMarker).setLngLat([item[0],item[1]]).addTo(map);
  busStopMarker.addEventListener('mouseover', function(){
    let labelPopup = new mapboxgl.Popup()
    .setLngLat(item)
    .setHTML('BUS STOP')
    .addTo(map);
    Popups.push(labelPopup);
  })
  //Remove Old Marker
  busStopMarker.addEventListener('mouseleave', function () {
    Popups.forEach((item)=>{
      item.remove();
    })
});
	})
}

//TODO: add api 
currBusMarkers = [];
Popups =[];
async function run(){
  // get bus data    
  const locations = await getBusLocations();
  //console.log(new Date());
  console.log(locations);
  currBusMarkers.forEach((item)=>{item.remove();});
  locations.forEach((item)=>{
    let busMarker = document.createElement('div');
    busMarker.className = 'bus-marker';
    busLong = item.attributes.longitude;
    busLat = item.attributes.latitude;
    if(item.attributes.occupancy_status === 'FEW_SEATS_AVAILABLE'){
      busMarker.style.width = busMarker.style.height = '50px';
      busMarker.style.backgroundImage = 'url(images/redbus.png)';
    }else if(item.attributes.occupancy_status === 'MANY_SEATS_AVAILABLE'){
      busMarker.style.backgroundImage = 'url(images/greenbus.png)';
    }else {
      busMarker.style.width = busMarker.style.height = '50px';
    }
    busMarker.addEventListener('mouseover', function () {
    let labelPopup = new mapboxgl.Popup()
      .setLngLat([item.attributes.longitude, item.attributes.latitude])
      .setHTML(` BUS ID: ${item.attributes.label}<br> CURRENT BEARING: ${item.attributes.bearing}`)
      .addTo(map);
      Popups.push(labelPopup);
  });

  //Remove Old Popup
  busMarker.addEventListener('mouseleave', function () {
    Popups.forEach((item)=>{
      item.remove();
    })
});

  //Add Bus Marker
  marker = new mapboxgl.Marker(busMarker).setLngLat([busLong,busLat]).addTo(map);
  currBusMarkers.push(marker);

});
// timer
setTimeout(run, 15000);
}

// counter here represents the index of the current bus stop
let counter = 0;
function move() {
  setTimeout(() => {
    if (counter >= busStops.length) counter = 0;
    marker.setLngLat(busStops[counter]);
    counter++;
    move();
  }, 1000);
}
addStops();
run();

// Request bus data from MBTA
async function getBusLocations(){
	const url = 'https://api-v3.mbta.com/vehicles?filter[route]=1&include=trip';
	const response = await fetch(url);
	const json     = await response.json();
	return json.data;
}
