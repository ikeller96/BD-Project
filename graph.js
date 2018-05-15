//Ian Keller, Robert Upchurch, Nick Laing, Shawn Baker
//May 14th, 2018

//Variables that are necessary to create sizes and margins for the svg
var width = 800;
var height = 400;
var margin = {left: 100, right: 50, top: 50, bottom: 0};

//This array creates the values for the x axis labels. Hard coded because months will never change.
var monthArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug","Sep","Oct","Nov","Dec"];

//Max variable to plug in later into the domain of the y axis. Went over 1 billion in case Wolff does as well.
//Needed the extraMargin variable to position the graph. (Couldn't figure out how to add a variable
//below in the constructionGraphSvg area where it says extraMargin.)
var max = 1100000000;
var  extraMargin = height + margin.top;

//Data loading and creation
d3.json("csvjson.json").get(function(error,data) {

  //Data mapping to fix the month string
  var updatedData = data.map(function(obj) {
    //this gets the month and makes a new year attribute
    var month = obj.PipelineBirthDate;
    month = new Date(month);
    month = (month.getMonth()+1);
    //this gets the year and makes a new year attribute
    var year = obj.PipelineBirthDate;
    year = new Date(year);
    year = (year.getFullYear());
    //this formats the original Pipeline Birthdate to be in format mm/yyyy
    var PipelineBirthDate = obj.PipelineBirthDate;
    PipelineBirthDate = new Date(PipelineBirthDate);
    PipelineBirthDate = (PipelineBirthDate.getMonth()+1) + "/" + PipelineBirthDate.getFullYear();
    //this creates a new array with all attributes and replaces PipelineBirthDate
    return {...obj , year , month , PipelineBirthDate }
  })

  //Data Filtering so it groups all entries by months
  updatedData = d3.nest()
          .key(function(d){ return d.PipelineBirthDate ; })
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
  
console.log(updatedData);
  //x and y scales that will be used in the axis
  var x = d3.scaleBand()
              //domain = the x axis labels
              //range = the pixel width of the graph
              //padding inner spaces out the months/x axis labels
              .domain(monthArray)
              .range([0, width])
              .paddingInner(.132);

  var y = d3.scaleLinear()
              .domain([0, max])
              .range([height, 0]);

  //D3 Constructors that are called later
  var xAxis = d3.axisBottom(x);
  var yAxis = d3.axisLeft(y).ticks(1);

  //Creation of the svg in the body tags
  var constructionGraphSvg = d3.select("body")
              .append("svg")
              .attr("height","1000")
              .attr("width","100%");

  //Creation of the x axis in the svg
  constructionGraphSvg.append("g")
              .attr("transform","translate("+margin.left+","+extraMargin+")")
              .call(xAxis);

  //Creation of the y axis in the svg
  constructionGraphSvg.append("g")
              .attr("transform","translate("+margin.left+","+margin.top+")")
              .call(yAxis);
});
