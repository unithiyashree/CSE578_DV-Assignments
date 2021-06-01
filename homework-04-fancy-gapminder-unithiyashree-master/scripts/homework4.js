const plot_width = 800;
const plot_height = 600;
const padding = 100;

var countryData;
var data_women_15to24;
var data_men_15to24;
var data_women_above25;
var data_men_above25;
var data_women_above65;
var data_men_above65;

var svg;

var xScale;
var yScale;

var year;
var region;
var xAttribute;
var yAttribute;
var xAxis_Label;
var yAxis_Label;

var timer;
var year_changing = false;
var changed_year = 1970;
var button_input1 = "";

var country_cat = {};
var country_geo = {};

var country_data_men_15to24 = {}
var country_data_women_15to24 = {}
var country_data_men_above25 = {}
var country_data_women_above25 = {}
var country_data_men_above65 = {}
var country_data_women_above65 = {}

var max_data_men_15to24 = 0;
var max_data_women_15to24 = 0;
var max_data_men_above25 = 0;
var max_data_women_above25 = 0;
var max_data_men_above65 = 0;
var max_data_women_above65 = 0;


// This runs when the page is loaded
document.addEventListener('DOMContentLoaded', function() {

  // Load both files before doing anything else
  Promise.all([d3.csv('data/countries_regions.csv'),
               d3.csv('data/mean_years_in_school_men_15_to_24_years.csv'),
               d3.csv('data/mean_years_in_school_women_15_to_24_years.csv'),
               d3.csv('data/mean_years_in_school_men_25_years_and_older.csv'),
               d3.csv('data/mean_years_in_school_women_25_years_and_older.csv'),
               d3.csv('data/mean_years_in_school_men_65_plus_years.csv'),
               d3.csv('data/mean_years_in_school_women_65_plus_years.csv')])
          .then(function(values){
            countryData = values[0];
            data_men_15to24 = values[1];
            data_women_15to24 = values[2];
            data_men_above25 = values[3];
            data_women_above25 = values[4];
            data_men_above65 = values[5];
            data_women_above65 = values[6];

            // console.log(countryData);
            // console.log(data_men_above25);

          console.log("Code started.");

          //console.log(countryData);
          for (var i = 0; i < countryData.length; i++) {

            if( !(countryData[i].Worldbankregion in country_cat)){

              country_cat[countryData[i].Worldbankregion] = [];
              country_cat[countryData[i].Worldbankregion].push(countryData[i].name);

              if(!(countryData[i].name in country_geo)){
                country_geo[countryData[i].name] = countryData[i].geo;
              }
            }
            else{
              country_cat[countryData[i].Worldbankregion].push(countryData[i].name);
              if(!(countryData[i].name in country_geo)){
                country_geo[countryData[i].name] = countryData[i].geo;
              }
            }
          }

          // console.log("Country Category Data :", country_cat);
          // console.log("Country Geo Data :", country_geo);

          // Arranging the attribute data in dictionaries
          country_data_men_15to24 = create_data_for_attributes(data_men_15to24);
          country_data_women_15to24 = create_data_for_attributes(data_women_15to24);
          country_data_men_above25 = create_data_for_attributes(data_men_above25);
          country_data_women_above25 = create_data_for_attributes(data_women_above25);
          country_data_men_above65 = create_data_for_attributes(data_men_above65);
          country_data_women_above65 = create_data_for_attributes(data_women_above65);

          // console.log("country_data_men_15to24 : ", country_data_men_15to24);
          // console.log("country_data_women_15to24 : ", country_data_women_15to24);
          // console.log("country_data_men_above25 : ", country_data_men_above25);
          // console.log("country_data_women_above25 : ", country_data_women_above25);
          // console.log("country_data_men_above65 : ", country_data_men_above65);
          // console.log("country_data_women_above65 : ", country_data_women_above65);

          // Calculating the maximum values for the attributes to draw the scale
          max_data_men_15to24 = max_value(country_data_men_15to24);
          max_data_women_15to24 = max_value(country_data_women_15to24);
          max_data_men_above25 = max_value(country_data_men_above25);
          max_data_women_above25 = max_value(country_data_women_above25);
          max_data_men_above65 = max_value(country_data_men_above65);
          max_data_women_above65 = max_value(country_data_women_above65);

          // console.log("Max value of data_men_15to24 : ", max_data_men_15to24);
          // console.log("Max value of data_women_15to24 : ", max_data_women_15to24);
          // console.log("Max value of data_men_above25 : ", max_data_men_above25);
          // console.log("Max value of data_women_above25 : ", max_data_women_above25);
          // console.log("Max value of data_men_above65 : ", max_data_men_above65);
          // console.log("Max value of data_women_above65 : ", max_data_women_above65);

          // get the selected year
          year = d3.select('#year-input').property("value");

          // get the selected region
          region = d3.select('#region').property("value");

          // get the selected region
          xAttribute = d3.select('#x-attribute').property("value");

          // get the selected region
          yAttribute = d3.select('#y-attribute').property("value");

          drawScatterPlot(year, region, xAttribute, yAttribute);
  })

});

