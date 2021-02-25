// Keycode for the 'Enter' key
const KEY_ENTER = 13; 

// Gap between grid lines
const gridGap = 50;

// True = enable gridlines
var isDebugging = true;

// Draw grid lines and ruler markings across the canvas element.
// For debugging only
function drawGridLines(ctx, sizeX, sizeY) {
  // Print the X axis scales and gridlines
  for (var i = 0; i < sizeX; i += 10) {
    ctx.strokeStyle = 'rgb(0, 0, 0)';
    var isMajorInterval = i % gridGap == 0;
    var lineSize = (isMajorInterval) ? 10 : 5;

    // Scale lines
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, lineSize);
    ctx.closePath();
    ctx.stroke();

    // Gridlines
    if (isMajorInterval) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, sizeY);
      ctx.closePath();
      ctx.stroke();
    }
  }

  // Print the Y axis scales and gridlines
  for (var j = 0; j < sizeY; j += 10) {
    ctx.strokeStyle = 'rgb(0, 0, 0)';
    var isMajorInterval = j % gridGap == 0;
    var lineSize = (isMajorInterval) ? 10 : 5;

    // Scale lines
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(lineSize, j);
    ctx.closePath();
    ctx.stroke();

    // Gridlines
    if (isMajorInterval) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(sizeX, j);
      ctx.closePath();
      ctx.stroke();
    }
  }
}

// Initialise the experimental canvas element
function initExperiment() {
  // Add an event listener to the canvas element to detect mouse clicks
  const canvas = document.querySelector('canvas');
  canvas.addEventListener('keydown', function(e) {
    console.log(e.code);
    
    // Render a new frame
    window.requestAnimationFrame(drawExperiment);
  });
  
  window.requestAnimationFrame(drawExperiment);
}

// Render the experimental canvas element
function drawExperiment() {
  var c = document.getElementById("tutorial");
  
  var sizeX = 600;
  var sizeY = 600;
  const rotatePeriod = 3; // Num of seconds for 1 rotation of the green rectangle
  var time = new Date();
  
  if (c.getContext) {
    var ctx = c.getContext("2d");
    
    ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0, 0, sizeX, sizeY); // clear canvas
    
    // Draw a line
    ctx.strokeStyle = 'rgb(0, 0, 0)';
    ctx.moveTo(0, 0);
    ctx.lineTo(200, 100);
    ctx.stroke();
    
    // Draw some rectangles
    ctx.fillStyle = 'rgb(200, 0, 0)';
    ctx.fillRect(10, 10, 50, 50);
    
    ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
    ctx.fillRect(30, 30, 50, 50);
    
    // Rotate this rectangle!
    ctx.save(); // Save the state of the current canvas
    ctx.translate(500, 500); // Move the rectangle to the given coordinate
    // ctx.rotate( // Rotate the element
    //   ((2 * Math.PI) / rotatePeriod) * time.getSeconds() + 
    //   ((2 * Math.PI) / (rotatePeriod*1000)) * time.getMilliseconds());
    ctx.translate(-50/2, -50/2); // Move the rectangle so it rotates in its centre
    ctx.strokeStyle = 'rgb(0, 200, 0)';
    ctx.strokeRect(0, 0, 50, 50); // Render the rectangle
    ctx.restore(); // Restore the current canvas state (so that the other elements don't rotate) 
    
    // Clear a 50x50 size space
    ctx.clearRect(60, 60, 50, 50);
    
    // Add some text
    ctx.strokeStyle = 'rgb(0, 0, 0)';
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.font = '18px serif';
    ctx.fillText('Canvas is awesome', 310, 50);
    ctx.fillText('They the best', 310, 70);
    ctx.font = '30px sans-serif';
    ctx.strokeText('Outlier', 310, 120);
    
    // Arcs to represent the pattern
    var numOfArcs = 10;
    var arcSize = 360 / numOfArcs;
    var overlapDegrees = 0.2;
    var binaryMsg = "0100110011";
    
    for (var i = 0; i < numOfArcs; i += 1) {
      // If char is 1, draw an arc
      if (i % 2 == 0) {
        ctx.beginPath();
        // Draw an arc clockwise.
        // Formula is (Math.PI/180)*deg where 'deg' is the angle in degrees.
        // To make adjacent arcs merge with each other more seamlessly, an additional 0.2 degrees is added for the other side of the arc.
        ctx.arc(300, 300, 75, (Math.PI/180)*arcSize*i, (Math.PI/180)*(arcSize*(i+1)+overlapDegrees), false);
        // Draw the other arc counterclockwise
        ctx.arc(300, 300, 60, (Math.PI/180)*(arcSize*(i+1)+overlapDegrees), (Math.PI/180)*arcSize*i, true);
        //ctx.lineTo(550, 500);
        ctx.fillStyle = 'rgb(255, 230, 0)';
        ctx.fill();
      }
    }
    
    // Circle base
    ctx.beginPath();
    ctx.arc(300, 300, 150, (Math.PI/180)*0, (Math.PI/180)*360, false);
    ctx.fillStyle = 'rgb(100, 0, 0)';
    ctx.fill();

    if (isDebugging) {
      drawGridLines(ctx, sizeX, sizeY);
    }
    
    // Draw a 'wood colour' background
    ctx.fillStyle = '#DDB06D';
    ctx.fillRect(0, 0, sizeX, sizeY);
    
  } else {
    // canvas-unsupported code here
    console.log("CANVAS NOT SUPPORTED!");
  }
}

// Start the canvas rendering
function init() {
  initExperiment();
}
