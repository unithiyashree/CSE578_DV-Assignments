var svg;

var lineSvg;
var lineWidth;
var lineHeight;

const plot_width = 800;
const plot_height = 600;
const padding = 100;

var dogsInput = {};
var flightInput = {};

var dogsData = {};
var flightData = {};

var year;
var changed_year = 1951;


var max_yAxis;

// This runs when the page is loaded
document.addEventListener('DOMContentLoaded', function() {

    lineSvg = d3.select('#trend')
                .attr("width", 300)
                .attr("height", 600);;

    // Load both files before doing anything else
    Promise.all([d3.csv('data/Dogs-Database.csv'),
                 d3.csv('data/Flights-Database.csv')])
            .then( function(values){
                dogsInput = values[0];
                flightInput = values[1];

                console.log("Code started.");

                //console.log("Dogs Input : ", dogsInput);
                //console.log("Flights Input : ", flightInput);

                var temp = [];
                for( var i = 0; i < flightInput.length; i ++){
                    //console.log(flightInput[i].Altitude + " " + isNaN(flightInput[i].Altitude));
                    if( ! isNaN(flightInput[i].Altitude))
                        temp.push(flightInput[i].Altitude);
                }
                max_yAxis = Math.max(...temp);
                //console.log("Y-axis Max : ", max_yAxis);

                for (var i = 0; i < flightInput.length; i++) {
                    var date = flightInput[i].Date;
                    var year = date.split("-")[0];
                    // console.log("Year : ", year);

                    if( !(year in flightData) ){
                        flightData[year] = {};
                        if( !(date in flightData[year]) ){
                            var temp = flightData[year];
                            temp[date] = {};
                            temp[date].rocket = flightInput[i].Rocket;
                            temp[date].result = flightInput[i].Result;
                            temp[date].dogs = flightInput[i].Dogs.split(",")
                            if( isNaN(flightInput[i].Altitude))
                                temp[date].altitude = 0;
                            else
                                temp[date].altitude = flightInput[i].Altitude;

                        }
                        else
                            console.log("ERROR");

                    }
                    else{
                        var temp = flightData[year];
                        temp[date] = {};
                        temp[date].rocket = flightInput[i].Rocket;
                        temp[date].result = flightInput[i].Result;
                        temp[date].dogs = flightInput[i].Dogs.split(",")
                        if( isNaN(flightInput[i].Altitude))
                                temp[date].altitude = 0;
                            else
                                temp[date].altitude = flightInput[i].Altitude;
                    }
                }

                console.log("Flights Data : ", flightData);

                for (var i = 0; i < dogsInput.length; i++) {

                    // var dates = dogsInput[i].Flights.split(",");

                    if( !(dogsInput[i].NameLatin in dogsData)){
                        dogsData[dogsInput[i].NameLatin] = {};
                        dogsData[dogsInput[i].NameLatin].gender = dogsInput[i].Gender;
                        dogsData[dogsInput[i].NameLatin].fate = dogsInput[i].Fate;
                        dogsData[dogsInput[i].NameLatin].flights = (dogsInput[i].Flights).split(",");
                    }
                    else
                        console.log("ERROR - ", dogsInput[i].NameLatin);
                }

                console.log("Dogs Data : ", dogsData);

                for( var i = 0; i < flightData["1951"].length; i ++){
                    var dogs = flightData.dogs;
                    console.log("Name of the Flight : ", flightData[i].rocket);
                    console.log("Result of Flight : ", flightData[i].result);
                    for( var j = 0; j < 2; j ++){
                        console.log(dogsData[dogs[j]].gender);
                    }
                    console.log(" ");
                }

                // get the selected year
                year = d3.select('#year-input').property("value");

                drawPlot(year);
    })
});

function get_finalData(year){

    var result = [];
    console.log("Year Value : ", year);
    console.log("Year Data for graph: ", flightData[year]);
    var yearData = flightData[year];
    for ( var key in yearData){
        var tmp = yearData[key].result;
        var status = tmp.includes("recovered safely");
        var dogs = yearData[key].dogs;
        if( dogs.length == 2){
            var dog1 = yearData[key].dogs[0];
            var dog2 = yearData[key].dogs[1];
            result.push({'x': key, 'y': yearData[key].altitude, 'result':yearData[key].result, 'status': status, 'rocket':yearData[key].rocket, 
            'dog1':dog1, 'dog1g':dogsData[dog1].gender, 'dog1f':dogsData[dog1].fate, 
            'dog2':dog2, 'dog2g':dogsData[dog2].gender, 'dog2f':dogsData[dog2].fate});
        }
        else{
            var dog1 = yearData[key].dogs[0];
            result.push({'x': key, 'y': yearData[key].altitude, 'result':yearData[key].result, 'rocket':yearData[key].rocket, 
            'dog1':dog1, 'dog1g':dogsData[dog1].gender, 'dog1f':dogsData[dog1].fate, 
            'dog2':"0", 'dog2g':"0", 'dog2f':"0"});
        }
        
    }
    console.log("Final Data to Plot: ", result);
    return result;
}

