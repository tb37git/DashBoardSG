import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT || 3000;

// let userLatitude = 1.316576119456869;
// let userLongitude = 103.83240698999445;
      
function getNearestRegion(latitude, longitude, locationMetaData) {
  const regions = locationMetaData;
  let nearestRegion = regions[0];
  let minDistance = calculateDistance(latitude, longitude, nearestRegion.label_location.latitude, nearestRegion.label_location.longitude);

  // Loop through each region and update nearestRegion if a closer one is found
  for (let i = 1; i < regions.length; i++) {
    const distance = calculateDistance(latitude, longitude, regions[i].label_location.latitude, regions[i].label_location.longitude);
    if (distance < minDistance) {
      minDistance = distance;
      nearestRegion = regions[i];
    }
  }
  return nearestRegion;
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

async function fetchPM25Data(userLatitude, userLongitude) {
  const DateTime = new Date().toISOString().slice(0, 19)+"Z";
  const pm25api = `https://api.data.gov.sg/v1/environment/pm25?date_time=${DateTime}`;
  let pm25Value;
  try {
    const response = await fetch(pm25api);
    const json = await response.json();
    console.log(pm25api);
    const nearestRegion = getNearestRegion(userLatitude, userLongitude, json.region_metadata);
    pm25Value = json.items[0].readings.pm25_one_hourly[nearestRegion.name];
  } catch (error) {
    console.error('Error fetching PM25 data:', error);
  }
  return pm25Value;
}

async function fetchPsiData(userLatitude, userLongitude) {
  const DateTime = new Date().toISOString().slice(0, 19)+"Z";
  const psiApi = `https://api.data.gov.sg/v1/environment/psi?date_time=${DateTime}`;
  let psiValue;
  try {
    const response = await fetch(psiApi);
    const data = await response.json();
    const nearestRegion = getNearestRegion(userLatitude, userLongitude, data.region_metadata);
    psiValue = data.items[0].readings.psi_twenty_four_hourly[nearestRegion.name];
  } catch (error) {
    console.error('Error fetching PSI data:', error);
  }
  return psiValue;
}

async function fetchUviData(userLatitude, userLongitude) {
  const DateTime = new Date().toISOString().slice(0, 19)+"Z";
  const uviApi = `https://api.data.gov.sg/v1/environment/uv-index?date_time=${DateTime}`;
  let uviValue;
  try {
    const response = await fetch(uviApi);
    const data = await response.json();
    uviValue = data.items[0].index[0].value;
  } catch (error) {
    console.error('Error fetching UVI data:', error);
  }
  return uviValue;
}

async function fetchWeatherData(userLatitude, userLongitude) {
  const DateTime = new Date().toISOString().slice(0, 19)+"Z";
  const weatherApi = `https://api.data.gov.sg/v1/environment/2-hour-weather-forecast?date_time=${DateTime}`;
  let weatherValue;
  try {
    const response = await fetch(weatherApi);
    const data = await response.json();
    const nearestArea = getNearestRegion(userLatitude, userLongitude, data.area_metadata);
    weatherValue = data.items[0].forecasts.find(area => area.area === nearestArea.name).forecast;
  } catch (error) {
    console.error('Error fetching Weather data:', error);
  }
  return weatherValue;
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
  if (req.body["PM25"]) { result["PM25"] = {
    title: "PM2.5",
    value: await fetchPM25Data(userLatitude, userLongitude),
    unit: "µg/m3"
    }
  };
  if (req.body["PSI"]) { result["PSI"] = {
    title: "PSI",
    value: await fetchPsiData(userLatitude, userLongitude),
    unit: "Index"
    }
  };
  if (req.body["UVI"]) { result["UVI"] = {
    title: "UVI",
    value: await fetchUviData(userLatitude, userLongitude),
    unit: "Index"
    }
  };
  if (req.body["Weather"]) { result["Weather"] = {
    title: "Weather",
    value: await fetchWeatherData(userLatitude, userLongitude),
    unit: ""
    }
  };
  console.log(result);
  res.render("display.ejs", { selectedDash: result });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

