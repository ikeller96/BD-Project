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
  var updatedDataArray = data.map(function(obj) {
    //this takes only the first 7 numbers of the string, turning the string with only year and month
    var PipelineBirthDate = obj.PipelineBirthDate;
    PipelineBirthDate = new Date(PipelineBirthDate);
    PipelineBirthDate = (PipelineBirthDate.getMonth()+1) + "/" + PipelineBirthDate.getFullYear();
    // PipelineBirthDate = PipelineBirthDate.split("/");
    //this creates a new array with all attributes and replaces PipelineBirthDate
    return {...obj , PipelineBirthDate}
  })

  //Data Filtering so it groups all entries by months
  updatedDataArray = d3.nest()
          .key(function(d){ return d.PipelineBirthDate ; })
          .entries(updatedDataArray);


  // sort the Array to be from oldest to newest
  // for (var i = 0; i < updatedDataArray.length; i++) {
  //   for (var j = updatedDataArray.length; j > 0; j--) {
  //       var tempVariable = 0;
  //
  //       if (parseInt(updatedDataArray[i].key.split(3,7) > parseInt(updatedDataArray[i + 1].key.slice(3,7)) {
  //
  //       }
  //   }
  // }

console.log(updatedDataArray);
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