function step() {
  
    // Printing the selected values
    // console.log("Year :", year);

    var years = [1951, 1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961 ,1964];
    var i = 1;
  
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
  
    var xy_result = get_finalData(year);
    console.log("Updated xy_result : ", xy_result);
  
    // Creating x Scale
    var xScale = d3.scalePoint()
                    .range([100, 600])
                    .domain(xy_result.map(function(d){
                        return d.x;
                    }));

    // Creating y Scale
    var yScale = d3.scaleLinear()
                    .domain([0, max_yAxis])
                    .range([plot_height - padding, padding]);
    
    drawPlot(year);
  
    // circle_transition(svg, xy_result, xScale, yScale);
  
    changed_year += 1;
    // i = i + 1;
    // changed_year = years[i];
    if (changed_year > 1967) {
      year_changing = false;
      changed_year = 1965;
      clearInterval(timer);
      button_input1.text("Play");
    }
}

function addDetails(){

    // Adding title to the chart
    svg.append("text")             
       .attr("x", plot_width/2)
       .attr("y", plot_height/7)
       .style("text-anchor", "middle")
       .style("font-family","sans-serif")
       .style("font-size","16px")
       .style("font-weight","700")
       .style("text-decoration", "underline")
       .text("Attitude Vs Date of the dogs travelling in the corresponding rockets");

    //Adding legends to the graph
    svg.append("rect")
        .attr("x", 480)
        .attr("y", 150)
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", "red");
    
    // Adding labels to the legends
    svg.append("text")
        .attr("x", 500)
        .attr("y", 160)
        .style("fill", function( d){ return "#000000" })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .text("Dog is dead");
    
    //Adding legends to the graph
    svg.append("rect")
        .attr("x", 480)
        .attr("y", 180)
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", "#CF7A1F");
    
    // Adding labels to the legends
    svg.append("text")
        .attr("x", 500)
        .attr("y", 190)
        .style("fill", function( d){ return "#000000" })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .text("Dog is alive");

    //Adding legends to the graph
    svg.append("rect")
        .attr("x", 480)
        .attr("y", 210)
        .attr("width", 15)
        .attr("height", 25)
        .style("fill", "black");
    
    // Adding labels to the legends
    svg.append("text")
        .attr("x", 500)
        .attr("y", 225)
        .style("fill", function( d){ return "#000000" })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .text("Mission not Successful");
    
    //Adding legends to the graph
    svg.append("rect")
        .attr("x", 480)
        .attr("y", 250)
        .attr("width", 15)
        .attr("height", 25)
        .style("fill", "#69a3b2");
    
    // Adding labels to the legends
    svg.append("text")
        .attr("x", 500)
        .attr("y", 265)
        .style("fill", function( d){ return "#000000" })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .text("Mission Successful");

}

function drawTrend(dogName) {

    console.log("#### Drawing Trend Graph");

    var plot_width = 150;
    var plot_height = 600;

    // // append the svg object to the body of the page
    // lineSvg = d3.select("#trend")
    //             .attr("width", 500)
    //             .attr("height", 500)
    
    lineSvg.selectAll('*').remove();

    // Creating tooltip
    var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

    var data = [];
    var dogFlights = dogsData[dogName].flights;
    console.log("FLights travelled by " + dogName + ": " + dogFlights);

    for( var i = 0; i < dogFlights.length; i ++){
        var dogYear = dogFlights[i].split("-")[0];
        //console.log("Dog year : ", dogYear);
        var temp = flightData[dogYear];
        //console.log(temp[dogFlights[i]]);
        data.push({'flight': dogFlights[i], 'rocket':(temp[dogFlights[i]]).rocket, 'altitude':(temp[dogFlights[i]]).altitude});
    }
    console.log(data);

    // Creating x Scale
    var trendScale = d3.scalePoint()
                        .range([100, 500])
                        .domain(data.map(function(d){
                            return d.flight;
                        }));
    

    // Adding y_axis
    var trend_line = d3.axisLeft(trendScale);

    lineSvg.append("g")
            .attr("class", "trend_line")
            .attr("transform", "translate(" + plot_width +",0)")
            .call(trend_line);

    // Adding trend label
    lineSvg.append("text")
            .attr("class", "trend_label")
            .attr("text-anchor", "left")
            .attr("x", plot_width-120) 
            .attr("y", plot_height - 50)
            .text("Trend of '" + dogName +  "' in the Rocket");
    
    // Adding first circle representing 1st dog
    lineSvg.append("g")
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr('id',"trend-circle")
            .attr("cx", function (d) { 
                return plot_width; 
            } )
            .attr("cy", function (d) { 
                return trendScale(d.flight); 
            } )
            .attr("r", 5)
            .attr("stroke", "#000000")
            .attr("stroke-width", 1)
            .style("fill", "blue");

        d3.selectAll('#trend-circle')
            .on('mouseover', function(d) {
                console.log('mouseover on ' + dogName);

                d3.select(this).attr("stroke", "#00FFFF").attr("stroke-width", 4);
        
                div.transition()
                   .duration(50)
                   .style("opacity", 1);
        
                div.html("Rocket Name: " + d.rocket + "  <br>  " + "Altitde: " + d.altitude)
                   .style("left", (d3.event.pageX + 15) + "px")
                   .style("top", (d3.event.pageY - 45) + "px");
        
                })
        
            .on('mouseout', function(d) {
                console.log('mouseout on ' + dogName);

                d3.select(this).attr("stroke", "black").attr("stroke-width", 1);
        
                div.transition()
                   .duration('50')
                   .style("opacity", 0);
            });
}

