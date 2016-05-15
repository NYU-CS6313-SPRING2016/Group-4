//Global Variables
var weekNum = 40;
var duration = 500;
var days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
var daysReverse = ["Sa", "Fr", "Th", "We", "Tu", "Mo", "Su"];
var times = ["12a", "1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12p", 
                "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p"];

//Load .json data
d3.json("json/js_week.json", function(error, result) {
    data = result;
    mainChartData = result;
    var filteredData = data.filter(function(d) {
        return d.days.length > 0;
    });
    filteredData.sort(function(a, b) { return d3.ascending(a.week_number, b.week_number)});
        
    renderWeekList(filteredData);
    var weeklyData = filteredData.filter(function (d) {
        return d.week_number == weekNum;
    });
    renderRecipList(weeklyData);
    renderKeyList(weeklyData);
    renderMainChart(weeklyData);
})

// Render functions  
function renderWeekList(data) {
    //Left side: Week List
    var chartWidth = 165;
    var chartHeight = 70;
    var charMargin = {top: 10, left: 20, right: 10, bottom: 18};
    var chartInnerWidth = chartWidth - charMargin.left - charMargin.right;
    var chartInnerHeight = chartHeight - charMargin.top - charMargin.bottom;

    var xScale = d3.scale.ordinal()
        .rangeRoundBands([0, chartInnerWidth], .1)
        .domain(days);

    var yScale = d3.scale.linear()
        .range([chartInnerHeight, 0])
        .domain([0, 40]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .tickValues([0, 40]);

    var weekList = d3.select("#weekList");

    var weekLi = weekList.selectAll("a")
        .data(data)
        .enter().append("a")
        .attr("class", "list-group-item")
        .attr("href", "#")
        .on("click", function(d, i) {
            weekNum = d.week_number;
            var weeklyData = data.filter(function (d) {
                return d.week_number == weekNum;
            });
            renderRecipList(weeklyData);
            renderKeyList(weeklyData);
            renderMainChart(weeklyData);
        });

    var weekSvg = weekLi.append("svg")
        .attr("id", function(d, i){return "week" + i})
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("transform", "translate(" + charMargin.left + "," + charMargin.top + ")");

    weekSvg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + charMargin.left + ", " + (chartInnerHeight + charMargin.top) + ")")
        .call(xAxis);

    weekSvg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + charMargin.left + ", " + charMargin.top + ")")
        .call(yAxis);
    
    for (var j = 0; j < data.length; j++) {
        var iweek = d3.select("#week" + j);
        var weekData = data[j];
        iweek.append("text")
            .text(weekData.start_date + " - " + weekData.end_date)
            .style({"font-size": "10px", fill: "#777"})
            .attr("dx", 35)
            .attr("dy", 9);

        iweek.selectAll("rect")
          .data(weekData.days)
          .enter()
          .append("rect")
          .attr("x", function(d) { return xScale(d.day); })
          .attr("y", function(d) { return yScale(d.total); })
          .attr("width", xScale.rangeBand())
          .attr("height", function(d) { return chartInnerHeight - yScale(d.total); })
          .attr("transform", "translate(" + charMargin.left + ", " + charMargin.top + ")")
          .attr("fill", "#337ab7");  
    }      
}

function renderRecipList(data) {
    //Right panel - Tab 1 Recipient list
    var recipData = data[0].recipients;
    recipData.sort(function(a, b) { return d3.descending(a.num, b.num)});

    var chartWidth = 250;
    var chartHeight = 30;
    var chartMargin = {top: 1, left: 0, right: 20, bottom: 1};
    var chartInnerWidth = chartWidth - chartMargin.left - chartMargin.right;
    var chartInnerHeight = chartHeight - chartMargin.top - chartMargin.bottom;

    var barScale = d3.scale.linear().range([0, chartInnerWidth]).domain([0, 45]);
    var recipList = d3.select("#recipList")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");
    var recipItems = recipList.selectAll("rect").data(recipData);
    var recipText1 = recipList.selectAll(".text1").data(recipData);
    var recipText2 = recipList.selectAll(".text2").data(recipData);

    recipItems.enter().append("rect");
    recipItems.attr("x", chartMargin.left)
        .attr("y", function(d, i) { return (chartHeight * i + chartMargin.top); })
        .attr("width", 0)
        .attr("height", chartInnerHeight)
        .style("fill", "#5cb85c")
        .style("opacity", "0.8")
        .transition().duration(duration)
        .attr("width", function(d) { return barScale(d.num); });  //green: #5cb85c yell: #f0ad4e info:#5bc0de

    
    recipText1.enter().append("text") ;
    recipText1.attr("class", "text1")
        .text(function(d) {return d.name})
        .style({"font-size": "14px", fill: "#555"})
        .attr("dx", 2)
        .attr("dy", function(d, i) { return (chartHeight * i + 20); });

    
    recipText2.enter().append("text"); 
    recipText2.attr("class", "text2")
        .text(function(d) {return d.num})
        .style({"font-size": "15px", fill: "#555"})
        .attr("dx", chartWidth)
        .attr("dy", function(d, i) { return (34 * i + 20); });
    
    recipText1.exit().remove();
    recipItems.exit().remove();
    recipText2.exit().remove();
}

