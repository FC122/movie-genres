var slider = document.getElementById("columnYearSlider");
var sliderValue = document.getElementById("columnYearValue");

var ratingSlider = document.getElementById("ratingSlider");
var ratingValue = document.getElementById("ratingValue");

var grossSlider = document.getElementById("grossSlider");
var grossValue = document.getElementById("grossValue");

var runtimeSlider = document.getElementById("runtimeSlider");
var runtimeValue = document.getElementById("runtimeValue");

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
slider.addEventListener("input", function () {
  selectedYear = parseInt(this.value);
  sliderValue.textContent = selectedYear;
  // Clear the previous timer, if any
  clearTimeout(timer);

  // Start a new timer to delay the update function
  timer = setTimeout(function () {
    clearSVG();
    updateChordDiagram(selectedYear, rating, runtime, gross);
  }, 100); // Adjust the delay time (in milliseconds) as needed
});

// Set up event listener for the slider input event
ratingSlider.addEventListener("input", function () {
  rating = parseInt(this.value);
  ratingValue.textContent = rating;
  // Clear the previous timer, if any
  clearTimeout(timer);
  // Start a new timer to delay the update function
  timer = setTimeout(function () {
    clearSVG();
    updateChordDiagram(selectedYear, rating, runtime, gross);
  }, 100); // Adjust the delay time (in milliseconds) as needed
});

// Set up event listener for the slider input event
grossSlider.addEventListener("input", function () {
  gross = parseInt(this.value);
  grossValue.textContent = gross;
  // Clear the previous timer, if any
  clearTimeout(timer);

  // Start a new timer to delay the update function
  timer = setTimeout(function () {
    clearSVG();
    updateChordDiagram(selectedYear, rating, runtime, gross);
  }, 100); // Adjust the delay time (in milliseconds) as needed
});

// Set up event listener for the slider input event
runtimeSlider.addEventListener("input", function () {
  runtime = parseInt(this.value);
  runtimeValue.textContent = runtime;
  // Clear the previous timer, if any
  clearTimeout(timer);

  // Start a new timer to delay the update function
  timer = setTimeout(function () {
    clearSVG();
    updateChordDiagram(selectedYear, rating, runtime, gross);
  }, 100); // Adjust the delay time (in milliseconds) as needed
});

async function fetchData() {
  try {
    const rawData = await d3.json("csvjson.json");
    const initialYear = 1950;
    const chordData = await getChordData(rawData, 2020, 10, 300, 2000000000);
    visualizeChordDiagram(chordData);
    selectedYear = 2020;
    rating = 10;
    gross = 2000000000;
    runtime = 300;
  } catch (error) {
    console.error("Error:", error);
  }
}

async function updateChordDiagram(year, rating, runtime, gross) {
  try {
    const rawData = await d3.json("csvjson.json");
    const chordData = await getChordData(rawData, year, rating, runtime, gross);
    console.log(chordData);
    visualizeChordDiagram(chordData);
  } catch (error) {
    console.error("Error:", error);
  }
}

fetchData();

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

async function getChordData(matrix, year, rating, runtime, gross) {
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
        if (
          columnI[k] === "TRUE" &&
          columnJ[k] === "TRUE" &&
          i !== j &&
          columnYear[k] < year &&
          columnRating[k] < rating &&
          columnGross[k] < gross &&
          columnRuntime[k] < runtime
        ) {
          ctr++;
        }
        if (i === j && columnYear[k] < 2000) {
          ctr++;
        }
      }
      if (i !== j) {
        row.push(ctr);
      } else if (i === j) {
        row.push(ctr / 1000);
      }
    }

    data.push(row);
  }
  return data;
}

