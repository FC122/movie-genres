

const slider = document.getElementById("columnYearSlider");
const sliderValue = document.getElementById("columnYearValue");

const ratingSlider = document.getElementById("ratingSlider");
const ratingValue = document.getElementById("ratingValue");

const grossSlider = document.getElementById("grossSlider");
const grossValue = document.getElementById("grossValue");

const runtimeSlider = document.getElementById("runtimeSlider");
const runtimeValue = document.getElementById("runtimeValue");

var timer; // Variable to store the timer ID

var selectedYear;

var rating;

var gross;

var runtime;

function clearSVG() {
  // Select the SVG element and remove its child elements
  d3.select("#chordDiagram").selectAll("*").remove();
}

// Set up event listener for the slider input event
slider.addEventListener("input", function() {
  selectedYear = parseInt(this.value);
  sliderValue.textContent = selectedYear;
  // Clear the previous timer, if any
  clearTimeout(timer);

  // Start a new timer to delay the update function
  timer = setTimeout(function() {
    clearSVG();
    updateChordDiagram(selectedYear, rating, runtime, gross);
  }, 100); // Adjust the delay time (in milliseconds) as needed
});

// Set up event listener for the slider input event
ratingSlider.addEventListener("input", function() {
  rating = parseInt(this.value);
  ratingValue.textContent = rating;
  // Clear the previous timer, if any
  clearTimeout(timer);
  // Start a new timer to delay the update function
  timer = setTimeout(function() {
    clearSVG();
    updateChordDiagram(selectedYear, rating, runtime, gross);
  }, 100); // Adjust the delay time (in milliseconds) as needed
});

// Set up event listener for the slider input event
grossSlider.addEventListener("input", function() {
  gross = parseInt(this.value);
  grossValue.textContent = gross;
  // Clear the previous timer, if any
  clearTimeout(timer);

  // Start a new timer to delay the update function
  timer = setTimeout(function() {
    clearSVG();
    updateChordDiagram(selectedYear, rating, runtime, gross);
  }, 100); // Adjust the delay time (in milliseconds) as needed
});

// Set up event listener for the slider input event
runtimeSlider.addEventListener("input", function() {
  runtime = parseInt(this.value);
  runtimeValue.textContent = runtime;
  // Clear the previous timer, if any
  clearTimeout(timer);

  // Start a new timer to delay the update function
  timer = setTimeout(function() {
    clearSVG();
    updateChordDiagram(selectedYear, rating, runtime, gross);
  }, 100); // Adjust the delay time (in milliseconds) as needed
});

