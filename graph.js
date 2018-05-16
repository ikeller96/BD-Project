//Ian Keller, Robert Upchurch, Nick Laing, Shawn Baker
//May 14th, 2018

//Variables that are necessary to create sizes and margins for the svg
var width = 900;
var height = 500;
var margin = {left: 100, right: 50, top: 15, bottom: 0};
var currentDate = new Date("2019-8-05");
var tickValue;

//This array creates the values for the x axis labels. Hard coded because months will never change.
var monthArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug","Sep","Oct","Nov","Dec"];

//Max variable to plug in later into the domain of the y axis. Went over 1 billion in case Wolff does as well.
//Needed the extraMargin variable to position the graph. (Couldn't figure out how to add a variable
//below in the constructionGraphSvg area where it says extraMargin.)
var max = 1100000000;
var  extraMargin = height + margin.top;
var extraMargin2 = 10 + margin.left;
//Data loading and creation
d3.json("csvjson.json").get(function(error,data) {

  //Data mapping to fix the month string
  var updatedData = data.map(function(obj) {
    //this gets the month and makes a new year attribute
    var month = obj.ConstructionStartDate;
    month = new Date(month);
    month = (month.getMonth()+1);
    //this gets the year and makes a new year attribute
    var year = obj.ConstructionStartDate;
    year = new Date(year);
    year = (year.getFullYear());
    //this formats the original Pipeline Birthdate to be in format mm/yyyy
    var ConstructionStartDate = obj.ConstructionStartDate;
    ConstructionStartDate = new Date(ConstructionStartDate);
    ConstructionStartDate = (ConstructionStartDate.getMonth()+1) + "/" + ConstructionStartDate.getFullYear();
    //this creates a new array with all attributes and replaces PipelineBirthDate
    return {...obj , year , month , ConstructionStartDate }
  })

  //Data Filtering so it groups all entries by months
  updatedData = d3.nest()
          .key(function(d){ return d.ConstructionStartDate; })
          .entries(updatedData);

  //move all N@N to end of Array
  for (var i = 0; i < updatedData.length; i++) {
    var temp;
    if (updatedData[i].key == "NaN/NaN") {
      temp = updatedData[i];
      updatedData.splice(i , i+1);
      updatedData.push(temp);
    }
  }

  //sort the Array to be from oldest to newest
  for (var i = 1; i < updatedData.length; i++) {
    for (var j = 0; j < updatedData.length - i ; j++) {
        //checks to see if it needs to drop the year down
        if (updatedData[j].values[0].year < updatedData[j+1].values[0].year) {
            var temp = updatedData[j];
            updatedData[j] = updatedData[j+1];
            updatedData[j+1] = temp;
        }
        //if the years are the same it then checks to see if it needs to switch because of month
        else if (updatedData[j].values[0].year == updatedData[j+1].values[0].year) {
          if (updatedData[j].values[0].month > updatedData[j+1].values[0].month) {
            var temp = updatedData[j];
            updatedData[j] = updatedData[j+1];
            updatedData[j+1] = temp;
          }
        }
    }
  }

  var currentMonth = currentDate;
  currentMonth = (currentMonth.getMonth()+1);
  var currentYear = currentDate;
  currentYear = (currentYear.getFullYear());
  currentDate = (currentDate.getMonth()+1) + "/" + currentDate.getFullYear();

  //this will find which indexes of the updatedData are relevent to our current graph based on current date
  var startIndex;

  for (var i = 0; i < updatedData.length; i++) {
    if (currentYear == updatedData[i].values[0].year) {
      startIndex = i;
      i = updatedData.length;
    }
  }

  var endIndex;

  for (var i = 0; i < updatedData.length; i++) {
    if (currentYear == updatedData[i].values[0].year) {
      endIndex = i;
    }
  }




  var thisYearsData = [];
  for (var i = 1; i < 13; i++) {
    if (updatedData[startIndex].values[0].month == i) {
      thisYearsData.push(updatedData[startIndex])
      startIndex++;
    }
    else {
      thisYearsData.push("NaN");
    }
  }

  //the functional data array is where all the values we need for the heights of the bars will be held
  var functionalData =[];

  //this loop will go through each month and sum up the total capitalization
  for (var i = 0; i < thisYearsData.length; i++) {
    var tempsum = 0;

    //this if / else statement will determine if the sum should be put in as a
    //new capitalization or a forecasted new capitalization based on the currentmonth
    if (thisYearsData[i] != "NaN") {
          if (thisYearsData[i].values[0].month <= currentMonth) {
              for (var j = 0; j < updatedData[i].values.length; j++) {
                tempsum += parseInt(updatedData[i].values[j].TotalDevelopmentCost
                                  .slice(0, 14)
                                  .replace(/,/g, ""));
              }
              functionalData.push({new: tempsum, existing: 0, forcastedNew: 0, forecastedExisting: 0});
          }
          else {
            for (var j = 0; j < updatedData[i].values.length; j++) {
              tempsum += parseInt(updatedData[i].values[j].TotalDevelopmentCost
                                .slice(0, 14)
                                .replace(/,/g, ""));
            }
            functionalData.push({new: 0, existing: 0, forecastedNew: tempsum, forecastedExisting: 0});
          }
    }
    else {
      functionalData.push({new: 0, existing: 0, forecastedNew: 0, forecastedExisting: 0});
    }
  }

  //These variables are used to keep track of where the previous sums are at per
  //month, the first holds the month sums before the current month, the second holds
  //the sums for after the current date
  var runningSumUntilDate = 0;
  var runningSumAfterDate = 0;

  //this for loop will enter in the sum totals to there perspective months
  for (var i = 0; i < functionalData.length; i++) {
        //this if statement determines if they are before or after the current month
        // and thus if it is adding to existing or to forecastedExisting
        if (i + 1 <= currentMonth) {
          functionalData[i].existing = runningSumUntilDate;
          runningSumUntilDate += functionalData[i].new
          runningSumAfterDate = runningSumUntilDate;
        }
        else {
          functionalData[i].existing = runningSumUntilDate;
          functionalData[i].forecastedExisting = runningSumAfterDate;
          runningSumAfterDate += functionalData[i].forecastedNew
        }
  }

tickValue = runningSumUntilDate;

//this will now take all the tracked data and make it into a linear Array for the rectangles
var linearArray = [];
for (var i = 0; i < functionalData.length; i++) {
  linearArray.push(functionalData[i].forecastedNew + functionalData[i].forecastedExisting);
  linearArray.push(functionalData[i].forecastedExisting);
  linearArray.push(functionalData[i].new + functionalData[i].existing);
  linearArray.push(functionalData[i].existing);
}

//this will make the color array to change the color eachtime
var colorArray = [];
for (var i = 0; i < functionalData.length; i++) {
  colorArray.push("#D0E3E6");
  colorArray.push("#E9E6E2");
  colorArray.push("#006679");
  colorArray.push("#AA9C8F");
}

//this array will adjust for x axis positioning every 4
var xAxisPositioningArray = [];
for (var i = 0; i < functionalData.length; i++) {
  xAxisPositioningArray.push(width/12 * i);
  xAxisPositioningArray.push(width/12 * i);
  xAxisPositioningArray.push(width/12 * i);
  xAxisPositioningArray.push(width/12 * i);
}

if (functionalData[11].forecastedNew + functionalData[11].forecastedExisting > 1100000000) {
  max = functionalData[11].forecastedNew + functionalData[11].forecastedExisting;
}



  //this is where we will creat the actual graph now that we have made all the data
  //x and y scales that will be used in the axis
  var x = d3.scaleBand()
              //domain = the x axis labels
              //range = the pixel width of the graph
              //padding inner spaces out the months/x axis labels
              .domain(monthArray)
              .range([0, width-21])
              .paddingInner((12*21)/width);

  var y = d3.scaleLinear()
              .domain([0, max])
              .range([height, 0]);

  //D3 Constructors that are called later
  var xAxis = d3.axisBottom(x);
  var yAxis = d3.axisLeft(y).tickValues([tickValue,1000000000]);

  //Creation of the svg in the body tags
  var constructionGraphSvg = d3.select("body")
              .append("svg")
              .attr("height","1000")
              .attr("width","100%");

  //Creation of the x axis in the svg
  constructionGraphSvg.append("g")
              // .attr("class","hidden")
              .attr("transform","translate("+extraMargin2+","+extraMargin+")")
              .call(xAxis);

  //Creation of the y axis in the svg
  constructionGraphSvg.append("g")
              .attr("transform","translate("+margin.left+","+margin.top+")")
              .call(yAxis);

  //creation of the rectangles
  var rect = constructionGraphSvg.selectAll("rect").data(linearArray)
            .enter().append("rect")
              .attr("x", function(d,i){ return xAxisPositioningArray[i] + margin.left + 10 ; })
              .attr("width",width/12 - 20)
              .attr("y", function(d , i){ return height - ((linearArray[i]/max) * height) + margin.top ; })
              .attr("height",function(d , i){ return ((linearArray[i]/max) * height ) ; })
              .attr("fill", function(d,i){ return colorArray[i] ; });

  var currentLine = constructionGraphSvg.append("line")
              .attr("x1", margin.left)
              .attr("y1", (height+.5) - ((runningSumUntilDate/max) * height) + margin.top)
              .attr("x2", margin.left + width)
              .attr("y2", (height+.5) - ((runningSumUntilDate/max) * height) + margin.top)
              .attr("stroke", "black")
              .attr("stroke-width" , "1")
              .attr("stroke-dasharray", "5,5");

  var BillionDollarLine = constructionGraphSvg.append("line")
              .attr("x1", margin.left)
              .attr("y1", height - ((1000000000/(max+1000000)) * height) + margin.top )
              .attr("x2", margin.left + width)
              .attr("y2", height - ((1000000000/(max+1000000)) * height) + margin.top )
              .attr("stroke", "red")
              .attr("stroke-width" , "1")
              .attr("fill","red");
console.log(functionalData);
});