function create_data_for_attributes(input_data){
  output = {}
  for (var i = 0; i < input_data.length; i++) {
    if(!(input_data[i].country in output)){
      output[input_data[i].country] = {};
    }
    var obj = input_data[i];
    for(var key in obj){
      if(key!='country'){
        output[input_data[i].country][key] = +obj[key];
      }
    }
  }
  return output;
}

function max_value(data_dict){
  var temp = [];
  for( var key in data_dict){
    var temp_array = Object.values(data_dict[key]);
    temp.push(Math.max(...temp_array));
  }
  return Math.max(...temp); 
}


function get_attribute_data(value){
  if( value == "mean_men_15to24")
    return country_data_men_15to24;
  else if( value == "mean_women_15to24")
    return country_data_women_15to24;
  else if( value == "mean_men_above25")
    return country_data_men_above25;
  else if( value == "mean_women_above25")
    return country_data_women_above25;
  else if( value == "mean_men_above65")
    return country_data_men_above65;
  else if( value == "mean_women_above65")
    return country_data_women_above65;
}

function get_final_values_for_scatterplot(x_attributeData_dict, y_attributeData_dict, countries_list){
  
  // Checking values
  // console.log("$$$$$ Checking xAttr_data : ", x_attributeData_dict);
  // console.log("$$$$$ Checking yAttr_data : ", y_attributeData_dict);
  // console.log("$$$$$ Countries in selected Region :", countries_list);

  var result = []
  for(var i = 0;i < countries_list.length; i ++){
      if(x_attributeData_dict.hasOwnProperty(countries_list[i])){
        if(y_attributeData_dict.hasOwnProperty(countries_list[i]))
        {
          var x_tobj = x_attributeData_dict[countries_list[i]];
          var y_tobj = y_attributeData_dict[countries_list[i]];
          //console.log(tobj[year]);
          if (x_tobj.hasOwnProperty(year)) {
            if(y_tobj.hasOwnProperty(year)){
              result.push({'country':countries_list[i],'x':x_tobj[year], 'y':y_tobj[year], 'geo':country_geo[countries_list[i]]});
            }
            else{
              result.push({'country':countries_list[i],'x':x_tobj[year], 'y':0, 'geo':country_geo[countries_list[i]]});
            }
            
          }
          else{
            if(y_tobj.hasOwnProperty(year)){
              result.push({'country':countries_list[i],'x':0, 'y':y_tobj[year], 'geo':country_geo[countries_list[i]]});
            }
            else{
              result.push({'country':countries_list[i],'x':0, 'y':0, 'geo':country_geo[countries_list[i]]});
            }
          }
        }
        else{
          var x_tobj = x_attributeData_dict[countries_list[i]];
          if (x_tobj.hasOwnProperty(year)) {
            result.push({'country':countries_list[i],'x':x_tobj[year], 'y':0, 'geo':country_geo[countries_list[i]]});
          }
          else{
              result.push({'country':countries_list[i],'x':0, 'y':0, 'geo':country_geo[countries_list[i]]});
          }
        }
      }
      else{
        if(y_attributeData_dict.hasOwnProperty(countries_list[i])){
          if(y_tobj.hasOwnProperty(year)){
            result.push({'country':countries_list[i],'x':0, 'y':y_tobj[year], 'geo':country_geo[countries_list[i]]});
          }
          else{
            result.push({'country':countries_list[i],'x':0, 'y':0, 'geo':country_geo[countries_list[i]]});
          }
        }
      }
  }
  // console.log("$$$$$ result :", result)
  return result;
}

