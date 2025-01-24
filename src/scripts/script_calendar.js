import scrollama from 'scrollama';
import * as d3 from "d3";




let width, height;
let vbWidth, vbHeight;
const vbMinX = 0;
const vbMinY = 0;

// using d3 for convenience
var main = d3.select('main');
var scrolly = main.select('#scrolly');
var sticky = scrolly.select('#sticky-thing');
var article = scrolly.select('article');
var step = article.selectAll('.step');
  




// create list of month names and days of the week (js stores these as numbers that correspond to the index of the following lists)
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


// data
    const events = [
        {date: new Date('2025-01-21'), label: 'Start shopping period', segment: 'start',link: 'https://cloudfront-us-east-1.images.arcpublishing.com/spectator/SXKBMSVSGRG33IB2XATXOLRLD4.png'},
        {date: new Date('2025-01-31'), label: 'End of shopping period', segment: 'end', link: 'https://cloudfront-us-east-1.images.arcpublishing.com/spectator/BKWCFTETX5D3XFUR2KICPMFP4E.png'},
        {date: new Date('2025-02-25'), label: 'Last day to drop classes', segment: 'na'},
        {date: new Date('2025-03-10'), label: 'Spring midterm date', segment: 'na', link: 'https://cloudfront-us-east-1.images.arcpublishing.com/spectator/WBKEKOAX3BED3LR7466RLHXJKY.png'},
        {date: new Date('2025-03-17'), label: 'Start of spring recess', segment: 'start',},
        {date: new Date('2025-03-21'), label: 'End of spring recess', segment: 'end'},
        {date: new Date('2025-03-27'), label: 'Last day to drop or PDF classes for SEAS students', segment: 'na',},
        {date: new Date('2025-04-14'), label: 'Start registration', segment: 'start'},
        {date: new Date('2025-04-18'), label: 'End registration', segment: 'end'},
        {date: new Date('2025-05-05'), label: 'Last day of class', segment: 'na', link: 'https://cloudfront-us-east-1.images.arcpublishing.com/spectator/Y256NHNJ6FFSZLZ2ZULRUQI3DE.png',annotation: "Also the last day to PDF classes for CC, GS, and BC students", target:  new Date(2025, 5,5)},
        {date: new Date('2025-05-06'), label: 'Start of reading period', segment: 'start', link: 'https://cloudfront-us-east-1.images.arcpublishing.com/spectator/YUYOAPVRPFHIRFQ75CTARUZVNE.png'},
        {date: new Date('2025-05-08'), label: 'End of reading period', segment: 'end'},
        {date: new Date('2025-05-09'), label: 'Start of finals', segment: 'start', link: 'https://cloudfront-us-east-1.images.arcpublishing.com/spectator/WBKEKOAX3BED3LR7466RLHXJKY.png'},
        {date: new Date('2025-05-16'), label: 'End of finals', segment: 'end'},
        {date: new Date('2025-05-21'), label: 'Commencement', segment: 'start',}, 
        {date: new Date('2025-05-21'), label: 'Commencement end', segment: 'end',}, 

    ];

width = document.body.clientWidth;
height = window.innerHeight;

// Create the SVG container
const svg = d3.select('svg')
.attr('width', width)
.attr('height', height)
.style("display", "block") // this and the margin thing should help to center the svg? maybe unnecessary
.style("margin", "auto")
.attr('viewBox', `0 0 ${width} ${height}`);


// Set size of calendar boxes/cells
const cellSize = Math.min(width / 7, height / 8); // choose whichever is smallest so all rows and columns fit in the viewbox


// Some important functions //

 // Function for text wrapping (https://stackoverflow.com/questions/24784302/wrapping-text-in-d3) 
    function wrap(text, width) {
      text.each(function () {
          var text = d3.select(this),
              words = text.text().split(/\s+/).reverse(),
              word,
              line = [],
              lineNumber = 0,
              lineHeight = 1.1, // ems
              x = text.attr("x"),
              y = text.attr("y"),
              dy = -1, 
              tspan = text.text(null)
                          .append("tspan")
                          .attr("x", x)
                          .attr("y", y)
                          .attr("dy", dy + "em");
          while (word = words.pop()) {
              line.push(word);
              tspan.text(line.join(" "));
              if (tspan.node().getComputedTextLength() > width) {
                  line.pop();
                  tspan.text(line.join(" "));
                  line = [word];
                  tspan = text.append("tspan")
                              .attr("x", x)
                              .attr("y", y)
                              .attr("dy", ++lineNumber * lineHeight + dy + "em")
                              .text(word);
              }
          }
      });
  }


