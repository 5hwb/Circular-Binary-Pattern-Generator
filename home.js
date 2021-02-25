// Keycode for the 'Enter' key
const KEY_ENTER = 13; 

// Gap between grid lines
const gridGap = 50;

// True = enable gridlines
var isDebugging = true;

//
var patternMessage = "";

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

// Convert a Latin alphabet letter into its corresponding number in the Latin alphabet order (A, B, C etc)
function letterToNum(letter) {
  // Note: 97 = char code for the lowercase letter 'a'
  return letter.charCodeAt(0) - 97;
}

// Convert an integer into a binary string
function numToBin(num) {
  return num.toString(2);
}

// Pad a binary string to the given amount of digits
function padBinaryString(binStr, numDigits) {
  return "0".repeat(numDigits - binStr.length) + binStr;
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
  var time = new Date();
  
  if (c.getContext) {
    var ctx = c.getContext("2d");
    
    ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0, 0, sizeX, sizeY); // clear canvas
    
    // Sample text
    //var sampleText = "thatssad";
    var encodedText = patternMessage.split("").map(letter => letterToNum(letter) + 1)
                                          .map(num => numToBin(num))
                                          .map(binStr => padBinaryString(binStr, 7));
    console.log(encodedText);
    
    // Arcs to represent the pattern
    var numOfArcs = 80;
    var arcSize = 360 / numOfArcs;
    var overlapDegrees = 0.4;
    //var binaryMsg = "1010101010";
    var binaryMsg = "0100110000" + "0010111000" + "0000111000" + "0011010000"
                  + "0001010000" + "1111111111" + "1111111111" + "1111111000";
    
    var binaryMsg2 = encodedText.slice(0, 8).map(binStr => binStr + "0".repeat(3)).join("");
    console.log(binaryMsg2);

    for (var i = 0; i < numOfArcs; i += 1) {
      // If char is 1, draw an arc
      if (binaryMsg[i] == 1) {
        ctx.beginPath();
        // Draw an arc clockwise.
        // Formula is (Math.PI/180)*deg where 'deg' is the angle in degrees.
        // To make adjacent arcs merge with each other more seamlessly,
        // an additional 0.2 degrees is added for the other side of the arc.
        ctx.arc(300, 300, 120+60, (Math.PI/180)*arcSize*i, (Math.PI/180)*(arcSize*(i+1)+overlapDegrees), false);
        // Draw the other arc counterclockwise
        ctx.arc(300, 300, 120, (Math.PI/180)*(arcSize*(i+1)+overlapDegrees), (Math.PI/180)*arcSize*i, true);
        //ctx.lineTo(550, 500);
        ctx.fillStyle = 'rgb(255, 230, 0)';
        ctx.fill();
      }
    }
    for (var i = 0; i < numOfArcs; i += 1) {
      // If char is 1, draw an arc
      if (binaryMsg2[i] == 1) {
        ctx.beginPath();
        // Draw an arc clockwise.
        // Formula is (Math.PI/180)*deg where 'deg' is the angle in degrees.
        // To make adjacent arcs merge with each other more seamlessly,
        // an additional 0.2 degrees is added for the other side of the arc.
        ctx.arc(300, 300, 180+60, (Math.PI/180)*arcSize*i, (Math.PI/180)*(arcSize*(i+1)+overlapDegrees), false);
        // Draw the other arc counterclockwise
        ctx.arc(300, 300, 180, (Math.PI/180)*(arcSize*(i+1)+overlapDegrees), (Math.PI/180)*arcSize*i, true);
        //ctx.lineTo(550, 500);
        ctx.fillStyle = 'rgb(255, 230, 0)';
        ctx.fill();
      }
    }
    
    // Circle base
    ctx.beginPath();
    ctx.arc(300, 300, 300, (Math.PI/180)*0, (Math.PI/180)*360, false);
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

// Get all input keypresses
function receiveKeypress(e, context) {
  console.log("=================");
  if (e.key == "Enter") {
    patternMessage = context.value.toLowerCase();
    console.log(patternMessage);

    initExperiment();
  }
}

// Start the canvas rendering
function init() {
  var userMessageElement = document.getElementById("usermessage");
  // Add event listeners to user message textarea
  userMessageElement.addEventListener("keypress", function(event) {
    receiveKeypress(event, this);
  }, true);
  
  initExperiment();
}
