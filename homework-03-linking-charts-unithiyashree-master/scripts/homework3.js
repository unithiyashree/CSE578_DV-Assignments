
var mapSvg;

var lineSvg;
var lineWidth;
var lineHeight;
var lineInnerHeight;
var lineInnerWidth;
var lineMargin = { top: 20, right: 60, bottom: 60, left: 100 };

var mapData;
var timeData;

var xScale;
var yScale;

// This runs when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
  mapSvg = d3.select('#map');
  lineSvg = d3.select('#linechart');
  lineWidth = +lineSvg.style('width').replace('px','');
  lineHeight = +lineSvg.style('height').replace('px','');;
  lineInnerWidth = lineWidth - lineMargin.left - lineMargin.right;
  lineInnerHeight = lineHeight - lineMargin.top - lineMargin.bottom;

  // Load both files before doing anything else
  Promise.all([d3.json('data/africa.geojson'),
               d3.csv('data/africa_gdp_per_capita.csv')])
          .then(function(values){
    
    mapData = values[0];
    timeData = values[1];
   
    drawMap();
  })

});

// Get the min/max values for a year and return as an array
// of size=2. You shouldn't need to update this function.
function getExtentsForYear(yearData) {
  var max = Number.MIN_VALUE;
  var min = Number.MAX_VALUE;
  for(var key in yearData) {
    if(key == 'Year') 
      continue;
    let val = +yearData[key];
    if(val > max)
      max = val;
    if(val < min)
      min = val;
  }
  return [min,max];
}