function renderKeyList(data) {
    //Right panel - Tab 2 Keywords list
    var keyData = data[0].keywords;
    keyData.sort(function(a, b) { return d3.descending(a.freq, b.freq)});

    var chartWidth = 250;
    var chartHeight = 30;
    var chartMargin = {top: 1, left: 0, right: 20, bottom: 1};
    var chartInnerWidth = chartWidth - chartMargin.left - chartMargin.right;
    var chartInnerHeight = chartHeight - chartMargin.top - chartMargin.bottom;

    var barScale = d3.scale.linear().range([0, chartInnerWidth]).domain([0, 400]);
    var keyList = d3.select("#keyList")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");
    var keyItems = keyList.selectAll("rect").data(keyData);
    var keyText1 = keyList.selectAll(".text1").data(keyData);
    var keyText2 = keyList.selectAll(".text2").data(keyData);

    keyItems.enter().append("rect");
    keyItems.attr("x", chartMargin.left)
        .attr("y", function(d, i) { return (chartHeight * i + chartMargin.top); })
        .attr("width", 0)
        .attr("height", chartInnerHeight)
        .style("fill", "#f0ad4e")
        .style("opacity", "0.8")
        .transition().duration(duration)
        .attr("width", function(d) { return barScale(d.freq); });  //green: #5cb85c yell: #f0ad4e info:#5bc0de red:#D9534F

    
    keyText1.enter().append("text") ;
    keyText1.attr("class", "text1")
        .text(function(d) {return d.word})
        .style({"font-size": "14px", fill: "#555"})
        .attr("dx", 2)
        .attr("dy", function(d, i) { return (chartHeight * i + 20); });

    
    keyText2.enter().append("text"); 
    keyText2.attr("class", "text2")
        .text(function(d) {return d.freq})
        .style({"font-size": "15px", fill: "#555"})
        .attr("dx", chartWidth)
        .attr("dy", function(d, i) { return (34 * i + 20); });
    
    keyText1.exit().remove();
    keyItems.exit().remove();
    keyText2.exit().remove();
}