function makeCalendar(month,year) {
  const firstDay = new Date(year, month, 1).getDay(); // day of the week for the 1st of the month
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // # of days in the month

  //console.log(firstDay);

  const calendarGroup = svg.append('g') // Append new group for each month's calendar
      .attr('class', `calendar-month-${month}`)
      .attr('transform', `translate(${width}, 0)`); // Start off-screen


  // add month label
  calendarGroup.append("text")
    .attr("x", width / 2)
    .attr("y", cellSize / 2)
    .attr("text-anchor", "middle")
    .text(monthNames[month] + " " + year)
    .style("font-weight", "bold")
    .style("font-size", "16px")
    .classed('roboto-bold', true); // make sure to add roboto classes to styles in the html

  // add day of week headers
  calendarGroup.selectAll(".header")
  .data(daysOfWeek)
  .enter().append("text")
  .attr("x", (d, i) => i * cellSize + cellSize / 2 + (width-(cellSize*7))/2)
  .attr("y", cellSize )
  .attr("text-anchor", "middle")
  .text(d => d)
  .classed('roboto',true);


  // add boxes for days
  calendarGroup.selectAll("rect")
  .data(d3.range(daysInMonth))
  .enter().append("rect")
  .attr("x", (d, i) => ((i + firstDay) % 7) * cellSize + (width-(cellSize*7))/2)
  .attr("y", d => Math.floor((d + firstDay) / 7) * cellSize + cellSize + 20)
  .attr("width", cellSize)
  .attr("height", cellSize)
  .attr("fill", "#fff")
  .attr("stroke", "#ddd")
  .attr('id', d => `day-${month + 1}-${d + 1}`); // give them an id for selection later


  // add date numbers
  calendarGroup.selectAll(".day")
    .data(d3.range(daysInMonth))
    .enter().append("text")
    .attr("x", (d, i) => ((i + firstDay) % 7) * cellSize + cellSize / 2 + (width-(cellSize*7))/2)
    .attr("y", d => Math.floor((d + firstDay) / 7) * cellSize + cellSize + 35)
    .attr("text-anchor", "middle")
    .classed('roboto-light',true)
    .text(d => d + 1)
    .style("font-size", "14px");

  // add images to dates with illos
  events.forEach(event => {
    if (event.date.getUTCMonth() === month && event.date.getUTCFullYear() === year) {
        const day = event.date.getUTCDate();
        const x = ((day + firstDay - 1) % 7) * cellSize + cellSize / 2 + (width-(cellSize*7))/2;
        const y = Math.floor((day + firstDay - 1) / 7) * cellSize + cellSize +  cellSize*.8;
        
        if (event.link) {
          calendarGroup.append("image")
                .attr("xlink:href", event.link)
                .attr("x", x - (cellSize/2))
                .attr("y", y - (cellSize/2))
                .attr("width", (cellSize))
                .attr("height", (cellSize))
                .attr('id', (d,i) => `image-${i}`);
        }
    }
  });



}

const months = [0,1, 2, 3, 4]; // list of months on the cal - January to May (these need to be the number of the actual month minus 1)
const year = 2025;


let currentMonthIndex = months[0];


// scrolly stuff 

var scroller = scrollama();

  
    
function handleStepEnter(response) {
    if(response.direction=='down') {
          // Call the appropriate step function based on the scroll index
    stepFunctionsDown[response.index]();
    }
    else if(response.direction=='up') {
        stepFunctionsUp[response.index]();
    }
    // Update the sticky element's class
    sticky.attr('class', 'step-' + response.index);
    console.log('index',response.index);
    return response;
    
}

function handleStepExit(response) {
    if (response.index == 0 && response.direction == 'up') {
      
        // Initially display the first month
  transitionToMonth(months[0]);
    }
}

function setupCalendars() {
  svg.selectAll(".calendar-month").remove(); 

  // Create calendars for all months
  months.forEach((month) => {
    makeCalendar(month, year);
  });

  // make sure the first month (aug) is visible initially
  transitionToMonth(months[0]);
  console.log(months[0]);
  
}

// Add annotations

// stuff for making arrowhead
svg.append('defs')
  .append('marker')
  .attr('id', 'arrowhead')
  .attr('viewBox', '0 0 10 10')
  .attr('refX', 9) 
  .attr('refY', 5)
  .attr('markerWidth', 5)
  .attr('markerHeight', 5)
  .attr('orient', 'auto-start-reverse') // set orientation of arrow
  .append('path')
  .attr('d', 'M 0 0 L 10 5 L 0 10 z') // arrowhead shape
  .attr('fill', 'black');


