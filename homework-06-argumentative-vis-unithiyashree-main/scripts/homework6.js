
var mapSvg;

var lineSvg;
var lineWidth;
var lineHeight;
var lineInnerHeight;
var lineInnerWidth;
var tpadding = {
  x: 50,
  y: 20
};

var lineMargin = { top: 20, right: 60, bottom: 60, left: 100 };

var year_input;

var tvShows_Data = [];

function change_region(){
  drawMap(movieData);
}

// This runs when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
  
    Promise.all([d3.csv('data/TV_Shows.csv')])
          .then(function(values){
      
        values[0].forEach(function (data) {
            if( data['IMDb'] != "" &&  data['RottenTomatoes'] != ""){

                var new_rt = parseInt(data['RottenTomatoes']) * 0.1;
                // new_rt = new_rt.toFixed(2);
                // console.log("RottenTomatoes : ", new_rt;

                var new_imdb = parseFloat(data['IMDb']);

                tvShows_Data.push({'sno':data['No'], 'title':data['Title'], 'year':parseInt(data['Year']), 'imdb':new_imdb, 
                'rottenTomatoes': new_rt.toFixed(1), 'netflix':data['Netflix'],'hulu':data['Hulu'], 
                'prime':data['PrimeVideo'], 'hotstar':data['Disney+']});
            }
        });

        console.log("Tv Show Data : ", tvShows_Data);

        // get the selected year
        year_input = d3.select('#year-input').property("value");
        console.log("Year Value : ", year_input);
        drawPlot();
  });
});

function getData( year_input){
    var k = 1;
    var result = [];
    for( var i = 0; i < tvShows_Data.length; i ++){
        var ott = "";
        if( tvShows_Data[i].netflix == 1){
            ott = "Netflix";
        }
        else if( tvShows_Data[i].hulu == 1){
            ott = "Hulu";
        }
        else if( tvShows_Data[i].prime == 1){
            ott = "Prime";
        }
        else if( tvShows_Data[i].hotstar == 1){
            ott = "Hotstar";
        }
        if( parseInt(year_input) >= 2015){
            if(parseInt(year_input) == tvShows_Data[i].year){
                if( tvShows_Data[i].rottenTomatoes - tvShows_Data[i].imdb > 2 || tvShows_Data[i].imdb - tvShows_Data[i].rottenTomatoes > 2){
                    result.push({'sno': "m" + k.toString(), 'title': tvShows_Data[i].title, 'year': tvShows_Data[i].year, 'imdb': tvShows_Data[i].imdb, 
                        'rottenTomatoes': tvShows_Data[i].rottenTomatoes, 'ott': ott});
                    k = k + 1;
                }
            }

        }
        else{
            if(parseInt(year_input) <= tvShows_Data[i].year && ( tvShows_Data[i].year < parseInt(year_input) + 5)){
                if( tvShows_Data[i].rottenTomatoes - tvShows_Data[i].imdb > 2 || tvShows_Data[i].imdb - tvShows_Data[i].rottenTomatoes > 2){
                    result.push({'sno': "m" + k.toString(), 'title': tvShows_Data[i].title, 'year': tvShows_Data[i].year, 'imdb': tvShows_Data[i].imdb, 
                        'rottenTomatoes': tvShows_Data[i].rottenTomatoes, 'ott': ott});
                    k = k + 1;
                }
            }
        }

    }
    console.log("Result : ", result);
    return result;
}

