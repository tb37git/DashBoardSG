import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT || 3000;

// let userLatitude = 1.316576119456869;
// let userLongitude = 103.83240698999445;
      
function getNearest(latitude, longitude, locationMetaData, label) {
  const regions = locationMetaData;
  let nearest = regions[0];
  let minDistance = calculateDistance(latitude, longitude, nearest[label].latitude, nearest[label].longitude);

  // Loop through each region and update nearest if a closer one is found
  for (let i = 1; i < regions.length; i++) {
    const distance = calculateDistance(latitude, longitude, regions[i][label].latitude, regions[i][label].longitude);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = regions[i];
    }
  }
  return nearest;
}

// Function to calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

async function fetchWeatherData(userLatitude, userLongitude) {
  const DateTime = new Date().toISOString().slice(0, 19)+"Z";
  const API = `https://api.data.gov.sg/v1/environment/2-hour-weather-forecast?date_time=${DateTime}`;
  let result = {};
  try {
    const response = await fetch(API);
    const data = await response.json();
    const nearest = getNearest(userLatitude, userLongitude, data.area_metadata, "label_location");
    result["value"] = data.items[0].forecasts.find(area => area.area === nearest.name).forecast;
    result["location"] = nearest.name;
    result["timeValid"] = data.items[0].update_timestamp.slice(11,16);
  } catch (error) {
    console.error('Error fetching Weather data:', error);
  }
  return result;
}

async function fetchTempData(userLatitude, userLongitude) {
  const DateTime = new Date().toISOString().slice(0, 19)+"Z";
  const API = `https://api.data.gov.sg/v1/environment/air-temperature?date_time=${DateTime}`;
  let result = {};
  try {
    const response = await fetch(API);
    const data = await response.json();
    const nearest = getNearest(userLatitude, userLongitude, data.metadata.stations, "location");
    console.log(nearest);
    result["value"] = data.items[0].readings.find(item => item.station_id === nearest.id).value;
    result["location"] = data.metadata.stations.find(item => item.id === nearest.id).name;
    result["timeValid"] = data.items[0].timestamp.slice(11,16);
 } catch (error) {
    console.error('Error fetching Weather data:', error);
  }
  return result;
}

async function fetchHumidityData(userLatitude, userLongitude) {
  const DateTime = new Date().toISOString().slice(0, 19)+"Z";
  const API = `https://api.data.gov.sg/v1/environment/relative-humidity?date_time=${DateTime}`;
  let result = {};
  try {
    const response = await fetch(API);
    const data = await response.json();
    const nearest = getNearest(userLatitude, userLongitude, data.metadata.stations, "location");
    console.log(nearest);
    result["value"] = data.items[0].readings.find(item => item.station_id === nearest.id).value;
    result["location"] = data.metadata.stations.find(item => item.id === nearest.id).name;
    result["timeValid"] = data.items[0].timestamp.slice(11,16);
 } catch (error) {
    console.error('Error fetching Weather data:', error);
  }
  return result;
}

async function fetchRainfallData(userLatitude, userLongitude) {
  const DateTime = new Date().toISOString().slice(0, 19)+"Z";
  const API = `https://api.data.gov.sg/v1/environment/rainfall?date_time=${DateTime}`;
  let result = {};
  try {
    const response = await fetch(API);
    const data = await response.json();
    const nearest = getNearest(userLatitude, userLongitude, data.metadata.stations, "location");
    console.log(nearest);
    result["value"] = data.items[0].readings.find(item => item.station_id === nearest.id).value;
    result["location"] = data.metadata.stations.find(item => item.id === nearest.id).name;
    result["timeValid"] = data.items[0].timestamp.slice(11,16);
 } catch (error) {
    console.error('Error fetching Weather data:', error);
  }
  return result;
}