// Draw the map in the #map svg
function drawMap() {

  // create the map projection and geoPath
  let projection = d3.geoMercator()
                      .scale(400)
                      .center(d3.geoCentroid(mapData))
                      .translate([+mapSvg.style('width').replace('px','')/2,
                                  +mapSvg.style('height').replace('px','')/2.3]);
  let path = d3.geoPath()
               .projection(projection);

  // get the selected year based on the input box's value
  var year = d3.select('#year-input')
               .property("value");

  d3.select("#year-input").on("change", change_year);

  let yearData = timeData.filter( d => d.Year == year)[0];

  let extent = getExtentsForYear(yearData);

  var color = d3.select('#color-scale-select')
                    .property("value"); 
  d3.select("#color-scale-select").on("change", change_color);

  graph(year, color);

  // d3.select("#year-input").on("change", change_year);
  function change_year(){
    year = d3.select('#year-input')
             .property("value");
    // console.log(year);

    graph(year, color);
  }

  // d3.select("#color-scale-select").on("change", change_color);
  function change_color(){
      color = d3.select('#color-scale-select')
                .property("value");                  
      // console.log(color);

      graph(year,color);
  }

  function graph(year, color){

    mapSvg.selectAll('*').remove();

    // get the GDP values for countries for the selected year
    let yearData = timeData.filter( d => d.Year == year)[0];
    //console.log(yearData);
    
    // get the min/max GDP values for the selected year
    let extent = getExtentsForYear(yearData);

    console.log(year);
    console.log(color);

    var colorScale;

    // Setting the color value to the colorScale
    if(color == "interpolateRdYlGn"){
        var colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
                           .domain(extent);      
    }
    else if(color == "interpolateViridis"){
        //console.log("check");
        var colorScale = d3.scaleSequential(d3.interpolateViridis)
                           .domain(extent);
    }
    else if(color == "interpolateBrBG"){
        var colorScale = d3.scaleSequential(d3.interpolateBrBG)
                           .domain(extent);
    }
    else if(color == "interpolatePuOr"){
        var colorScale = d3.scaleSequential(d3.interpolatePuOr)
                           .domain(extent);
    }
    else if(color == "interpolatePiYG"){
        var colorScale = d3.scaleSequential(d3.interpolatePiYG)
                           .domain(extent);
    }
    
    var div = d3.select("body").append("div")
                               .attr("class", "tooltip")
                               .style("opacity", 0);

    // draw the map on the #map svg
    let g = mapSvg.append('g');

    g.selectAll('path')
        .data(mapData.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('id', d => { return d.properties.name})
        .attr('class','countrymap')
        .style('fill', d => {
          let val = +yearData[d.properties.name];
          if(isNaN(val)) 
            return 'white';
          return colorScale(val);
        })

        .on('mouseover', function(d,i) {
          console.log('mouseover on ' + d.properties.name);
          d3.select(this).classed("countrymap", false);
          d3.select(this).attr("stroke", "#00FFFF").attr("stroke-width", 4);

          div.transition()
             .duration(50)
             .style("opacity", 1);

          var ygdp = yearData[d.properties.name];
          if(yearData[d.properties.name] == undefined){
            ygdp = 0;
          }
          else if(yearData[d.properties.name] == ""){
            ygdp = 0;
          }

          div.html("Country: " + d.properties.name + "<br>" + "GDP: " + ygdp)
             .style("left", (d3.event.pageX + 10) + "px")
             .style("top", (d3.event.pageY + 15) + "px");

        })

        .on('mousemove',function(d,i) {
          console.log('mousemove on ' + d.properties.name);
          var ygdp = yearData[d.properties.name];
          if(yearData[d.properties.name] == undefined){
            ygdp = 0;
          }
          else if(yearData[d.properties.name] == ""){
            ygdp = 0;
          }

          div.html("Country: " + d.properties.name + "<br>" + "GDP: " + ygdp)
             .style("left", (d3.event.pageX + 20) + "px")
             .style("top", (d3.event.pageY - 45) + "px");
          
        })

        .on('mouseout', function(d,i) {
          console.log('mouseout on ' + d.properties.name);
          d3.select(this).classed("countrymap", true);
          d3.select(this).attr("stroke", "black").attr("stroke-width", 1);

          div.transition()
             .duration('50')
             .style("opacity", 0);
        })

        .on('click', function(d,i) {
          console.log('clicked on ' + d.properties.name);
          drawLineChart(d.properties.name);

        });

      // Draw the color legend
      const defs = mapSvg.append("defs");
      const colorLegend = defs.append("linearGradient")
                              .attr("id", "linear-gradient");

      var margin = ({top: 20, right: 40, bottom: 30, left: 30});
      var barHeight = 20;
      var height = 550;
      var width = 230;
        
        
      var axisScale = d3.scaleLinear()
                        .domain(colorScale.domain())
                        .range([margin.left, width]);

      var axisBottom = g => g
        .attr("class", `x-axis`)
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(axisScale)
          .ticks(width / 50)
          .tickSize(-barHeight));

      colorLegend.selectAll("stop")
                 .data(colorScale.ticks().map((t, i, n) => 
                  ({ offset: `${100*i/n.length}%`, color: colorScale(t) })))
                 .enter().append("stop")
                 .attr("offset", d => d.offset)
                 .attr("stop-color", d => d.color);
        
      mapSvg.append('g')
            .attr("transform", `translate(0,${height - margin.bottom - barHeight})`)
            .append("rect")
            .attr('transform', `translate(${margin.left}, 0)`)
            .attr("width", width - margin.left)
            .attr("height", barHeight)
            .style("fill", "url(#linear-gradient)");
      
      mapSvg.append('g')
            .call(axisBottom);
  }
 
}