function set_dots_color(region){
  if(region == "South Asia")
    return "#D53100";
  else if(region == "Europe & Central Asia")
    return "#3339FF";
  else if(region == "Middle East & North Africa")
    return "#872D9B";
  else if(region == "East Asia & Pacific")
    return "#37A250";
  else if(region == "Sub-Saharan Africa")
    return "#F2F18B";
  else if(region == "Latin America & Caribbean")
    return "#E16F10";
  else if(region == "North America")
    return "#681FE8";
}

function get_max_attribute(value){
  if( value == "mean_men_15to24")
    return max_data_men_15to24;
  else if( value == "mean_women_15to24")
    return max_data_women_15to24;
  else if( value == "mean_men_above25")
    return max_data_men_above25;
  else if( value == "mean_women_above25")
    return max_data_women_above25;
  else if( value == "mean_men_above65")
    return max_data_men_above65;
  else if( value == "mean_women_above65")
    return max_data_women_above65;
}

function get_axis_label(value){
  if( value == "mean_men_15to24")
    return "Mean years in school of men between 15 and 24 years";
  else if( value == "mean_women_15to24")
    return "Mean years in school of women between 15 and 24 years";
  else if( value == "mean_men_above25")
    return "Mean years in school of men above 25 years"
  else if( value == "mean_women_above25")
    return "Mean years in school of women above 25 years";
  else if( value == "mean_men_above65")
    return "Mean years in school of men above 65 years";
  else if( value == "mean_women_above65")
    return "Mean years in school of women above 65 years";
}

function get_data_for_drawing() {

  // Getting the data for the selected Atrributes
  var xAttr_data = get_attribute_data(xAttribute);
  var yAttr_data = get_attribute_data(yAttribute);

  // console.log("xAttr_data : ", xAttr_data);
  // console.log("yAttr_data : ", yAttr_data);

  // Getting the list of countries in the region
  var countries_list = country_cat[region];
  console.log("Countries in selected Region :", countries_list);

  // Getting the values of x and y attributes for the corresponding
  // countries in the region for the selected year
  var result = get_final_values_for_scatterplot( xAttr_data, yAttr_data, countries_list);
  // console.log("xy_result : ", result);

  return result;

}