async function fetchPM25Data(userLatitude, userLongitude) {
  const DateTime = new Date().toISOString().slice(0, 19)+"Z";
  const API = `https://api.data.gov.sg/v1/environment/pm25?date_time=${DateTime}`;
  let result = {};
  try {
    const response = await fetch(API);
    const data = await response.json();
    const nearest = getNearest(userLatitude, userLongitude, data.region_metadata, "label_location");
    result["value"] = data.items[0].readings.pm25_one_hourly[nearest.name];
    result["location"] = nearest.name.slice(0,1).toUpperCase().concat("", nearest.name.slice(1));
    result["timeValid"] = data.items[0].update_timestamp.slice(11,16);
  } catch (error) {
    console.error('Error fetching PM25 data:', error);
  }
  return result;
}

async function fetchPsiData(userLatitude, userLongitude) {
  const DateTime = new Date().toISOString().slice(0, 19)+"Z";
  const API = `https://api.data.gov.sg/v1/environment/psi?date_time=${DateTime}`;
  let result = {};
  try {
    const response = await fetch(API);
    const data = await response.json();
    const nearest = getNearest(userLatitude, userLongitude, data.region_metadata, "label_location");
    result["value"] = data.items[0].readings.psi_twenty_four_hourly[nearest.name];
    result["location"] = nearest.name.slice(0,1).toUpperCase().concat("", nearest.name.slice(1));
    result["timeValid"] = data.items[0].update_timestamp.slice(11,16);
  } catch (error) {
    console.error('Error fetching PSI data:', error);
  }
  return result;
}

async function fetchUviData(userLatitude, userLongitude) {
  const DateTime = new Date().toISOString().slice(0, 19)+"Z";
  const API = `https://api.data.gov.sg/v1/environment/uv-index?date_time=${DateTime}`;
  let result = {};
  try {
    const response = await fetch(API);
    const data = await response.json();
    result["value"] = data.items[0].index[0].value;
    result["location"] = null;
    result["timeValid"] = data.items[0].update_timestamp.slice(11,16);
  } catch (error) {
    console.error('Error fetching UVI data:', error);
  }
  return result;
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/about", (req, res) => {
  res.render("about.ejs");
});

app.get("/contact", (req, res) => {
  res.render("contact.ejs");
});

app.post("/display", async (req, res) => {
  console.log(req.body);
  const userLatitude = req.body["userLatitude"];
  const userLongitude = req.body["userLongitude"];
  const result = {};
  if (req.body["Weather"]) {
    const data = await fetchWeatherData(userLatitude, userLongitude)
    result["Weather"] = {
      title: "Weather",
      value: data.value,
      location: data.location,
      timeValid: data.timeValid,
      unit: ""
    }
  };
  if (req.body["Temp"]) {
    const data = await fetchTempData(userLatitude, userLongitude)
    result["Temp"] = {
      title: "Temp",
      value: data.value,
      location: data.location,
      timeValid: data.timeValid,
      unit: "°C"
    }
  };
  if (req.body["Humidity"]) {
    const data = await fetchHumidityData(userLatitude, userLongitude)
    result["Humidity"] = {
      title: "Humidity",
      value: data.value,
      location: data.location,
      timeValid: data.timeValid,
      unit: "%"
    }
  };
  if (req.body["Rainfall"]) {
    const data = await fetchRainfallData(userLatitude, userLongitude)
    result["Rainfall"] = {
      title: "Rainfall",
      value: data.value,
      location: data.location,
      timeValid: data.timeValid,
      unit: "mm"
    }
  };
  if (req.body["PM25"]) {
    const data = await fetchPM25Data(userLatitude, userLongitude)
    result["PM25"] = {
      title: "PM2.5",
      value: data.value,
      location: data.location,
      timeValid: data.timeValid,
      unit: "µg/m3"
    }
  };
  if (req.body["PSI"]) {
    const data = await fetchPsiData(userLatitude, userLongitude)
    result["PSI"] = {
      title: "PSI",
      value: data.value,
      location: data.location,
      timeValid: data.timeValid,
      unit: ""
    }
  };
  if (req.body["UVI"]) {
    const data = await fetchUviData(userLatitude, userLongitude)
    result["UVI"] = {
      title: "UVI",
      value: data.value,
      location: data.location,
      timeValid: data.timeValid,
      unit: ""
    }
  };

  console.log(result);
  res.render("display.ejs", { selectedDash: result });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