// Draw the line chart in the #linechart svg for
// the country argument (e.g., `Algeria').
function drawLineChart(country) {

  lineSvg.selectAll('*').remove();

  if(!country)
    return;

  var dataGDP = [];

  let countryGDP = timeData.filter( d => {
     dataGDP.push({"year":d["Year"], "gdp": (d[country]!='')? (d[country]!=undefined?+d[country]:0):0})
     return;  
 });

  console.log("GDP Data ", dataGDP);

  // Adding the x-axis scale
  xScale = d3.scaleTime()
             .domain([1960,2011])
             .range([lineMargin.left, lineInnerWidth + lineMargin.left]);


  // Adding the y-axis scale
  yScale = d3.scaleLinear()
                 .domain([0, d3.max(dataGDP, function(d) { return +d.gdp; })])
                 .range([lineInnerHeight + lineMargin.top, lineMargin.top ]);

  //let g = lineSvg.append('g');

  var bisect = d3.bisector(function(d) { return d.year; }).left;

  // Adding the path
  lineSvg.append("path")
          .datum(dataGDP)
          .attr("fill", "none")
          .attr("stroke", "black")
          .attr("stroke-width", 2)
          .attr("class", "line")
          .attr("d", d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.gdp)));

  addAxis(country, dataGDP);

  var tooltip = d3.select("body").append("div")
                                 .attr("class", "tooltip-lineGraph")
                                 .style("opacity", 0);

  var focus_tooltip = lineSvg.append('g')
                             .append('circle')
                             .style("opacity", 0)
                             .style("fill", "none")
                             .attr('r', 10)
                             .attr("stroke", "black");
                             

  lineSvg.append('rect')
          .style("fill", "none")
          .style("pointer-events", "all")
          .attr('height', lineHeight - lineMargin.top)
          .attr('width',  lineWidth - lineMargin.right)
          .on('mouseover', function(d){
            console.log('mouseover on ' + country);

            focus_tooltip.style("opacity", 1);

            tooltip.transition()
                   .duration('50')
                   .style("opacity", 1);
          })

          .on('mousemove', function(d){
            console.log('mouseout on ' + country);

            //Getting the values of the coordinates
            var x = xScale.invert(d3.mouse(this)[0]);
            var i = bisect(dataGDP, x, 1);
            currentData = dataGDP[i];

            focus_tooltip.attr("cx", xScale(currentData.year))
                         .attr("cy", yScale(currentData.gdp));

            tooltip.html("Year: " + currentData.year + "  <br>  " + "GDP:" + currentData.gdp)
                   .style("left", (d3.event.pageX + 20) + "px")
                   .style("top", (d3.event.pageY - 50) + "px");
            
          })

          .on('mouseout', function(d){
            console.log('mouseout on ' + country);

            focus_tooltip.style("opacity", 0);

            tooltip.transition()
                   .duration('50')
                   .style("opacity", 0);
          });
}

function addAxis(country, dataGDP) {

  // Adding the x-axis
  lineSvg.append("g")
         .attr("transform", "translate("+ 0 +"," + (lineHeight - lineMargin.bottom) + ")")
         .call(d3.axisBottom(xScale)
          .tickFormat(df => df%10==0 ? d3.format('0.0f')(df) : "")
          .ticks(12))
         .style("color","gray");

  // Adding label to the x-axis
  lineSvg.append("text")             
         .attr("transform", "translate(" + (( lineWidth + lineMargin.right)/2) + " ," + 
                       (lineHeight - lineMargin.top) + ")")
         .style("fill","gray")
         .style("text-anchor", "middle")
         .text("Year");

  // Adding the y-axis
  lineSvg.append("g")
         .attr("transform", `translate(${lineMargin.left},0)`)
         .call(d3.axisRight(yScale)
            .tickSize((lineWidth - lineMargin.left - lineMargin.right)))
         .style("color","gray")
         .call(g => g.select(".domain")
            .remove())
         .call(g => g.selectAll(".tick:not(:first-of-type) line")
            .attr("stroke-opacity", 0.5)
            .attr("stroke", "gray")
            .attr("stroke-dasharray", "5,10"))
         .call(g => g.selectAll(".tick text")
            .attr("text-anchor","end")
            .attr("x", -4)
            .attr("dy", 4));

  // Adding label to the y-axis
  lineSvg.append("text")
         .attr("transform", "rotate(-90)")
         .attr("x",- ( lineHeight/2))
         .attr("y", ( lineMargin.left - lineMargin.right))
         .attr("dy", "1em")
         .style("fill","gray")
         .style("text-anchor", "middle")
         .text("GDP for "+ country +" (based on current USD)");
}