function step() {
  
  // Printing the selected values
  // console.log("Year :", year);
  // console.log("Region:", region);
  // console.log("X-Attribute :", xAttribute);
  // console.log("Y-Attribute :", yAttribute);
  // console.log("X-Axis Label :", xAxis_Label);
  // console.log("Y-Axis Label :", yAxis_Label);

  d3.select('#year-input').property('value',changed_year);
  console.log("Current Year :", changed_year);
  year = changed_year;

  svg.selectAll(".bg_year").remove();

  // Updating year value in the background
  svg.append("text")
      .attr("class", "bg_year")
      .attr("text-anchor", "end")
      .attr("x", plot_width - 200)
      .attr("y", plot_height - 120)
      .text(year)
      .attr("opacity","0.4")
      .attr("font-size", "100px")
      .attr("fill", "gray");

  var xy_result = get_data_for_drawing();
  console.log("Updated xy_result : ", xy_result);

  // Creating x Scale
  var xScale = d3.scaleLinear()
                 .domain([0, get_max_attribute(xAttribute)])
                 .range([padding, plot_width - padding * 2]);

  // Creating y Scale
  var yScale = d3.scaleLinear()
                 .domain([0, get_max_attribute(yAttribute)])
                 .range([plot_height - padding, padding]);

  circle_transition(svg, xy_result, xScale, yScale);

  changed_year += 1;
  if (changed_year > 2015) {
    year_changing = false;
    changed_year = 1965;
    clearInterval(timer);
    button_input1.text("Play");
  }
}


function circle_transition(svg, xy_result, xScale, yScale){

  var div = d3.select("body").append("div")
                             .attr("class", "tooltip")
                             .style("opacity", 0);

  //rejoin data
  var circle = svg.select("g")
                  .selectAll("circle")
                  .data(xy_result);

  // Removing unnecessary circles
  circle.exit()
        .transition()
        .duration(500)
        .attr('r',0)
        .remove();

  // Creating new circles 
  circle.enter()
        .append("circle")
        .attr("r",0)
        .merge(circle)
        .on('mouseover', function(d) {
          console.log('mouseover on ' + d.country);

          div.transition()
             .duration(50)
             .style("opacity", 1);

          div.html("Country: " + d.country)
             .style("left", (d3.event.pageX + 10) + "px")
             .style("top", (d3.event.pageY + 15) + "px");

          })

        .on('mousemove',function(d) {
          console.log('mousemove on ' + d.country);

          div.html("Country: " + d.country)
             .style("left", (d3.event.pageX + 20) + "px")
             .style("top", (d3.event.pageY - 45) + "px");
                
          })

        .on('mouseout', function(d) {
          console.log('mouseout on ' + d.country);

          div.transition()
             .duration('50')
             .style("opacity", 0);

          })
        .transition()
        .duration(1000)
        .attr("cx", function (d) { return xScale(d.x); } )
        .attr("cy", function (d) { return yScale(d.y); } )
        .attr("r", 17)
        .attr("stroke", "#000000")
        .attr("stroke-width", 1)
        .style("fill", set_dots_color(region));

  // Updating the label inside the circle
  var circle_text = svg.selectAll(".dotLabel")
                       .data(xy_result);
    
  circle_text.exit()
             .transition()
             .duration(1000)
             .attr("opacity", 0)
             .remove();

  circle_text.enter()
             .append("text")
             .merge(circle_text)
             .text( function (d) { return d.geo; })
             .attr("class", "dotLabel")
             .transition()
             .duration(1000)
             .attr("x", function(d) { return xScale(d.x) - 9; })
             .attr("y", function(d) { return yScale(d.y) + 4; })
             .attr("font-family", "sans-serif")
             .attr("font-size", "15px")
             .attr("fill", "black");
}

