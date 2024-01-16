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
    result["title"] = "Weather: Now";
    const nearest = getNearest(userLatitude, userLongitude, data.area_metadata, "label_location");
    result["value"] = data.items[0].forecasts.find(area => area.area === nearest.name).forecast;
    result["location"] = nearest.name;
    result["timeValid"] = data.items[0].update_timestamp.slice(11,16);
    result["unit"] = "";  
  } catch (error) {
    console.error('Error fetching Weather data:', error);
    result["value"] = "Not available";
  }
  return result;
}

async function fetchWeatherToday(userLatitude, userLongitude) {
  const DateTime = new Date().toISOString().slice(0, 19)+"Z";
  const API = `https://api.data.gov.sg/v1/environment/24-hour-weather-forecast?date_time=${DateTime}`;
  let result = {};
  try {
    const response = await fetch(API);
    const data = await response.json();
    result["title"] = "Weather: Today";
    result["value"] = data.items[0].general.forecast;
    result["location"] = null;
    result["timeValid"] = null;
    result["unit"] = null;
  } catch (error) {
    console.error('Error fetching Weather Today data:', error);
    result["value"] = "Not available";
  }
  return result;
}

async function fetchWeatherForecast(index) {
  const DateTime = new Date().toISOString().slice(0, 19)+"Z";
  const API = `https://api.data.gov.sg/v1/environment/4-day-weather-forecast?date_time=${DateTime}`;
  let result = {};
  try {
    const response = await fetch(API);
    const data = await response.json();
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed"];
    result["title"] = `Weather: ${daysOfWeek[new Date().getDay() + index + 1]}`;
    result["value"] = data.items[0].forecasts[index].forecast;
    result["location"] = null;
    result["timeValid"] = null;
    result["unit"] = null;  
  } catch (error) {
    console.error('Error fetching Weather forecast data:', error);
    result["value"] = "Not available";
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
    result["title"] = "Temp: Now";
    const nearest = getNearest(userLatitude, userLongitude, data.metadata.stations, "location");
    result["value"] = data.items[0].readings.find(item => item.station_id === nearest.id).value;
    result["location"] = data.metadata.stations.find(item => item.id === nearest.id).name;
    result["timeValid"] = data.items[0].timestamp.slice(11,16);
    result["unit"] = "°C";
 } catch (error) {
    console.error('Error fetching Temp data:', error);
    result["value"] = "Not available";
  }
  return result;
}

async function fetchTempForecast(index) {
  const DateTime = new Date().toISOString().slice(0, 19)+"Z";
  const API = `https://api.data.gov.sg/v1/environment/4-day-weather-forecast?date_time=${DateTime}`;
  let result = {};
  try {
    const response = await fetch(API);
    const data = await response.json();
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed"];
    result["title"] = `Temp: ${daysOfWeek[new Date().getDay() + index + 1]}`;
    result["value"] = `${data.items[0].forecasts[index].temperature.low} - ${data.items[0].forecasts[index].temperature.high}`;
    result["location"] = null;
    result["timeValid"] = null;
    result["unit"] = "°C";
 } catch (error) {
    console.error('Error fetching Temp forecast data:', error);
    result["value"] = "Not available";
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
    result["title"] = "Humidity: Now";
    const nearest = getNearest(userLatitude, userLongitude, data.metadata.stations, "location");
    result["value"] = data.items[0].readings.find(item => item.station_id === nearest.id).value;
    result["location"] = data.metadata.stations.find(item => item.id === nearest.id).name;
    result["timeValid"] = data.items[0].timestamp.slice(11,16);
    result["unit"] = "%";
 } catch (error) {
    console.error('Error fetching Humidity data:', error);
    result["value"] = "Not available";
  }
  return result;
}