function addAnnotation(targetDate,message) {

  const day = targetDate.getUTCDate();
  const monthIndex = targetDate.getUTCMonth();
  
  // Get the calendar group for the month of the annotation
  const calendarGroup = svg.select(`.calendar-month-${monthIndex}`);
  
  // Calculate position
  const x = ((day + 2) % 7) * cellSize + cellSize / 2 + (width - (cellSize * 7)) / 2;
  const y = Math.floor((day + 1 + 0) / 7) * cellSize + cellSize + cellSize/2;
  // this is kind of hacky. probably a betterv way to do this ^

  // Add curved arrow
  calendarGroup.append("path")
      .attr("d", `M${x+cellSize/4} ${y-cellSize/2} Q${x + cellSize/1.7} ${y + cellSize/2} ${x + cellSize} ${y}`)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .classed('annotation-arrow',true)
      .style('opacity','100')
      .classed('annotation',true)
      // stuff for drawing the line:
      .attr("stroke-dasharray", function() {
        return this.getTotalLength(); // Set the dash array to the length of the path
    })
    .attr("stroke-dashoffset", function() {
        return this.getTotalLength(); 
    })
    .transition()
    .duration(500)  
    .attr("stroke-dashoffset", 0)
    .on("end", function() { // add the arrowhead when line is done being drawn
      d3.select(this).attr('marker-end', 'url(#arrowhead)')
    });  
      
  
  // add annotationtext
  calendarGroup.append("text")
      .attr("x",x+cellSize/8)
      .attr("y", y-cellSize/1.8)
      .text(`${message}`)
      .style('opacity','100')
      .style("font-size", "14px")
      .attr('text-anchor','middle')
      .style("fill", "black")
      .classed('annotation',true)
      .classed('roboto',true)
      .call(wrap,cellSize*3) // wrap if text is longer than 3 * cell size
    ;
}

function setup() {
  setupCalendars();

  // Initially display the first month
  transitionToMonth(months[0]);
  
  
}

function setupCalendars() {
  svg.selectAll(".calendar-month").remove(); // Clear existing calendars if any
  months.forEach(month => makeCalendar(month, year));
  transitionToMonth(months[0]);
}


// populate stepFunctions
var stepFunctionsDown = [];

for (let i =0; i < events.length+2;i++) {
  
  stepFunctionsDown.push(function() {

    const monthIndex = events[i].date.getUTCMonth(); // 0-based index
    transitionToMonth(monthIndex);

    // highlight active events
    svg.select(`.event-${i}`)
    .transition()
    .duration(1000)
    .style('fill','#75aadb')


    // fade out  old events
    if(events[i].segment !== 'end') { 
      svg.selectAll(`.event-${i-1}`).transition()
      .duration(1000)
      .style('fill','white');
      svg.selectAll(`.event-${i-2}`).transition()
      .duration(1000)
      .style('fill','white');
    }

    // highlight multiple dates (for segment)
    if(events[i].segment == 'start') {
      const startDate = events[i].date;
      const endDate = events[i+1].date;
      highlightDateRange(startDate, endDate);
  
    }

    // add annotation
    if(events[i].annotation) {
      const targetDate = events[i].target;
      const message = events[i].annotation;
      addAnnotation(targetDate,message);

    }
    

    });
    
}

    

var stepFunctionsUp = [
        
        
];


for (let i =0; i < events.length;i++) {
  stepFunctionsUp.push(function() { 
   
    // fade out annotations
    svg.selectAll('.annotation') 
    .transition()
    .duration(1000)
    .style('opacity','0')
    
    svg.select(`.event-${i}`)
    .transition()
    .duration(1000)
    .style('fill','#75aadb')


    if(events[i].segment == 'start') {
                
      const startDate = events[i].date;
      const endDate = events[i+1].date;

      
     highlightDateRange(startDate, endDate);
 
        }


    const monthIndex = events[i].date.getUTCMonth(); 
    transitionToMonthUp(monthIndex);
    });

    if(events[i].segment !== 'end') { 
      svg.selectAll(`.event-${i+1}`).transition()
        .duration(1000)
        .style('fill','white');
        svg.selectAll(`.event-${i+2}`).transition()
        .duration(1000)
        .style('fill','white');
      }
             
}

    
// Create scrollable sections
const steps = d3.select('#scroll-steps')
    .selectAll('div')
    .data(events)
    .enter().append('div')
    .attr('class', 'step')
    .text(d => d.label);