function drawPlot(year){

    console.log("##### Draw Scattered Plot running #####");

    var plot_width = 800;
    var plot_height = 600;
    var padding = 100;

    d3.select('#year-input')
        .on("change", function(){
            console.log("##### year change");

            year = d3.select('#year-input').property("value");
            console.log("Changed year: ", year);

            svg.selectAll(".bg_year").remove();

            drawPlot(year);
    
        });

    var xy_result = get_finalData(year);
    //console.log("xy_result : ", xy_result);

    // append the svg object to the body of the page
    svg = d3.select("#plot")
            .attr("width", plot_width)
            .attr("height", plot_height);
    
    svg.selectAll('*').remove();

    // Creating tooltip
    var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

    // Creating x Scale
    var xScale = d3.scalePoint()
                    .range([100, 600])
                    .domain(xy_result.map(function(d){
                        return d.x;
                    }));

    // Creating y Scale
    var yScale = d3.scaleLinear()
                    .domain([0, max_yAxis + 50])
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
    
    // Drawing rockets
    for( var i = 0; i < xy_result.length; i ++){

        // Adding the rocket body
        svg.append('g')
            .selectAll('rect')
            .data(xy_result)
            .enter()
            .append('rect')
            .attr('id',"rt" + i)
            .attr('x', function (d){ return xScale(d.x);})
            .attr('y', function (d){ return 460;})
            .attr('width', 20)
            .attr('height', 40)
            .attr('stroke', 'black')
            .attr('fill', '#69a3b2')

            .transition()
            .duration(2000)
            .attr('x', function (d){ 
                return xScale(d.x);
            })
            .attr('y', function (d){ 
                return yScale(d.y) - 40;
            })

            .transition()
            .duration(2000)
            .attr('fill',function(d){
                if(d.status == false){
                    return 'black';
                }
                else{
                    return '#69a3b2';
                }
            })
            .attr('x',function(d){
                return xScale(d.x);
            })
            .attr('y',function(d){
                if(d.status==false){
                    return 460;
                }
                else{
                    return yScale(d.y) - 40;
                }
            });
        
        d3.selectAll("#rt" + i)
            .on('mouseover', function(d) {
                console.log('mouseover on ' + d.result);

                d3.select(this).attr("stroke", "#00FFFF").attr("stroke-width", 4);
        
                div.transition()
                   .duration(50)
                   .style("opacity", 1);
        
                div.html("Rocket Name: " + d.rocket + " <br> " + "Result: " + d.result + "  <br>  " + "Altitude: " + d.y)
                   .style("left", (d3.event.pageX + 10) + "px")
                   .style("top", (d3.event.pageY - 45) + "px");
        
                })
        
            .on('mouseout', function(d) {
                console.log('mouseout on ' + d.result);

                d3.select(this).attr("stroke", "black").attr("stroke-width", 1);
        
                div.transition()
                   .duration('50')
                   .style("opacity", 0);
             });
    }

    // Adding first circle representing 1st dog
    svg.append("g")
        .selectAll("circle")
        .data(xy_result)
        .enter()
        .append("circle")
        .attr('id',"c1")
        .attr("cx", function (d) { 
            return xScale(d.x) + 10; 
        } )
        .attr("cy", function (d) { 
            return 460 + 10; 
        } )
        .attr("r", 5)
        .attr("stroke", "#000000")
        .attr("stroke-width", 1)
        .style("fill", "#CF7A1F")

        .transition()
        .duration(2000)
        .attr("cx", function (d) { 
            return xScale(d.x) + 10; 
        } )
        .attr("cy", function (d) { 
            return yScale(d.y) + 10 - 40; 
        } )

        .transition()
        .duration(2000)
        .attr('cx',function(d){
            return xScale(d.x) + 10;
        })
        .attr('cy',function(d){
            if(d.status==false){
                return 460 + 10;
            }
            else{
                return yScale(d.y) + 10 - 40;
            }
        })

        .transition()
        .duration(500)
        .style("fill",function(d){
            if((d.dog1f).includes("Died")){
                return "red";
            }
            else{
                return "#CF7A1F";
            }
        });
    
    d3.selectAll('#c1')
        .on('mouseover', function(d) {
            console.log('mouseover on ' + d.result);

            d3.select(this).attr("stroke", "#00FFFF").attr("stroke-width", 4);
    
            div.transition()
                .duration(50)
                .style("opacity", 1);
    
            div.html("Name: " + d.dog1 + "  <br>  " + "Gender: " + d.dog1g + "  <br>  " + "Fate: " + d.dog1f)
                .style("left", (d3.event.pageX + 20) + "px")
                .style("top", (d3.event.pageY - 45) + "px");
    
        })
    
        .on('mouseout', function(d) {
            console.log('mouseout on ' + d.result);

            d3.select(this).attr("stroke", "black").attr("stroke-width", 1);
    
            div.transition()
                .duration('50')
                .style("opacity", 0);
        })

        .on('click', function(d,i) {
            console.log('clicked on ' + d.dog1);
            drawTrend(d.dog1);
    
        });
    
    //Adding second circle representing 2nd dog
    var tt = xy_result.filter(function(d) { return d.dog2 !="0" })
    svg.append("g")
        .selectAll("circle")
        .data(tt)
        .enter()
        .append("circle")
        .attr('id',"c2")
        .attr("cx", function (d) { 
            return xScale(d.x) + 10; 
        } )
        .attr("cy", function (d) { 
            return 460 + 30 ; 
        } )
        .attr("r", 5)
        .attr("stroke", "#000000")
        .attr("stroke-width", 1)
        .style("fill", "#CF7A1F")

        .transition()
        .duration(2000)
        .attr("cx", function (d) { 
            return xScale(d.x) + 10; 
        } )
        .attr("cy", function (d) { 
            return yScale(d.y) + 30 - 40; 
        })

        .transition()
        .duration(2000)
        .attr('cx',function(d){
            return xScale(d.x) + 10;
        })
        .attr('cy',function(d){
            if(d.status == false){
                return 460 + 30;
            }
            else{
                return yScale(d.y) + 30 - 40;
            }
        })
        
        .transition()
        .duration(500)
        .style("fill",function(d){
            if((d.dog2f).includes("Died")){
                return "red";
            }
            else{
                return "#CF7A1F";
            }
        });
        
    d3.selectAll('#c2')
        .on('mouseover', function(d) {
            console.log('mouseover on ' + d.dog2 + d.dog2g + d.dog2f );

            d3.select(this).attr("stroke", "#00FFFF").attr("stroke-width", 4);
    
            div.transition()
                .duration(50)
                .style("opacity", 1);
    
            div.html("Name: " + d.dog2 + "  <br>  " + "Gender: " + d.dog2g + "  <br>  " + "Fate: " + d.dog2f)
                .style("left", (d3.event.pageX + 20) + "px")
                .style("top", (d3.event.pageY - 45) + "px");
    
        })
    
        .on('mouseout', function(d) {
            console.log('mouseout on ' + d.result);

            d3.select(this).attr("stroke", "black").attr("stroke-width", 1);
    
            div.transition()
                .duration('50')
                .style("opacity", 0);
        })
        
        .on('click', function(d,i) {
            console.log('clicked on ' + d.dog2);

            drawTrend(d.dog2);
        });

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
        .attr("font-family", "sans-serif")
        .attr("x", (plot_height - padding)/ 2 + padding + 40) 
        .attr("y", plot_height - padding + 50)
        .text("Departure date of the rocket");

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
        .attr("font-family", "sans-serif")
        .attr("x", -2 * padding )
        .attr("y", padding - 50)
        .text("Altitude of the Rocket");
    
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

        } 
        else {
          year_changing = true;
          
          timer = setInterval(step, 5000);
          button_input.text("Pause");
          
        }
 
    });

    addDetails();

}