function visualizeChordDiagram(data) {
  const categories = [
    "Horror",
    "Crime",
    "Comedy",
    "Romance",
    "Music",
    "Adventure",
    "Mystery",
    "War",
    "Western",
    "Biography",
    "History",
    "Thriller",
    "Sci-Fi",
    "Action",
    "Drama",
  ];

  const colorScale = d3
    .scaleOrdinal()
    .domain(categories)
    .range(d3.schemeCategory10);

  const width = 900;
  const height = 700;
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const outerRadius = Math.min(innerWidth, innerHeight) * 0.5 - 100;
  const innerRadius = outerRadius - 20;

  const svg = d3
    .select("#chordDiagram")
    .attr("width", width)
    .attr("height", height)
    .style("display", "block")
    .style("margin", "auto")
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("pointer-events", "none");

  const chord = d3
    .chord()
    .padAngle(0.05)
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending);

  const chords = chord(data);

  const group = svg.selectAll("g").data(chords.groups).join("g");

    // Add transitions to the group elements
    group.transition().duration(1000)
    .attrTween("transform", function(d) {
      const previousAngle = (d.startAngle + d.endAngle) / 2;
      const newAngle = (d.startAngle + d.endAngle) / 2;
      return d3.interpolateString(
        `rotate(${previousAngle * 180 / Math.PI})`,
        `rotate(${newAngle * 180 / Math.PI})`
      );
    });
  
  group.selectAll("path.arc")
    .transition().duration(1000)
    .attrTween("d", function(d) {
      const previousPath = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius)(d);
      const newPath = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius)(d);
      return d3.interpolatePath(previousPath, newPath);
    });

  group
    .append("path")
    .attr("class", "arc")
    .attr("fill", (d, i) => colorScale(categories[i]))
    .attr("d", d3.arc().innerRadius(innerRadius).outerRadius(outerRadius))
    .on("mouseover", function () {
      d3.select(this).style("fill-opacity", 1);
    })
    .on("mouseout", function () {
      d3.select(this).style("fill-opacity", null);
    });

  group
    .append("text")
    .each((d) => {
      d.angle = (d.startAngle + d.endAngle) / 2;
    })
    .attr("dy", "0.35em")
    .attr(
      "transform",
      (d) =>
        `
    rotate(${(d.angle * 180 / Math.PI - 90)})
    translate(${outerRadius + 10})
    ${d.angle > Math.PI ? "rotate(180)" : ""}
  `
    )
    .attr("text-anchor", (d) => (d.angle > Math.PI ? "end" : null))
    .text((d, i) => categories[i])
    .attr("class", "genre-text");

  const ribbons = svg
    .selectAll(".ribbon")
    .data(chords)
    .join("path")
    .attr("class", "ribbon")
    .attr("fill", (d) => colorScale(categories[d.source.index]))
    .attr("d", d3.ribbon().radius(innerRadius))
    .attr("fill-opacity", 0.7)
    .on("mouseover", function (event, ribbonData) {
      const genreIndex = ribbonData.source.index;
      svg
        .selectAll(".ribbon")
        .attr("fill-opacity", function (d) {
          return d.source.index === genreIndex ? 1 : 0.7;
        });
      d3.select(this).style("fill-opacity", 1);

      let numberOfMovies = data[ribbonData.source.index][
        ribbonData.target.index
      ];
      console.log(`Number of Movies: ${numberOfMovies}`);
      if (numberOfMovies < 1) {
        numberOfMovies = numberOfMovies * 1000;
      }
      tooltip
        .style("opacity", 1)
        .html(`Number of Movies: ${numberOfMovies}`)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY + 10}px`);
    })
    .on("mouseout", function () {
      d3.select(this).style("fill-opacity", 0.7);
      svg.selectAll(".ribbon").attr("fill-opacity", 0.7);
      tooltip.style("opacity", 0);
    });

     // Add transitions to the ribbon elements
  ribbons.transition().duration(1000)
  .attrTween("d", function(d) {
    const previousPath = d3.ribbon().radius(innerRadius)(d);
    const newPath = d3.ribbon().radius(innerRadius)(d);
    return d3.interpolatePath(previousPath, newPath);
  });

  ribbons.on("dblclick", function (event, d) {
    const target = d3.select(event.currentTarget);
    target
      .transition()
      .duration(1000)
      .attr("transform", "scale(2)")
      .on("end", () => {
        target
          .transition()
          .delay(2000)
          .duration(1000)
          .attr("transform", "scale(1)");
      });
  });
} 