// Draw the scatterPlot in the #svg 
function drawScatterPlot() {

  console.log("##### Draw Scattered Plot running #####")

  var plot_width = 800;
  var plot_height = 600;
  var padding = 100;

  //Assigning the labels to the axises
  xAxis_Label = get_axis_label(xAttribute);
  yAxis_Label = get_axis_label(yAttribute);

  // Printing the selected values
  console.log("Year :", year);
  console.log("Region:", region);
  console.log("X-Attribute :", xAttribute);
  console.log("Y-Attribute :", yAttribute);
  console.log("X-Axis Label :", xAxis_Label);
  console.log("Y-Axis Label :", yAxis_Label);

  // Getting the values of x and y attributes for the corresponding
  // countries in the region for the selected year
  var xy_result = get_data_for_drawing();
  console.log("xy_result : ", xy_result);

  // Getting the color for the region countries
  var dots_color = set_dots_color(region);
  // console.log("Color of dots :", dots_color);

  // append the svg object to the body of the page
  svg = d3.select("#scatterplot")
              .attr("width", plot_width)
              .attr("height", plot_height);
  
  
  svg.selectAll('*').remove();

  // Creating tooltip
  var div = d3.select("body").append("div")
                               .attr("class", "tooltip")
                               .style("opacity", 0);

  // Creating x Scale
  var xScale = d3.scaleLinear()
                 .domain([0, get_max_attribute(xAttribute)])
                 .range([padding, plot_width - padding * 2]);

  // Creating y Scale
  var yScale = d3.scaleLinear()
                 .domain([0, get_max_attribute(yAttribute)])
                 .range([plot_height - padding, padding]);

  // Creating year value in the background
  svg.append("text")
      .attr("class", "bg_year")
      .attr("text-anchor", "end")
      .attr("x", plot_width - 200)
      .attr("y", plot_height - 120)
      .text(year)
      .attr("opacity","0.4")
      .attr("font-size", "100px")
      .attr("fill", "gray");

  //Add dots to scatterplot
  svg.append("g")
     .selectAll("circle")
     .data(xy_result)
     .enter()
     .append("circle")
     .attr("cx", function (d) { return xScale(d.x); } )
     .attr("cy", function (d) { return yScale(d.y); } )
     .attr("r", 17)
     .attr("stroke", "#000000")
     .attr("stroke-width", 1)
     .style("fill", dots_color)

     .on('mouseover', function(d) {
        console.log('mouseover on ' + d.country);

        div.transition()
           .duration(50)
           .style("opacity", 1);

        div.html("Country: " + d.country)
           .style("left", (d3.event.pageX + 10) + "px")
           .style("top", (d3.event.pageY + 15) + "px");

        })

     .on('mousemove',function(d) {
        console.log('mousemove on ' + d.country);

        div.html("Country: " + d.country)
           .style("left", (d3.event.pageX + 20) + "px")
           .style("top", (d3.event.pageY - 45) + "px");
          
        })

     .on('mouseout', function(d) {
        console.log('mouseout on ' + d.country);

        div.transition()
           .duration('50')
           .style("opacity", 0);

        });

  // Adding the label inside the circle
  svg.selectAll(".dotLabel")
     .data(xy_result)
     .enter()
     .append("text")
     .text( function (d) { return d.geo; })
     .attr("class", "dotLabel")
     .attr("x", function(d) { return xScale(d.x) - 9; })
     .attr("y", function(d) { return yScale(d.y) + 4; })
     .attr("font-family", "sans-serif")
     .attr("font-size", "15px")
     .attr("fill", "black");

  // Adding x_axis
  var x_axis = d3.axisBottom(xScale);

  svg.append("g")
      .attr("class", "x_axis")
      .attr("transform", "translate(0," + (plot_height - padding) +")")
      .call(x_axis);

  // Adding x_axis label
  svg.append("text")
      .attr("class", "xAxis_label")
      .attr("text-anchor", "end")
      .attr("x", (plot_height - padding)/ 2 + 3 * padding)
      .attr("y", plot_height - padding + 50)
      .text(xAxis_Label);

  // Adding y_axis
  var y_axis = d3.axisLeft(yScale);

  svg.append("g")
      .attr("class", "y_axis")
      .attr("transform", "translate(" + padding +",0)")
      .call(y_axis);

  // Adding y_axis label
  svg.append("text")
      .attr("class", "yAxis_label")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("x", -2 * padding + 90)
      .attr("y", padding - 50)
      .text(yAxis_Label);

  // Functionality when year attribute changes
  d3.select('#year-input')
    .on("change", function() {

      console.log("##### year change");

      // get the selected year
      year = d3.select('#year-input').property("value");
    
      svg.selectAll(".bg_year").remove();
  
      // Updating year value in the background
      svg.append("text")
          .attr("class", "bg_year")
          .attr("text-anchor", "end")
          .attr("x", plot_width - 200)
          .attr("y", plot_height - 120)
          .text(year)
          .attr("opacity","0.4")
          .attr("font-size", "100px")
          .attr("fill", "gray");

      console.log("Changed Year: ", year);
      
      var xy_result = get_data_for_drawing();
      console.log("Updated xy_result : ", xy_result);

      circle_transition(svg, xy_result, xScale, yScale);

    });

  // Functionality when  x-attribute changes
  d3.select('#x-attribute')
    .on("change", function() {

      console.log("##### X-Attribute change");

      // get the x-Attribute
      xAttribute = d3.select('#x-attribute').property("value");
      console.log("Changed X-Attribute: ", xAttribute);

      // Updating x-axis label
      xAxis_Label = get_axis_label(xAttribute);

      var xy_result = get_data_for_drawing();
      console.log("Updated xy_result : ", xy_result);

      // Updating x Scale
      var xScale = d3.scaleLinear()
                     .domain([0, get_max_attribute(xAttribute)])
                     .range([padding, plot_width - padding * 2]);

      circle_transition(svg, xy_result, xScale, yScale);

      // Adding x_axis
      var x_axis = d3.axisBottom(xScale);

      svg.select(".x_axis")
         .transition()
         .duration(500)
         .call(x_axis);

      svg.select(".xAxis_label").remove();

      // Adding x_axis label
      svg.append("text")
          .attr("class", "xAxis_label")
          .attr("text-anchor", "end")
          .attr("x", (plot_height - padding)/ 2 + 3 * padding)
          .attr("y", plot_height - padding + 50)
          .text(xAxis_Label);

    });

  // Functionality when y-attribute changes
  d3.select('#y-attribute')
    .on("change", function() {

      console.log("##### Y-Attribute change");

      // get the y-Attribute
      yAttribute = d3.select('#y-attribute').property("value");
      console.log("Changed Y-Attribute: ", yAttribute);

      // Updating y-axis label
      yAxis_Label = get_axis_label(yAttribute);

      var xy_result = get_data_for_drawing();
      console.log("Updated xy_result : ", xy_result);

      // Updating y Scale
      var yScale = d3.scaleLinear()
                     .domain([0, get_max_attribute(yAttribute)])
                     .range([plot_height - padding, padding]);

      circle_transition(svg, xy_result, xScale, yScale);      

      // Adding y_axis
      var y_axis = d3.axisLeft(yScale);

      svg.select(".y_axis")
         .transition()
         .duration(500)
         .call(y_axis);

      svg.select(".yAxis_label").remove();

      // Adding y_axis label
      svg.append("text")
          .attr("class", "yAxis_label")
          .attr("text-anchor", "end")
          .attr("transform", "rotate(-90)")
          .attr("x", -2 * padding + 90)
          .attr("y", padding - 50)
          .text(yAxis_Label);

    });

  // Functionality when region changes
  d3.select('#region')
    .on("change", function() {

      console.log("##### Region change");

      // get the changed region
      region = d3.select('#region').property("value");
      console.log("Changed Region: ", region);

      var xy_result = get_data_for_drawing();
      console.log("Updated xy_result : ", xy_result);

      circle_transition(svg, xy_result, xScale, yScale);

    });

    // Functionality when play button is pressed
    d3.select("#play-input")
      .on("click", function() {

        console.log("##### Play button pressed.");

        // Get the button input
        var button_input = d3.select("#play-input");
        
        var button_input = d3.select(this);
        button_input1 = button_input;

        if (button_input.text() == "Pause") {
          year_changing = false;

          clearInterval(timer);
          button_input.text("Play");

        } else {
          year_changing = true;
          
          timer = setInterval(step, 1000);
          button_input.text("Pause");
          
        }
 
    });
}