function renderMainChart(data) {
    var chartWidth = 700;
    var chartHeight = 600;
    var chartMargin = {top: 30, left: 100, right: 20, bottom: 20};
    var chartInnerWidth = chartWidth - chartMargin.left - chartMargin.right;
    var chartInnerHeight = chartHeight - chartMargin.top - chartMargin.bottom;
    d3.select("#timeFrame").html(data[0].start_date + " - " + data[0].end_date);
    d3.select("#recipTotal").html(data[0].recipients.length);

    var mainChart = d3.select("#mainChart")
                        .attr("width", chartWidth)
                        .attr("height", chartHeight)
                        .attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");

    var xScale = d3.scale.ordinal().rangeBands([0, chartInnerWidth]).domain(times);  
    var yScale = d3.scale.ordinal().rangeBands([chartInnerHeight, 0]).domain(daysReverse);
    var yAxis = d3.svg.axis().scale(yScale).orient("left").outerTickSize(0);
    var xAxis = d3.svg.axis().scale(xScale).orient("top")
                .innerTickSize(-chartInnerHeight)
                .outerTickSize(0);
    
    var gridWeight = xScale.rangeBand();
    var gridSize = yScale.rangeBand();

    //Draw axis and shade
    mainChart.selectAll(".axis").remove(); 
    mainChart.selectAll(".shade").remove(); 

    mainChart.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + (chartMargin.left - gridWeight/2) + ", " + chartMargin.top + ")")
        .call(xAxis);
    mainChart.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + chartMargin.left + ", " + chartMargin.top + ")")
        .call(yAxis); 
    for (var i = 1; i <=7; i++) { //horizontal grid lines
        mainChart.append("line")
        .attr("transform", "translate(" + chartMargin.left + ", " + chartMargin.top + ")")
        .attr("x1", "0")
        .attr("y1", i * gridSize)
        .attr("x2", chartInnerWidth)
        .attr("y2", i * gridSize)
        .style("stroke", "#eee")
        .style("stroke-width", "1px");
    }
    mainChart.append("rect")  //night shade: 12a - 6a
        .attr("class", "shade")
        .attr("transform", "translate(" + (chartMargin.left) + ", " + chartMargin.top + ")")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", gridWeight*6)
        .attr("height", gridSize*7)
        .style("fill", "#ccc")
        .style("opacity", ".2");

    mainChart.append("rect")  //night shade: 6p - 12a+1
        .attr("class", "shade")
        .attr("transform", "translate(" + (chartMargin.left) + ", " + chartMargin.top + ")")
        .attr("x", gridWeight*18)
        .attr("y", 0)
        .attr("width", gridWeight*6)
        .attr("height", gridSize*7)
        .style("fill", "#ccc")
        .style("opacity", ".2");
    
    //Draw data items: cells, circles, circle-text
    var results = [];
    var circles = [];
    var weekly_total = 0; //profile - total emails
    for (var i = 0; i < data[0].days.length; i++) {
        var day_data = data[0].days;
        var day = day_data[i]["day_num"];
        var circle_result = {};
        circle_result["day"] = day;
        circle_result["total"] = day_data[i]["total"];
        weekly_total += day_data[i]["total"];
        circles.push(circle_result);
        var myMap = day_data[i]["daytime"];
        for (var key in myMap) {
            var result = {};
            result["day"] = day;
            result["hour"] = key;
            result["value"] = myMap[key];
            results.push(result);
        }
    }

    d3.select("#mailTotal").html(weekly_total + " Emails");
    var barChart = mainChart.append("g").attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");
    var circleChart = mainChart.append("g").attr("transform", "translate(" + "20"  + "," + chartMargin.top + ")");
    
    var rectScale = d3.scale.linear().range([0, gridSize]).domain([0, 16]);
    var rScale = d3.scale.linear().range([10, gridSize / 2]).domain([0, 50]);

    //Remove Cells, Circles and Circles' text labels
    mainChart.selectAll(".bar").remove();
    mainChart.selectAll("circle").transition().duration(duration).attr("r", 0).remove();
    mainChart.selectAll(".circlesText").remove();

    //Draw Circles
    var circleItems = circleChart.selectAll("circle").data(circles, function (d) {
        return d.day + ':' + d.total;
    });
    
    circleItems.enter().append("circle")
        //.attr("r", 0)
        .attr("r", function (d, i) { return rScale(d.total)/2;})
        .attr("cx", 20)
        .attr("cy", function (d) { return (d.day * gridSize + gridSize/2);})
        .attr("fill", "#f0ad4e")
        .transition().duration(duration)
        .attr("r", function (d, i) { return rScale(d.total);}); //original #225ea8 info #5bc0de

    //Draw Circles' text labels
    circleItems.enter().append("text")
        .text(function(d) {return d.total})
        .style({"font-size": "16px", fill: "#FFF", opacity: 1})
        .attr("class", "circlesText")
        .attr("text-anchor", "middle")
        .attr("dx", 20)
        .attr("dy", function (d) { return (d.day * gridSize + gridSize/2 + 6); });

    //Draw Cells
    var cards = barChart.selectAll(".hour").data(results, function (d) { 
        return d.day + ':' + d.hour;
    });
    cards.enter().append("rect")
        .attr("class", "hour bordered bar")
        .attr("x", function (d) { return (d.hour) * gridWeight;})
        .attr("y", function (d) { return (d.day) * gridSize + gridSize;})
        .attr("rx", 2)
        .attr("ry", 2)
        .attr("width", gridWeight)
        .attr("height", 0)
        .attr("fill", "#5bc0de")
        .transition().duration(duration)
        .attr("y", function (d) { return (d.day) * gridSize + gridSize - rectScale(d.value);})
        .attr("height", function (d) { return rectScale(d.value);});

    cards.on("mouseenter", function(d, i) {
            d3.select("#tooltip").style({
                visibility: "visible",
                top: (d3.event.clientY + 5) +  "px",
                left: (d3.event.clientX + 10) + "px",
                opacity: 1
            }).text(d.value + " Emails");
        })
        .on("mouseleave", function(d, i) {
            d3.select("#tooltip").style({
                visibility: "hidden",
                opacity: 0
            });
        });
}