function drawPlot(){

    console.log("##### Drawing Left Plot #####");

    d3.select('#year-input')
        .on("change", function(){
            console.log("##### year change");

            year_input = d3.select('#year-input').property("value");
            console.log("Changed year: ", year_input)

            drawPlot();
    
    });

    var canvas_width = 1000;
    var canvas_height = 600;
    var plot_width = 600;
    var plot_height = 400;
    var padding =  100;

    console.log("Input Year :", year_input);

    var finalData =  getData( year_input);
    console.log("Data for the input year : ", finalData);

    var leftPlot = [];
    var rightPlot = [];

    var svg = d3.select("#leftMap")
                .attr("width", canvas_width)
                .attr("height", canvas_height);

    svg.selectAll('*').remove();

    // Adding title for the graph
    svg.append("text")
       .attr("transform", "translate(100,0)")
       .attr("x", 100)
       .attr("y", 150)
       .attr("font-size", "24px")
       .attr("font-family", "sans-serif")
       .text("IMDb Rating for Tv Shows");

    // Creating tooltip
    var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

    // Creating x-scale
    var xScale = d3.scaleBand()
                    .rangeRound([0, plot_width])
                    .paddingInner(0.05);;

    // Creating y-scale
    var yScale = d3.scaleLinear()
                    .range([plot_height, 0]);

    xScale.domain(finalData.map(function(d) { return d.sno; }));
    yScale.domain([0, 10]);

    svg.selectAll("rect")
        .data(finalData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d){
            return xScale(d.sno)+ 50;
        })
        .attr("y", function (d) {
            return yScale(d.imdb) + 200;
        })
        .attr("width", 10)
        .attr("height", function (d) {
            return plot_height - yScale( d.imdb);
        })
        .attr("fill","steelblue")
        .attr("stroke","black")
        .on('mouseover', function(d) {
            console.log('mouseover on ' + d.title);

            d3.select(this).attr("stroke", "#00FFFF").attr("stroke-width", 4);
    
            div.transition()
               .duration(50)
               .style("opacity", 1);
    
            div.html("Title : " + d.title + " <br> " + "Year: " + d.year + "  <br>  " 
                    + "IMDB: " + d.imdb + "  <br>  " + "OTT: " + d.ott )
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
    
    // Adding x_axis
    var x_axis = d3.axisBottom(xScale);

    svg.append("g")
        .attr("class", "x_axis")
        .attr("transform", "translate("+ 50 + "," + plot_width + ")")
        .call(x_axis);

    // Adding y_axis
    var y_axis = d3.axisLeft(yScale);
    
    svg.append("g")
        .attr("class", "y_axis")
        .attr("transform", "translate(" + 50 + "," + 200 + ")")
        .call(y_axis);

    // Adding x_axis label
    svg.append("text")
        .attr("class", "xAxis_label")
        .attr("text-anchor", "end")
        .attr("font-family", "sans-serif")
        .attr("x", (plot_height - padding)/ 2 + padding + 130) 
        .attr("y", plot_height - padding + 350)
        .text("Tv Shows");
    
    // Adding y_axis label
    svg.append("text")
            .attr("class", "yAxis_label")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("font-family", "sans-serif")
            .attr("x", -2 * padding - 150 )
            .attr("y", padding - 80)
            .text("IMDB Rating");

    drawRightPlot();
}

function drawRightPlot(){

    console.log("##### Drawing Rigt Plot #####");

    var canvas_width = 1000;
    var canvas_height = 600;
    var plot_width = 600;
    var plot_height = 400;
    var padding =  100;

    var finalData =  getData( year_input);

    console.log("Data for the input year : ", finalData);

    var svg = d3.select("#rightMap")
                .attr("width", canvas_width)
                .attr("height", canvas_height);

    svg.selectAll('*').remove();

    // Adding title for the graph
    svg.append("text")
        .attr("transform", "translate(100,0)")
        .attr("x", 80)
        .attr("y", 150)
        .attr("font-size", "24px")
        .attr("font-family", "sans-serif")
        .text("Rotten Tomatoes Rating for Tv Shows");

    // Creating tooltip
    var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

    // Creating x-scale
    var xScale = d3.scaleBand()
                    .rangeRound([0, plot_width])
                    .paddingInner(0.05);;


    // Creating y-scale
    var yScale = d3.scaleLinear()
                    .range([plot_height, 0]);

    xScale.domain(finalData.map(function(d) { return d.sno; }));
    yScale.domain([0, 10]);

    svg.selectAll("rect")
        .data(finalData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d){
            return xScale(d.sno) + 50;
        })
        .attr("y", function (d) {
            return yScale(d.rottenTomatoes) + 200;
        })
        .attr("width", 10)
        .attr("height", function (d) {
            return plot_height - yScale( d.rottenTomatoes);
        })
        .attr("fill","green")
        .attr("stroke","black")
        .on('mouseover', function(d) {
            console.log('mouseover on ' + d.title);

            d3.select(this).attr("stroke", "#00FFFF").attr("stroke-width", 4);
    
            div.transition()
               .duration(50)
               .style("opacity", 1);
    
            div.html("Title : " + d.title + " <br> " + "Year: " + d.year + "  <br>  " 
                + "Rotten Tomatoes: " + d.rottenTomatoes + "  <br>  " + "OTT: " + d.ott)
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
    
    // Adding x_axis
    var x_axis = d3.axisBottom(xScale);

    svg.append("g")
        .attr("class", "x_axis")
        .attr("transform", "translate("+ 50 + "," + plot_width + ")")
        .call(x_axis);

    // Adding y_axis
    var y_axis = d3.axisLeft(yScale);
    
    svg.append("g")
        .attr("class", "y_axis")
        .attr("transform", "translate(" + 50 + "," + 200 + ")")
        .call(y_axis);

    
    // Adding x_axis label
    svg.append("text")
        .attr("class", "xAxis_label")
        .attr("text-anchor", "end")
        .attr("font-family", "sans-serif")
        .attr("x", (plot_height - padding)/ 2 + padding + 130) 
        .attr("y", plot_height - padding + 350)
        .text("Tv Shows");
    
    // Adding y_axis label
    svg.append("text")
            .attr("class", "yAxis_label")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("font-family", "sans-serif")
            .attr("x", -2 * padding - 150 )
            .attr("y", padding - 80)
            .text("Rotten Tomatoes Rating");
}