/*
 *
 * Global variables
 *
 */

// Constants used to build the URI for the OpenWeather API call
var apiPrefix = "http://api.openweathermap.org/data/2.5/weather?";
var apiSuffix = undefined;
var iconPrefix = "http://openweathermap.org/img/w/";
var iconSuffix = ".png";
var dummyIcon = "dummy.png";

// Constant for testing layout, true means we don't try anything online or use geolocation
var dummyMode = true;
var dummyResult = {
  coord: {lon:0.13, lat:52.2},
  weather: [
    { id: 300, main: "Drizzle", description: "light intensity drizzle", icon: "09d" },
    { id: 701, main: "Mist", description: "mist", icon: "50d" }
  ],
  base: "cmc stations",
  main: { temp: 281.53, pressure: 1018, humidity: 100, temp_min: 280.15, temp_max: 282.59 },
  wind: { speed: 3.1, deg: 340},
  rain: {"3h" :0.2175},
  clouds: {all: 90},
  dt: 1464159121,
  sys: {type: 3, id: 5154, message:0.0052, country: "GB", sunrise: 1464148236, sunset:1464206592},
  id: 7290660,
  name: "Cambridge District",
  cod:200
};

// Global variable to store last temperature reading from API and choice of C/F
var lastTemp;
var useCelsius = true;

/*
 *
 * Start-up code
 *
 */


run_when_document_ready(function () {

  debug("starting");

  // Set up event listeners
  document.getElementById("c-button").addEventListener("click", function () {
    useCelsius = true;
    writeTemp();
  });
  document.getElementById("f-button").addEventListener("click", function () {
    useCelsius = false;
    writeTemp();
  });
  document.querySelector(".city-form").addEventListener("submit", function (event) {
    fetchWeather(document.getElementById("city-input").value);
    event.preventDefault();
  });

  // If in dummy mode, avoid looking at our location
  if (dummyMode) {

    fetchWeather(52.19, 0.13);

  } else {

    if (navigator.geolocation.getCurrentPosition !== undefined) {
      debug("Have geolocation in navigator", navigator.geolocation);
      navigator.geolocation.getCurrentPosition(function (position) {
        debug("getCurrentPosition returned", position);
        fetchWeather(position.coords.latitude, position.coords.longitude);
      }, function (error) {
        debug("Failed", error);
      });
      debug("Launched async call to getCurrentPosition");
    }
  }

});


/*
 *
 * Main working functions
 *
 */


// Fetch the weather from localStorage or API then call updateDOM (maybe asynchronously)
// Takes either (two arguments) latitude and longitude or (one argument) city name
function fetchWeather() {

  var query;   // Query postion of URI for API call; also used as localStorage key
  var stored;  // Saved weather stored in localStorage (time and result fields)
  var request; // Used to build up API call
  var result;  // Return value from API call

  // Build query from arguments
  debug("fetchWeather called with", arguments);
  if (arguments.length === 2) {
    query = "lat=" + arguments[0].toFixed(2) + "&lon=" + arguments[1].toFixed(2);
  } else if (arguments.length === 1) {
    query = "q="+ arguments[0];
  } else {
    debug("Bad parameters to fetchWeather");
    return;
  }
  debug("query set to", query);

  if (dummyMode) {
    updateDOM(dummyResult);
    return;
  }

  // Use local storage if we can
  if (storageAvailable("localStorage")) {
    debug("Have localStorage available");
    try {
      stored = JSON.parse(localStorage.getItem(query));
      debug("getItem gives", stored);
      if (stored.time && stored.result && Date.now() - stored.time < 10 * 60 * 1000) { // Less than 10 mins old
        debug("Using localstorage data");
        updateDOM(stored.result);
        return;
      }
    } catch (e) {
      debug("Error in getItem JSON.parse", e);
    }
  }

  // API call
  request = new XMLHttpRequest();
  request.open("GET",  apiPrefix + query + apiSuffix, true); // true is for async
  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      try {
        result = JSON.parse(request.response);
        debug("API call returned", result);
      } catch (e) {
        debug("Error in api JSON.parse", e);
      }
      if (storageAvailable("localStorage")) {
        localStorage.setItem(query, JSON.stringify({
          time: Date.now(),
          result: result
        }));
        debug("Wrote", JSON.stringify(localStorage.getItem(query)), "to localstorage");
      }
      updateDOM(result);
    } else {
      debug("Bad status from get", request);
    }
  };
  request.onerror = function () {
    debug("Error from get");
  };
  request.send();

}

// Update the DOM with the result from the API weather call
function updateDOM(result) {
  debug("updateDOM called with", result, result.main);

  lastTemp = result.main.temp;
  writeTemp();

  // Add icons and text for each description in the weather result
  if (result.weather) {

    var row  = document.querySelector(".descriptions-row");

    // Remove any existing nodes in the row
    while (row.firstChild) {
      row.removeChild(row.firstChild);
    }

    // Add a box for each description
    result.weather.forEach(function (desc) {

      // Box for the whole description (contains icon and label)
      var descMainBox = document.createElement("div");
      descMainBox.className = "description-box";

      // Box containing the icon
      var descIconBox = document.createElement("div");
      descIconBox.className = "description-icon";
      var icon = document.createElement("img");
      icon.setAttribute("src", dummyMode ? dummyIcon : (iconPrefix + desc.icon + iconSuffix));
      descIconBox.appendChild(icon);

      // Box containing the label
      var descLabelBox = document.createElement("div");
      descLabelBox.className = "description-label";
      descLabelBox.appendChild(document.createTextNode(capitalizeFirst(desc.description)));

      // Connect nodes
      descMainBox.appendChild(descIconBox);
      descMainBox.appendChild(descLabelBox);
      row.appendChild(descMainBox);
    });
  }


  writeDescription(result.main && result.main.humidity,
            "humidity-reading", result.main.humidity.toFixed(0) + "%");
  writeDescription(result.wind && result.wind.speed,
            "wind-speed-reading", result.wind.speed.toFixed(1) + " m/s");
  writeDescription(result.wind && result.wind.deg,
           "wind-direction-reading", result.wind.deg.toFixed(0) + "&deg");

  document.querySelector(".city-name").innerHTML = result.name;


}

function writeTemp() {

  var temp;

  if (lastTemp) {
    if (useCelsius) {
      temp = (lastTemp - 273.15).toFixed(1) + "&deg;C";
    } else {
      temp = ((lastTemp - 273.15 + 32) * 9 / 5).toFixed(1) + "&degF";
    }
    writeDescription(true, "temperature-reading", temp);
  }
}

/*
 *
 * Utility functions
 *
 */

// Helper function to check the test condition and then write the string into the node with the specified id
// Disable node if
function writeDescription(test, id, str) {

  var node = document.getElementById(id);

  node.innerHTML = test ? str : "N/A";

}

// Helper function to show progress to console
var debugOn = true;
function debug() {
  if (debugOn) {
    console.log.apply(console, arguments); // Chrome's console.log wants this to be console
  }
}

// Capitalize the first letter of the string and return it
function capitalizeFirst(s) {

  return s.substr(0, 1).toUpperCase() + s.substr(1);

}


// Return true if local storage is available (from MDN)
function storageAvailable(type) {
  try {
    var storage = window[type];
    var x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  }
  catch(e) {
    return false;
  }
}

// Standard function to run a function when document is loaded
function run_when_document_ready(fn) {
  if (document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}