// Initialize scrollama
function init() {
    setup();
    scroller
      .setup({
        step: '#scrolly article .step',
        offset: 0.98,
        debug: false,
      })
      .onStepEnter(handleStepEnter)
      .onStepExit(handleStepExit);

    // Setup resize event listener
    window.addEventListener('resize', scroller.resize);
}

// Kick things off
init();

for (let i = 0; i < events.length; i++) {
  const month = events[i].date.getUTCMonth() + 1; // Months are 0-based in JavaScript
  const day = events[i].date.getUTCDate(); // Days are 1-based
  const id = `${month}-${day}`;

  svg.select(`#day-${id}`)
  .classed(`event-${i}`, true);
  
}


// function for highlighting range of dates 
function highlightDateRange(startDate, endDate) {
  // Ensure startDate is before endDate
  if (startDate > endDate) {
    [startDate, endDate] = [endDate, startDate];
  }



  // Clear previous highlights

  
  svg.selectAll('rect').transition()
  .duration(1000)
  .style('fill','white')
  .on('end', function() {

    // apply new highlights after previous ones are erased
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const month = currentDate.getUTCMonth() + 1;
      const day = currentDate.getUTCDate();
      const dayCellId = `day-${month}-${day}`;

      //TO-DO
      const finalsWeekend = ['day-5-10', 'day-5-11']; // we don't want to highlight this
 
      console.log(dayCellId);
      svg.select(`#${dayCellId}`)
        .transition()
        .duration(1000) // Duration for highlighting
        .style('fill', function() {
          // Determine the fill color based on the dayCellId
          return finalsWeekend.includes(dayCellId) ? '#FFFFFF' : '#75aadb'; // White for specific days, default color for others
      });

      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
  });
}


function transitionToMonth(newMonthIndex) {
  console.log("currentMonthIndex", currentMonthIndex);
  console.log("newMonthIndex", newMonthIndex);

    // If the new month is the same as the current month, do nothing
    if (currentMonthIndex === newMonthIndex) {
      // Ensure the new month is visible
      svg.select(`.calendar-month-${newMonthIndex}`)
        .style('display', 'block')
        .attr('transform', 'translate(0, 0)'); // Make sure it's positioned correctly
      return;
    }

  const currentCalendar = svg.select(`.calendar-month-${currentMonthIndex}`);
  const newCalendar = svg.select(`.calendar-month-${newMonthIndex}`);

  // Calculate the vertical offset for the transition
  const verticalOffset = height; // This should be the height of the calendar container

  // Move the current month off-screen (upwards)
  currentCalendar
    .transition()
    .duration(1000)
    .attr('transform', `translate(0, ${verticalOffset})`)
    .on('end', function() {
      // After the transition, hide the old calendar
      currentCalendar.style('display', 'none');
    });

  // Position the new month off-screen (downwards) and then slide it into view
  newCalendar
    .attr('transform', `translate(0, ${-verticalOffset})`) // Start off-screen
    .style('display', 'block') // Ensure the new calendar is visible
    .transition()
    .duration(1000)
    .attr('transform', 'translate(0, 0)'); // Slide into view

  // update current month index
  currentMonthIndex = newMonthIndex;
}


function transitionToMonthUp(newMonthIndex) {
  console.log("currentMonthIndex", currentMonthIndex);
  console.log("newMonthIndex", newMonthIndex);

  if (currentMonthIndex === newMonthIndex) return; // No need to transition if the month is the same

  const currentCalendar = svg.select(`.calendar-month-${currentMonthIndex}`);
  const newCalendar = svg.select(`.calendar-month-${newMonthIndex}`);

  // Calculate the vertical offset for the transition
  const verticalOffset = height; // This should be the height of the calendar container

  // Move the current month off-screen (upwards)
  currentCalendar
    .transition()
    .duration(1000)
    .attr('transform', `translate(0, ${-verticalOffset})`)
    .on('end', function() {
      // After the transition, hide old calendar
      currentCalendar.style('display', 'none');
    });

  // Position the new month off-screen (below the visible area), and then slide it into view
  newCalendar
    .attr('transform', `translate(0, ${verticalOffset})`) // Start off-screen (below the visible area)
    .style('display', 'block') // make sure new calendar is visible
    .transition()
    .duration(1000)
    .attr('transform', 'translate(0, 0)'); // Slide into view

  // Update the current month index
  currentMonthIndex = newMonthIndex;
}
