// @TODO: YOUR CODE HERE!
let svgHeight = 500;
let svgWidth = 1000;

let margin = {
    top: 20,
    right: 40,
    bottom: 120,
    left: 100
};

let width = svgWidth - margin.right - margin.left;
let height = svgHeight - margin.top - margin.bottom;

let svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

let chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

//setting initial parameters for x axis
let chosenXAxis = "income";

//function to update xscale-variable upon user axis-label-click
function xScale(data, chosenXAxis) {
    //creating scales
    let xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * .8,
        d3.max(data, d => d[chosenXAxis]) * 1.1
        ])
        .range([0,width]);
    return xLinearScale;
}

//function used to update xAxis-variable upon user-axis-click 
function renderAxes(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

//function to update circle group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
    return circlesGroup;
}

//function to update circles group with new tooltip
function updatetoolTip(chosenXAxis, circlesGroup) {
    var label;

    if (chosenXAxis === "income") {
        label = "Median Income";
    }
    else if (chosenXAxis === "healthcare") {
        label = "% without Healthcare";
    }
    else {label = "Median Age";   
    }

    let toolTip = d3.tip()
        .attr("class","d3-tip")
        .offset([80,-60])
        .html(function(d) {
            return (`<strong>${d.state}</strong><br>${label}: ${d[chosenXAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(d) {
        toolTip.show(d, this);
    })
        .on("mouseout", function(d) {
            toolTip.hide(d);
        });

    return circlesGroup;
}


//reading in the csv data
d3.csv("./assets/data/data.csv").then(function(data, err) {
    if (err) throw err;

    //changing all required strings to int
    data.forEach(function(data) {
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.poverty = +data.poverty;
        data.smokes = +data.smokes;
    });

    //set the xLinearScale using the function above
    //inital parameter set to "income" through chosenXAxis variable
    let xLinearScale = xScale(data, chosenXAxis);

    //Eventually we'll set the yLinearScale using a function above
    //initial parameter set to "smokes"
    //for now, we'll create a y Scale function hardcoding smokes
    //**********************CHANGE LATER ************************

    let yLinearScale = d3.scaleLinear()
        .domain([0,d3.max(data, d => d.smokes)])
        .range([height, 0]);

    //create intial axis functions
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    //appending x axis
    let xAxis = chartGroup.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(bottomAxis);

    //appending y axis
    let yAxis = chartGroup.append("g")
        .call(leftAxis);

    //appending initial circles
    //**********************CHANGE LATER ************************
    //for now we'll hardcode in smokes as y axis
    //**********************CHANGE LATER ************************
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d.smokes))
        .attr("r", 18)
        .classed("stateCircle", true)
    

    //create group for the three x-axis labels, center the text and push it below the x axis
    let labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width/2}, ${height+20})`);

    //create three x-axis labels for selecting your dataset (income, healthcare, age)
    let incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "income")
        .classed("active", true)
        .text("Median Income")

        let healthcareLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "healthcare")
        .classed("inactive", true)
        .text("% Without Healthcare")
        
        let ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Median Age")  
        
    //append the y axis
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height/2))
        .attr("dy", "1em")
        .classed("aText", true)
        .text("% Who Smoke")

    //calling the updateToolTip function
    var circlesGroup = updatetoolTip(chosenXAxis, circlesGroup);

    //creating an event listener for the xaxis
    labelsGroup.selectAll("text")
        .on("click", function() {
            let selectionValue = d3.select(this).attr("value");
            if (selectionValue !== chosenXAxis) {
                chosenXAxis = selectionValue;

                xLinearScale = xScale(data, chosenXAxis);

                xAxis = renderAxes(xLinearScale, xAxis);

                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                circlesGroup = updatetoolTip(chosenXAxis, circlesGroup);

                if(chosenXAxis === "income") {
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    healthcareLabel
                        .classed("inactive", true)
                        .classed("active", false);
                    ageLabel
                        .classed("inactive", true)
                        .classed("active", false);
                }
                else if (chosenXAxis === "healthcare") {
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("inactive", false)
                        .classed("active", true);
                    ageLabel
                        .classed("inactive", true)
                        .classed("active", false);
                }
                else {
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("inactive", true)
                        .classed("active", false);
                    ageLabel
                        .classed("inactive", false)
                        .classed("active", true);
                };
            };
        });  
}).catch(function(error) {
    console.log(error);
});

