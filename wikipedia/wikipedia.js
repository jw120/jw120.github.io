// Polyfill - promises?
// Alternative to adding console.log
// Objectives - TypeScript instead of Ugly JS, Fetch instead of ugly XMLHttpRequest
// Notes - Wikipedia API does not support CORS, so need to use JSONP
// Comment that JSONP is an awful hack
// Challenges - COR, Bundling/machinery
// No polyfll for promises`
// TODO - Add non-FCC projects to portfolio?
/*
 *
 * Global constants
 *
 */
// Used to build the URI for the Wikipedia API call
// Full URL used for the API is
//
// apiPrefix + <query-string> + apiSuffix + <callback-function-name>
//
const apiPrefix = "http://en.wikipedia.org/w/api.php?action=opensearch&namespace=0&format=json&search=";
const apiSuffix = "&callback="; // Name of the callback is added by fetchJSONP
/*
 *
 * Start-up code to set up our event listeners
 *
 */
run_when_document_ready(function () {
    // Button to start a search
    document.getElementById("search-button").addEventListener("click", startSearch);
    // Handle input into the search field
    document.querySelector(".search-form").addEventListener("submit", function (event) {
        let input = document.getElementById("search-input");
        launchSearch(input.value);
        event.preventDefault();
    });
});
/*
 *
 * Main working functions
 *
 */
// Starting a search means making the input field visible and putting cursor in it
function startSearch() {
    let input = document.querySelector("#search-input");
    input.style.visibility = "visible";
    input.focus();
}
// Launching a search uses a JSONP callback
function launchSearch(query) {
    jsonp(apiPrefix + query + apiSuffix)
        .then(validateResult)
        .then(updateSearchList)
        .catch((e) => console.log(e));
}
// Update the search-results div in the DOM with the new search results
function updateSearchList(result) {
    const resultsBox = document.querySelector(".results-box");
    // Remove any old search results
    while (resultsBox.firstChild) {
        resultsBox.removeChild(resultsBox.firstChild);
    }
    // Add each of the search results
    result.titles.forEach((title, i) => {
        // Each result contained in an anchor which links to the result's wikipedia page
        let newAnchor = document.createElement("a");
        newAnchor.setAttribute("href", result.urls[i]);
        newAnchor.className = "result-anchor";
        resultsBox.appendChild(newAnchor);
        // Inside the anchor is a div for styling/spacing
        let newBox = document.createElement("div");
        newBox.className = "result-box";
        newAnchor.appendChild(newBox);
        // Inside the div is, first, the title as a heading
        let newTitle = document.createElement("h4");
        newTitle.appendChild(document.createTextNode(title));
        newBox.appendChild(newTitle);
        // Inside the div is, second, the first paragraph of the article
        let newBody = document.createElement("p");
        newBody.appendChild(document.createTextNode(result.firstParas[i]));
        newBox.appendChild(newBody);
    });
}
/**
 *
 * Helper function
 *
 */
// Validate that the raw result of the JSON parsing has the expected format, then convert to our
// tidier search result type
function validateResult(raw) {
    if (Array.isArray(raw) &&
        raw.length === 4 &&
        typeof raw[0] === "string" &&
        Array.isArray(raw[1]) &&
        raw[1].every((x) => typeof x === "string") &&
        Array.isArray(raw[2]) &&
        raw[2].every((x) => typeof x === "string") &&
        Array.isArray(raw[3]) &&
        raw[3].every((x) => typeof x === "string") &&
        raw[1].length === raw[2].length &&
        raw[2].length === raw[3].length) {
        return {
            query: raw[0],
            titles: raw[1],
            firstParas: raw[2],
            urls: raw[3]
        };
    }
    else {
        throw Error("Invalid search result");
    }
}
/*
 *
 * Library functions
 *
 */
// Standard function to run a function when document is loaded
function run_when_document_ready(fn) {
    if (document.readyState !== "loading") {
        fn();
    }
    else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}
// Simple function to make a jsonp request and wrap in a Promise
// Url paramater will have the name of the callback appended
// Adapted from https://github.com/camsong/fetch-jsonp
function jsonp(url) {
    return new Promise((resolve) => {
        // Create a random name for the callback function (so we can create many of them indpendently)
        let callbackName = `callback_jsonp_${Date.now()}_${Math.ceil(Math.random() * 100000)}`;
        // Add our callback function to the global window object which handles the JSON response from the URL
        window[callbackName] = function (response) {
            // Pass the received JSON to the Promsie
            resolve(response);
            // Remove the script tag and the name in the the global window object
            const script = document.getElementById(callbackName);
            document.getElementsByTagName("head")[0].removeChild(script);
            delete window[callbackName];
        };
        // Add a script object to our document which will call our callback
        const script = document.createElement("script");
        script.setAttribute("src", url + callbackName);
        script.id = callbackName;
        document.getElementsByTagName("head")[0].appendChild(script);
    });
}
//# sourceMappingURL=wikipedia.js.map