function updateChordDiagram(year, rating,  runtime, gross) {
  try {
    d3.json("csvjson.json").then(function(rawData) {
      getChordData(rawData, year, rating,  runtime, gross).then(function(chordData) {
        console.log(chordData)
        // Create a selection for the chord diagram
        const diagram = d3.select("#chordDiagram");

        // Transition the diagram to the new data
        diagram.selectAll("*").transition()
          .duration(5) // Adjust the transition duration as needed
          .style("opacity", 500) // Fade out the existing elements
          .remove() // Remove the existing elements
          .end().then(function() {
            // Once the transition is complete, generate and visualize the new chord diagram
            visualizeChordDiagram(chordData);
          });
      }).catch(function(error) {
        console.error("Error:", error);
      });
    }).catch(function(error) {
      console.error("Error:", error);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}


function getColumnDataByIndex(matrix, columnIndex) {
  // Check if the matrix is not empty
  if (matrix.length === 0) {
    console.error('Matrix is empty.');
    return [];
  }

  // Check if the columnIndex is within bounds
  if (columnIndex < 0 || columnIndex >= Object.keys(matrix[0]).length) {
    console.error(`Invalid columnIndex: ${columnIndex}`);
    return [];
  }

  // Extract the column data from the matrix
  const columnData = matrix.map(row => Object.entries(row)[columnIndex][1]);

  return columnData;
}

async function getChordData(matrix, year, rating,  runtime, gross) {
  const data = [];

  for (let i = 2; i < 17; i++) {
    const columnI = getColumnDataByIndex(matrix, i);
    const columnYear = getColumnDataByIndex(matrix, 0);
    const columnRating = getColumnDataByIndex(matrix, 18);
    const columnGross = getColumnDataByIndex(matrix, 17);
    const columnRuntime = getColumnDataByIndex(matrix, 1);
    const row = [];
    for (let j = 2; j < 17; j++) {
      const columnJ = getColumnDataByIndex(matrix, j);
      let ctr = 0;
      for (let k = 0; k < columnI.length; k++) {
        if (columnI[k] === "TRUE" && columnJ[k] === "TRUE" && i !== j && columnYear[k] < year && columnRating[k]<rating && columnGross[k]<gross && columnRuntime[k]<runtime) {
          ctr++;
        }
        if (i === j && columnYear[k] < 2000) {
          ctr++;
        }
      }
      if (i !== j) {
        row.push(ctr);
      } else if (i === j) {
        row.push(ctr/1000);
      }
    }

    data.push(row);
  }
  return data;
}



function visualizeChordDiagram(data) {
  // Category labels
  const categories = [
    "Horror", "Crime", "Comedy", "Romance", "Music", "Adventure", "Mystery", "War",
    "Western", "Biography", "History", "Thriller", "Sci-Fi", "Action", "Drama"
  ];
  // Color scale for genres
  const colorScale = d3.scaleOrdinal()
    .domain(categories)
    .range(d3.schemeCategory10);
  // Set up the dimensions and margins of the diagram
  const width = 900;
  const height = 700;
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const outerRadius = Math.min(innerWidth, innerHeight) * 0.5 - 100;
  const innerRadius = outerRadius - 20;
  // Create the SVG element
  const svg = d3.select("#chordDiagram")
    .attr("width", width)
    .attr("height", height)
    .style("display", "block") // Set display to block to center the SVG
    .style("margin", "auto")
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);
  // Create a tooltip element
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("pointer-events", "none");
  // Create the chord layout
  const chord = d3.chord()
    .padAngle(0.05)
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending);
  // Generate the chord data from the matrix
  const chords = chord(data);

  // Create the arcs for the groups
  const group = svg.selectAll("g")
    .data(chords.groups)
    .join("g");
  group.append("path")
    .attr("class", "arc")
    .attr("fill", (d, i) => colorScale(categories[i]))
    .attr("d", d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
    ).on("mouseover", function() {
      d3.select(this).style("fill-opacity", 1);
    })
    .on("mouseout", function() {
      d3.select(this).style("fill-opacity", null);
    });
  
  group.append("text")
    .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
    .attr("dy", "0.35em")
    .attr("transform", d => `
      rotate(${(d.angle * 180 / Math.PI - 90)})
      translate(${outerRadius + 10})
      ${d.angle > Math.PI ? "rotate(180)" : ""}
    `)
    .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
    .text((d, i) => categories[i])
    .attr("class", "genre-text");


  // Create the ribbons for the chords
 // Create the ribbons for the chords
const ribbons = svg.selectAll(".ribbon")
  .data(chords)
  .join("path")
  .attr("class", "ribbon")
  .attr("fill", (d) => colorScale(categories[d.source.index]))
  .attr("d", d3.ribbon()
    .radius(innerRadius)
  )
  .attr("fill-opacity", 0.7)
  .on("mouseover", function (event, ribbonData) {
    const genreIndex = ribbonData.source.index;
    svg.selectAll(".ribbon")
      .attr("fill-opacity", function (d) {
        return d.source.index === genreIndex ? 1 : 0.7;
      });
    d3.select(this).style("fill-opacity", 1);
  
    let numberOfMovies = data[ribbonData.source.index][ribbonData.target.index];
    console.log(`Number of Movies: ${numberOfMovies}`);  // Added this line for debugging
      if(numberOfMovies<1){
        numberOfMovies=numberOfMovies*1000
      }
    tooltip.style("opacity", 1)
      .html(`Number of Movies: ${numberOfMovies}`)
      .style("left", `${event.pageX + 10}px`)
      .style("top", `${event.pageY + 10}px`);
  })
  
  .on("mouseout", function () {
    d3.select(this).style("fill-opacity", 0.7);
    svg.selectAll(".ribbon")
      .attr("fill-opacity", 0.7);
    tooltip.style("opacity", 0);
  });


  ribbons.on('dblclick', function(event, d) {
    const target = d3.select(event.currentTarget);
    target.transition()
      .duration(1000)
      .attr('transform', 'scale(2)')
      .on('end', () => {
        target.transition()
          .delay(2000)
          .duration(1000)
          .attr('transform', 'scale(1)');
      });
  });
}



async function fetchData() {
  try {
    const rawData = await d3.json("csvjson.json");
    const initialYear = 1950;
    const chordData = await getChordData(rawData, 2020, 10 ,300 ,2000000000);
    visualizeChordDiagram(chordData);  
 selectedYear=2020

 rating=10

 gross=2000000000

 runtime=300
  } catch (error) {
    console.error("Error:", error);
  }
}

fetchData();