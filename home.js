/*
NEXT TASKS:
* Offer 2 options: (1) Configure the message for each ring, or (2) let the message wrap around itself
* Add frontend that can adapt to the above 2 states
*/

//////////////////////////////////////////////////
// CLASSES
//////////////////////////////////////////////////

/** @class MessageRing represents the message to encode in 1 single ring and
  * any additional parameters required for rendering this ring. */
class MessageRing {
  /**
   * Create a new MessageRing instance.
   *
   * @author: 5hwb (Perry Hartono)
   * @param {string} ringMessage The ring message to encode
   * @param {number} numOfMsgChars The number of message characters to encode in the pattern
   * @param {number} binaryLen Length of binary encoding of character
   * @param {number} paddingLen Length of additional padding between encoded characters
   * @param {number} msgOffset Amount of chars to shift the ring by
   */
  constructor(ringMessage, numOfMsgChars, binaryLen, paddingLen, msgOffset) {
    this.ringMessage = ringMessage;
    this.numOfMsgChars = numOfMsgChars;
    this.binaryLen = binaryLen;
    this.paddingLen = paddingLen;
    this.msgOffset = msgOffset;
    
    this.numOfArcs = numOfMsgChars * (binaryLen + paddingLen);
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

let msgRing1 = new MessageRing("speedcore dandy", 8, 7, 3, 0);
console.log(msgRing1);
console.log(msgRing1.ringMessage);

//////////////////////////////////////////////////
// CANVAS SHAPE RENDERING FUNCTIONS
//////////////////////////////////////////////////

/**
 * Draw grid lines and ruler markings across the canvas element.
 * For debugging only
 *
 * @param {CanvasRenderingContext2D} ctx Context of the canvas element to draw on
 * @param {number} sizeX X-dimensions of grid line markings
 * @param {number} sizeY Y-dimensions of grid line markings
 */
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

/**
 * Render an arc to the given canvas context
 *
 * @param {CanvasRenderingContext2D} ctx Context of the canvas element to draw on
 * @param {number} centreX X-coordinates of centre point of arc
 * @param {number} centreY Y-coordinates of centre point of arc
 * @param {number} innerRadius Inner radius of arc
 * @param {number} outerRadius Outer radius of arc
 * @param {number} angleStart Starting angle of arc
 * @param {number} angleEnd Final angle of arc
 */
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

/**
 * Render a ring containing the binary message to the given canvas context
 *
 * @param {CanvasRenderingContext2D} ctx Context of the canvas element to draw on
 * @param {number} centreX X-coordinates of centre point of ring
 * @param {number} centreY Y-coordinates of centre point of ring
 * @param {number} innerRadius Inner radius of ring
 * @param {number} outerRadius Outer radius of ring
 * @param {string} binaryMsg Binary message to encode in the ring
 * @param {number} overlapDegrees Amount by which arcs should overlap
 */
function drawBinaryRing(ctx, centreX, centreY, innerRadius, outerRadius,
                        binaryMsg, overlapDegrees) {
  let numOfArcs = binaryMsg.length;
  let arcSize = 360 / numOfArcs;

  for (var i = 0; i < numOfArcs; i += 1) {
    // If char is 1, draw an arc
    if (binaryMsg[i] == 1) {
      drawArc(ctx, centreX, centreY, innerRadius, outerRadius, (Math.PI/180)*arcSize*i, (Math.PI/180)*(arcSize*(i+1)+overlapDegrees));
    }
  }
}

//////////////////////////////////////////////////
// UTILITY FUNCTIONS
//////////////////////////////////////////////////

/**
 * Convert a Latin alphabet letter into its corresponding number in the
 * Latin alphabet order (A, B, C etc)
 *
 * @param {string} letter A 1-char string
 * @return {number} Corresponding number in Latin alphabet order
 */
function letterToNum(letter) {
  // Note: 97 = char code for the lowercase letter 'a'
  return letter.charCodeAt(0) - 97;
}

/**
 * Convert an integer into a binary string
 *
 * @param {number} num A positive integer
 * @return {string} Corresponding number in binary format
 */
function numToBin(num) {
  return num.toString(2);
}

/**
 * Pad a binary string to the given amount of digits
 *
 * @param {string} binStr A string representing a binary number
 * @param {number} numDigits The desired number of digits
 * @return {string} Binary number string with additional padding if required
 */
function padBinaryString(binStr, numDigits) {
  return "0".repeat(numDigits - binStr.length) + binStr;
}

/**
 * Append the given number of chars to the end of a string
 *
 * @param {string} theStr A string representing a binary number
 * @param {string} theChar The char to insert
 * @param {number} numChars The desired number of chars to insert
 * @return {string} Binary number string with appended chars
 */
function appendChars(theStr, theChar, numChars) {
  return theStr + theChar.repeat(numChars);
}

/**
 * Convert the given input string into a binary string
 *
 * @param {string} input The string input to convert
 * @return {string} The resulting binary number string
 */
function convertToBinary(input) {
  return input.split("") // transform input string to character array
              .map(letter => letterToNum(letter) + 1)
              .map(num => numToBin(num))
              .map(binStr => padBinaryString(binStr, 7))
              .map(binStr => appendChars(binStr, '0', 3))
              .slice(0, 8).join(""); // limit to 8 chars and return array as string
}

//////////////////////////////////////////////////
// BINARY CIRCULAR PATTERN GENERATOR SETUP
//////////////////////////////////////////////////

/**
 * Initialise the canvas element
 */
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

/**
 * Render the canvas element
 */
function drawExperiment() {
  var c = document.getElementById("tutorial");
  
  var sizeX = 600;
  var sizeY = 600;
  var time = new Date();
  
  if (c.getContext) {
    var ctx = c.getContext("2d");
    
    ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0, 0, sizeX, sizeY); // clear canvas

    // Sample binary messages
    var binaryMsg = "0100110000" + "0010111000" + "0000111000" + "0011010000"
                  + "0001010000" + "1111111111" + "1111111111" + "1111111000";

    var binaryMsg2 = convertToBinary(patternMessage);
    console.log(binaryMsg2);
        
    // Arcs to represent the pattern
    drawBinaryRing(ctx, 300, 300, 60, 60+60.7, binaryMsg2, 0.3);
    drawBinaryRing(ctx, 300, 300, 120, 120+60.7, binaryMsg, 0.3);
    drawBinaryRing(ctx, 300, 300, 180, 180+60.7, binaryMsg2, 0.3);
    
    // Circle base
    ctx.beginPath();
    ctx.arc(300, 300, 300, 0, Math.PI * 2, false);
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

/**
 * Get all input keypresses
 * 
 * @param {object} e Event data
 * @param {object} context Target element
 */
function receiveKeyup(e, context) {
  console.log("=================");
  patternMessage = context.value.toLowerCase();
  console.log(patternMessage);

  initExperiment();
}

/**
 * Start the canvas rendering
 */
function init() {
  var userMessageElement = document.getElementById("usermessage");
  // Add event listeners to user message textarea
  userMessageElement.addEventListener("keyup", function(event) {
    receiveKeyup(event, this);
  }, true);
  
  initExperiment();
}