async function fetchHumidityForecast(index) {
  const DateTime = new Date().toISOString().slice(0, 19)+"Z";
  const API = `https://api.data.gov.sg/v1/environment/4-day-weather-forecast?date_time=${DateTime}`;
  let result = {};
  try {
    const response = await fetch(API);
    const data = await response.json();
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed"];
    result["title"] = `Humidity: ${daysOfWeek[new Date().getDay() + index + 1]}`;
    result["value"] = `${data.items[0].forecasts[index].relative_humidity.low} - ${data.items[0].forecasts[index].relative_humidity.high}`;
    result["location"] = null;
    result["timeValid"] = null;
    result["unit"] = "%";
 } catch (error) {
    console.error('Error fetching Humidity forecast data:', error);
    result["value"] = "Not available";
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
    result["title"] = "Rainfall";
    const nearest = getNearest(userLatitude, userLongitude, data.metadata.stations, "location");
    result["value"] = data.items[0].readings.find(item => item.station_id === nearest.id).value;
    result["location"] = data.metadata.stations.find(item => item.id === nearest.id).name;
    result["timeValid"] = data.items[0].timestamp.slice(11,16);
    result["unit"] = "mm";
 } catch (error) {
    console.error('Error fetching Weather data:', error);
    result["value"] = "Not available";
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
    result["title"] = "PM2.5";
    const nearest = getNearest(userLatitude, userLongitude, data.region_metadata, "label_location");
    result["value"] = data.items[0].readings.pm25_one_hourly[nearest.name];
    result["location"] = nearest.name.slice(0,1).toUpperCase().concat("", nearest.name.slice(1));
    result["timeValid"] = data.items[0].update_timestamp.slice(11,16);
    result["unit"] = "µg/m3";
  } catch (error) {
    console.error('Error fetching PM25 data:', error);
    result["value"] = "Not available";
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
    result["title"] = "PSI";
    const nearest = getNearest(userLatitude, userLongitude, data.region_metadata, "label_location");
    result["value"] = data.items[0].readings.psi_twenty_four_hourly[nearest.name];
    result["location"] = nearest.name.slice(0,1).toUpperCase().concat("", nearest.name.slice(1));
    result["timeValid"] = data.items[0].update_timestamp.slice(11,16);
    result["unit"] = "";
  } catch (error) {
    console.error('Error fetching PSI data:', error);
    result["value"] = "Not available";
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
    result["title"] = "UVI";
    result["value"] = data.items[0].index[0].value;
    result["location"] = null;
    result["timeValid"] = data.items[0].update_timestamp.slice(11,16);
    result["unit"] = "";
  } catch (error) {
    console.error('Error fetching UVI data:', error);
    result["value"] = "Not available";
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
  let result = {};
  
  if (req.body["Weather"]) {
    result["Weather Now"] = await fetchWeatherData(userLatitude, userLongitude);
    // result["Weather Today"] = await fetchWeatherToday(userLatitude, userLongitude);
    result["Weather 0"] = await fetchWeatherForecast(0);
    result["Weather 1"] = await fetchWeatherForecast(1);
    // result["Weather 2"] = await fetchWeatherForecast(2);
    // result["Weather 3"] = await fetchWeatherForecast(3);
  };
  if (req.body["Temp"]) {
    result["Temp Now"] = await fetchTempData(userLatitude, userLongitude);
    result["Temp 0"] = await fetchTempForecast(0);
    result["Temp 1"] = await fetchTempForecast(1);
    // result["Temp 2"] = await fetchTempForecast(2);
    // result["Temp 3"] = await fetchTempForecast(3);
  };
  if (req.body["Humidity"]) {
    result["Humidity Now"] = await fetchHumidityData(userLatitude, userLongitude);
    result["Humidity 0"] = await fetchHumidityForecast(0);
    result["Humidity 1"] = await fetchHumidityForecast(1);
    // result["Humidity 2"] = await fetchHumidityForecast(2);
    // result["Humidity 3"] = await fetchHumidityForecast(3);
  };
  if (req.body["Rainfall"]) {
    result["Rainfall"] = await fetchRainfallData(userLatitude, userLongitude);
  };
  if (req.body["PM25"]) {
    result["PM25"] = await fetchPM25Data(userLatitude, userLongitude);
  };
  if (req.body["PSI"]) {
    result["PSI"] = await fetchPsiData(userLatitude, userLongitude);
  };
  if (req.body["UVI"]) {
    result["UVI"] = await fetchUviData(userLatitude, userLongitude);
  };

  console.log(result);
  res.render("display.ejs", { selectedDash: result });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

