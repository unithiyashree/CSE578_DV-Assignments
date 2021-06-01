 // Set the dimensions of the canvas / graph
const margin = {top: 10, right: 20, bottom: 50, left: 50};
const width = 800 - margin.left - margin.right;
const height = 470 - margin.top - margin.bottom;
const padding = 100;

// parse the date / time
const parseTime = d3.timeParse("%d-%b-%y");

// set the ranges
const xScale = d3.scaleLog()
                 .range([0, width]);
const yScale = d3.scaleLinear()
                  .range([height, 0]);

var color = d3.scaleOrdinal(d3.schemeCategory10);

// append the svg object to the body of the page
// append a g (group) element to 'svg' and
// move the g element to the top+left margin
var svg = d3.select(".center").append("svg")
                           .attr("width", width + margin.left + margin.right)
                           .attr("height", height + margin.top + margin.bottom)
                           .append("g")
                           .attr("transform", `translate(${margin.left},${margin.top})`);


// Get the data
d3.tsv("data/gapminderDataFiveYear.tsv").then(data => {

    //data.filter(function(d){ return  (d.year == "1952" || d.name == "2007") })
    // format the data such that strings are converted to their appropriate types
    data.forEach(function(d) {
        d.year = Number(d.year);
        d.pop = Number(d.pop);
        d.lifeExp = Number(d.lifeExp);
        d.gdpPercap = Number(d.gdpPercap);
    });

    // Set scale domains based on the loaded data
    xScale.domain(d3.extent(data, function(d) { 
                            if(d.year == 1952 || d.year == 2007)
                                {return d.gdpPercap; }
                        }));
    yScale.domain(d3.extent(data, function(d) { 
                            if(d.year == 1952 || d.year == 2007){return d.lifeExp; }
                        }));


    var scale_range = d3.scaleLinear()
                     .domain([d3.min(data, function(d) { return d.pop; }), d3.max(data, function(d) { return d.pop; }) ])
                     .range([4, 10]);
    
    // Add the scatterplot
    svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .filter(function(d) { return d.year == 1952})
        .attr("r", function(d) { return scale_range(d.pop) })
        .attr("cx", function(d) { return xScale(d.gdpPercap); })
        .attr("cy", function(d) { return yScale(d.lifeExp); })
        .style("opacity", .8)
        .style("fill", color(3) );

    // Add the scatterplot
    svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .filter(function(d) { return d.year == 2007})
        .attr("r", function(d) { return scale_range(d.pop) })
        .attr("cx", function(d) { return xScale(d.gdpPercap); })
        .attr("cy", function(d) { return yScale(d.lifeExp); })
        .style("opacity", .8)
        .style("fill", color(4) );

    // Add the y axe
    const yAxis = d3.axisLeft(yScale);
    svg.append("g")
        .call(yAxis);

    // now add title to y axis
    svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", 0 - margin.left)
       .attr("x",0 - (height / 2))
       .attr("dy", "1em")
       .attr("font-family","sans-serif")
       .attr("font-size","14px")
       .attr("font-weight","700")
       .style("text-anchor", "middle")
       .text("Life Expectancy"); 

    // Add the x axe
    const xAxis = d3.axisBottom(xScale)
                    .ticks(11, ".0s");
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .style("font-family","Lato")
        .call(xAxis);

    // text label for the x axis
    svg.append("text")             
       .attr("transform", "translate(" + (width/2) + " ," + (height + margin.top + 30) + ")")
       .style("text-anchor", "middle")
       .style("font-family","sans-serif")
       .style("font-size","14px")
       .style("font-weight","700")
       .text("GDP per Capita");

    // Adding title to the chart
    svg.append("text")             
       .attr("transform", "translate(" + (width/2) + " ," + (margin.top - 5) + ")")
       .style("text-anchor", "middle")
       .style("font-family","sans-serif")
       .style("font-size","16px")
       .style("font-weight","700")
       .style("text-decoration", "underline")
       .text("GDP vs Life Expectancy (1952, 2007)");


    //Adding legends to the graph
    svg.selectAll("dot")
       .data([1952, 2007])
       .enter()
       .append("rect")
       .attr("x", width - 50)
       .attr("y", function( d, i){ return margin.top + i * ( 15 + 5)})
       .attr("width", 15)
       .attr("height", 15)
       .style("fill", function( d){ 
            if(d == 1952)
                return color(3);
            else 
                return color(4);
        })

    //Adding labels to the legends
    svg.selectAll("Labels")
       .data([1952, 2007])
       .enter()
       .append("text")
       .attr("x", width - 45 + 15*1.0)
       .attr("y", function( d, i){ return margin.top + i * ( 15 + 5) + ( 15/2) + 3 })
       .style("fill", function( d){ return "#000000" })
       .attr("font-family", "sans-serif")
       .attr("font-size", "11px")
       .text(function(d){ return d});
});

    







