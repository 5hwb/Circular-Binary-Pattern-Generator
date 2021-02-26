//////////////////////////////////////////////////
// CLASSES
//////////////////////////////////////////////////

class MessageRing {
  constructor(ringMessage, numOfMsgChars, binaryLen, paddingLen) {
    this.ringMessage = ringMessage;
    this.numOfMsgChars = numOfMsgChars;
    this.binaryLen = binaryLen;
    this.paddingLen = paddingLen;
    
    this.numOfArcs = numOfMsgChars * (binaryLen + paddingLen);
    this.arcSize = 360 / numOfArcs;
  }
}

//////////////////////////////////////////////////
// BOOLEAN FLAGS
//////////////////////////////////////////////////

// True = enable gridlines
var isDebugging = true;

// True: Alphabet mode - each letter is encoded according to its order (A = 1, B = 2 etc)
// False: ASCII/Unicode mode - each letter is encoded with its Unicode number
var isLatinAlphabetMode = true;

// True: Message is spread across more than 1 ring automatically
// False: Message is manually defined for each ring
var isSpreadAcrossRings = false;

//////////////////////////////////////////////////
// OTHER IMPORTANT VARIABLES
//////////////////////////////////////////////////

// Keycode for the 'Enter' key
const KEY_ENTER = 13; 

// Gap between grid lines
const gridGap = 50;

// The message to be encoded by the pattern
var patternMessage = "mightyzz";

// Number of arcs
var numOfArcs = 80;

// Size of the arc in degrees
var arcSize = 360 / numOfArcs;

// Amount of overlap between arcs in degrees (to make adjacent arcs merge with each other more seamlessly)
var overlapDegrees = 0.3;

/*
NEXT TASKS:
* Offer 2 options: (1) Configure the message for each ring, or (2) let the message wrap around itself
*/

let msgRing1 = new MessageRing("speedcore dandy", 8, 7, 3);
console.log(msgRing1);
console.log(msgRing1.ringMessage);

//////////////////////////////////////////////////
// FUNCTIONS
//////////////////////////////////////////////////

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

// Render an arc
function drawArc(ctx, centreX, centreY, innerRadius, outerRadius, angleStart, angleEnd) {
  ctx.beginPath();
  // Draw an arc clockwise.
  // Formula is (Math.PI/180)*deg where 'deg' is the angle in degrees.
  ctx.arc(centreX, centreY, outerRadius, angleStart, angleEnd, false);
  // Draw the other arc counterclockwise
  ctx.arc(centreX, centreY, innerRadius, angleEnd, angleStart, true);
  ctx.fillStyle = 'rgb(255, 230, 0)';
  ctx.fill();
}

//////////////////////////////////////////////////
// BINARY CIRCULAR PATTERN GENERATOR SETUP
//////////////////////////////////////////////////

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
    var encodedText = patternMessage.split("").map(letter => letterToNum(letter) + 1)
                                          .map(num => numToBin(num))
                                          .map(binStr => padBinaryString(binStr, 7));
    console.log(encodedText);

    // Sample binary messages
    var binaryMsg = "0100110000" + "0010111000" + "0000111000" + "0011010000"
                  + "0001010000" + "1111111111" + "1111111111" + "1111111000";

    var binaryMsg2 = encodedText.slice(0, 8).map(binStr => binStr + "0".repeat(3)).join("");
    console.log(binaryMsg2);
        
    // Arcs to represent the pattern
    for (var i = 0; i < numOfArcs; i += 1) {
      // If char is 1, draw an arc
      if (binaryMsg[i] == 1) {
        drawArc(ctx, 300, 300, 120, 120+60.7, (Math.PI/180)*arcSize*i, (Math.PI/180)*(arcSize*(i+1)+overlapDegrees));
      }
    }
    for (var i = 0; i < numOfArcs; i += 1) {
      // If char is 1, draw an arc
      if (binaryMsg2[i] == 1) {
        drawArc(ctx, 300, 300, 180, 180+60.7, (Math.PI/180)*arcSize*i, (Math.PI/180)*(arcSize*(i+1)+overlapDegrees));
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
function receiveKeyup(e, context) {
  console.log("=================");
  patternMessage = context.value.toLowerCase();
  console.log(patternMessage);

  initExperiment();
}

// Start the canvas rendering
function init() {
  var userMessageElement = document.getElementById("usermessage");
  // Add event listeners to user message textarea
  userMessageElement.addEventListener("keyup", function(event) {
    receiveKeyup(event, this);
  }, true);
  
  initExperiment();
}
