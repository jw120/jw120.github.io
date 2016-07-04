/* global d3 localRawDataset */

/*
 * Initialize svg and chart (independent of data)
 *
 */

// SVG element
var svgWidth = 800;
var svgHeight = 600;
var svg = d3.select("body").append("svg").attr("width", svgWidth).attr("height", svgHeight);

// Chart is an SVG group that fills the svg element less the margins
var margin = { top: 50, right: 20, bottom: 80, left: 50};
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;
var chart = svg.append("g").attr("class", "chart").attr("transform", translate(margin.left, margin.top));

// Gap between bars (negative to make sure they overlap)
var barGap = -0.5;

/*
 * Launch request for the remote data and start callback to use it
 *
 */

var dataURL = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json";

d3.json(dataURL, function (error, json) {

  var rawDataset;

  if (error) {
    console.error("Failed to fetch URL", error.message || error, "using local version");
  }
  if (json && json.data && json.data.length && json.data[0].length === 2) {
    rawDataset = json.data;
  } else {
    console.warn("Falling back to using local version of data");
    rawDataset = localRawDataset.data;
  }

  /*
   * Extract series we need from raw data into the working dataset we will use
   *
   */

  var timeFormat = d3.time.format("%Y-%m-%d");
  var dataset = rawDataset.map(function (xs) { return { date: timeFormat.parse(xs[0]), gdp: xs[1] }; });

  /*
   * Set up the scales for the graph and draw the axes
   *
   */

  // x-axis is time-based and runs from first to last data point
  var xScale= d3.time.scale()
    .domain([dataset[0].date, dataset[dataset.length - 1].date])
    .range([0, chartWidth]);
  var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
  chart.append("g").attr("class", "axis x-axis").attr("transform", translate(0, chartHeight)).call(xAxis);

  // y-axis scaled to accomodate largest GDP entry
  var yScale = d3.scale.linear()
    .domain([0, d3.max(dataset.map(function (d) { return d.gdp; }))])
    .range([chartHeight, 0]);
  var yAxis = d3.svg.axis().scale(yScale).orient("left");
  chart.append("g").attr("class", "axis y-axis").call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6) // Text anchor is about 6 units down from the top of the chart
      .attr("dy", ".71em") // Makes text anchor point about the cap height (instead of the bottom)
      .style("text-anchor", "end")
      .text("$ Billions (seasonly adjusted)");

  /*
  * Add title and source
  *
  */

  chart
    .append("text")
      .attr("class", "title")
      .attr("x", chartWidth * 0.5)
      .attr("y", chartHeight * 0.1)
      .attr("text-anchor", "middle")
      .text("U.S. Gross Domestic Product");
  chart
    .append("a")
      .attr("xlink:href", "http://www.bea.gov/national/pdf/nipaguid.pdf")
      .append("text")
        .attr("class", "source")
        .attr("x", chartWidth * 0.5)
        .attr("y", chartHeight + margin.bottom * 0.5)
        .attr("text-anchor", "middle")
        .text("See: A Guide to the National Income and Product Accounts of the United States, " +
              "http://www.bea.gov/national/pdf/nipaguid.pdf");

  /*
   * Define tooltips
   *
   */

  var tip = d3.tip().attr("class", "d3-tip").offset([-10, 0]).html(tooltipHTML);
  chart.call(tip);

  /*
   * Add bars to the bar chart
   *
   */

  chart
    .append("g")
      .selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
        .attr("class", "bar")
        .attr("x", function (d) { return xScale(d.date); })
        .attr("y", function (d) { return yScale(d.gdp); })
        .attr("width", chartWidth / dataset.length - barGap)
        .attr("height", function (d) { return chartHeight - yScale(d.gdp); })
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);

});



/** Helper function to return the tooltip for a specific data point
 * @param {Object} d - the data item to provide the tooltip for
 * @returns {string} - HTML for the tooltip
*/
function tooltipHTML(d) {

  var quarter = 1 + Math.floor((d.date.getMonth()) / 3);

  var t = '<div class="tip-date">' +  d.date.getFullYear() + " Q" + quarter + "</div>" +
          '<div class="tip-gdp">' + "$ " + addCommas(d.gdp) + " b" +  "</div>";

  return t;

}


/** Helper function to add stringified version of translate
 * @param {number} x - Horizontal distance for the translation
 * @param {number} y - Vertical distance for the translation
 * @returns {string} - Stringified version of the translation
*/
function translate(x, y) {
  return "translate(" + x + ", " + y + ")";
}

/** Helper function to add commas to a number
 * @param {numbr | string} x - Number to add commas to
 * @returns {string} - String representing the number with commas for thousands, millions etc
 */
function addCommas(x) {

  if (typeof x === "number") {
    return (x < 0) ? "-" + addCommas((-x).toString()) : addCommas(x.toString());
  }

  var point = x.indexOf(".");
  if (point !== -1) {
    return addCommas(x.substr(0, point)) + x.substr(point);
  }

  if (x.length > 3) {
    return addCommas(x.substr(0, x.length - 3)) + "," + x.substr(-3);
  }

  return x;

}

