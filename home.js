/*
NEXT TASKS:
* Expand the Bootstrap form so that it can configure the other rings as well
* Implement Bootstrap validation (so that binary num can't be set below a certain amount for example)
* Add ability to add rings dynamically with size config (must add 2 new parameters to MessageRing: ring width and radius)
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
   * @param {number} numOfDigits The desired number of binary digits for each character
   * @param {number} paddingLen Length of additional padding between encoded characters
   * @param {number} charOffset Amount of chars to shift the ring by
   * @param {number} digitOffset Amount of binary digits to shift the ring by
   */
  constructor(ringMessage, numOfMsgChars, numOfDigits, paddingLen, charOffset, digitOffset) {
    this.ringMessage = ringMessage;
    this.numOfMsgChars = numOfMsgChars;
    this.numOfDigits = numOfDigits;
    this.paddingLen = paddingLen;
    this.charOffset = charOffset;
    this.digitOffset = digitOffset;
    
    this.minNumOfDigits = 0;
    this.numOfArcs = numOfMsgChars * (numOfDigits + paddingLen);
  }
  
  /**
   * Convert the given input string into a binary string
   */
  getBinaryMessage() {
    return convertToBinary(this.ringMessage, this.numOfMsgChars, this.numOfDigits, this.charOffset, this.digitOffset, "0", this.paddingLen, true);
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
var msgRing1 = new MessageRing("dare", 8, 7, 3, 0, 0);
var msgRing2 = new MessageRing("mighty", 8, 7, 3, 4, 0);
var msgRing3 = new MessageRing("things", 8, 7, 3, -2, 0);

// User input fields
var userFormElement = document.getElementById("form1");
var userMessageElement = document.getElementById("ring1-string");
var userNumCharsElement = document.getElementById("ring1-num-of-msg-chars");
var userNumDigitsElement = document.getElementById("ring1-num-of-digits");
var userCharOffsetElement = document.getElementById("ring1-char-offset");
var userDigitOffsetElement = document.getElementById("ring1-digit-offset");
var userPaddingLenElement = document.getElementById("ring1-padding-len");
var userMessageLabel = document.getElementById("ring1-string-label");
var userNumCharsLabel = document.getElementById("ring1-num-of-msg-chars-label");
var userNumDigitsLabel = document.getElementById("ring1-num-of-digits-label");
var userCharOffsetLabel = document.getElementById("ring1-char-offset-label");
var userDigitOffsetLabel = document.getElementById("ring1-digit-offset-label");
var userPaddingLenLabel = document.getElementById("ring1-padding-len-label");

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
 * Shift the given string or array left by the given offset.
 *
 * @param {string} arr The string or array to modify
 * @param {number} offset Offset amount to shift the string
 * @return {string} 
 */
function applyOffset(arr, num) {
  num = num % arr.length;
  return arr.slice(num, arr.length).concat(arr.slice(0, num));
}

/**
 * Convert a Latin alphabet letter into its corresponding number in the
 * Latin alphabet order (A, B, C etc)
 *
 * @param {string} letter A 1-char string
 * @return {number} Corresponding number in Latin alphabet order
 */
function letterToNum(letter) {
  
  // Check if letter is a valid Latin alphabet letter
  const regex = new RegExp('[a-zA-Z]');
  if (regex.test(letter)) {
    // Note: 97 = char code for the lowercase letter 'a'.
    // Add 1 so that 'a' == 1
    return letter.toLowerCase().charCodeAt(0) - 97 + 1;
  }

  // Ignore punctuation and spaces
  return 0;
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
 * @param {number} numDigits The desired number of binary digits
 * @return {string} Binary number string with additional padding if required
 */
function padBinaryString(binStr, numDigits) {
  return "0".repeat(numDigits - binStr.length) + binStr;
}

/**
 * Append the given number of chars to the end of a string
 *
 * @param {string} theStr A string representing a binary number
 * @param {string} paddingChar The padding char to insert
 * @param {number} numPaddingChars The desired number of padding chars to insert
 * @return {string} Binary number string with appended chars
 */
function appendChars(theStr, paddingChar, numPaddingChars) {
  return theStr + paddingChar.repeat(numPaddingChars);
}

/**
 * Get the minimum amount of binary digits required to represent a message string
 * 
 * @param {string} input The string input to examine
 * @return {number} The minimum amount of binary digits required to represent the input string
 */
function findMinBinDigits(input) {
  let min = 0;
  let inputArr = input.split("")
      .map(letter => letterToNum(letter))
      .map(num => numToBin(num));

  for (let i = 0; i < inputArr.length; i++) {
    //console.log("i=" + i + " inputArr[i]=" + inputArr[i] + " min=" + min);
    if (inputArr[i].length > min) {
      min = inputArr[i].length;
    }
  }
  
  return min;
}

/**
 * Convert the given input string into a binary string
 *
 * @param {string} input The string input to convert
 * @param {number} numChars The desired number of chars to be encoded in the string
 * @param {number} numDigits The desired number of binary digits
 * @param {number} charOffset Amount of chars to shift the ring by
 * @param {number} digitOffset Amount of binary digits to shift the ring by
 * @param {string} paddingChar The padding char to insert
 * @param {number} numPaddingChars The desired number of padding chars to insert
 * @param {boolean} isPaddingSetToOne Should padding be encoded as a string of ones?
 * @return {string} The resulting binary number string
 */
function convertToBinary(input, numChars, numDigits, charOffset, digitOffset, paddingChar, numPaddingChars, isPaddingSetToOne) {
  // convertToBinary(input, 8, 7, 0, 0, "0", 3, true)
  
  if (input.length < numChars) {
    input = appendChars(input, " ", numChars);
  }
  
  // Transform the input to an array of binary strings, then process by each element 
  let inputArr = input.slice(0, numChars).split("")
      .map(letter => letterToNum(letter))
      .map(num => numToBin(num))
      .map(binStr => {
        if (isPaddingSetToOne && binStr == "0") {
          return "1".repeat(numDigits);
        }
        return padBinaryString(binStr, numDigits);
      })
      .map((binStr, i) => {
        let isBlank = (binStr == "1".repeat(numDigits));
        let isNotLastChar = i < numChars - 1;
        let actualPaddingChar = (isPaddingSetToOne && isBlank && isNotLastChar)
            ? "1" : paddingChar;
        return appendChars(binStr, actualPaddingChar, numPaddingChars);
      });

  // Shift the array by the given amount of chars before turning it to a string
  let output = applyOffset(inputArr, charOffset).join("");
  return applyOffset(output, digitOffset); // shift array digits
}

/**
 * A series of unit tests to ensure that the above functions work as intended
 */
function runUnitTests() {
  /**
   * Simple assert function
   */
  function assertEquals(msg, actual, expected) {
    if (expected == actual) {
      console.log("✓ " + msg);
    } else {
      console.log("✗ " + msg + " (actual: " + actual + ", expected: " + expected + ")");
    }
  }
  
  

  // Test applyOffset()
  assertEquals("Shift the string 'yep' to the left by 1", applyOffset("yep", 1), "epy");
  assertEquals("Shift the string 'yep' to the right by 1", applyOffset("yep", -1), "pye");
  assertEquals("Shift the string 'yep' to the left by 3 (overflow)", applyOffset("yep", 3), "yep");
  assertEquals("Shift the string 'yep' to the left by 4 (overflow)", applyOffset("yep", 4), "epy");
  assertEquals("Shift the string 'yep' to the right by 3 (overflow)", applyOffset("yep", -3), "yep");
  assertEquals("Shift the string 'yep' to the right by 4 (overflow)", applyOffset("yep", -4), "pye");
  // Test letterToNum()
  assertEquals("Ensure that 'A' is identified as the 1st letter of the alphabet", letterToNum("a"), 1);
  assertEquals("Ensure that 'C' is identified as the 3rd letter of the alphabet", letterToNum("c"), 3);
  // Test numToBin()
  assertEquals("Convert '1' to binary", numToBin(1), "1");
  assertEquals("Convert '3' to binary", numToBin(3), "11");
  // Test padBinaryString()
  assertEquals("Pad '11' to 2 digits", padBinaryString("11", 2), "11");
  assertEquals("Pad '11' to 3 digits", padBinaryString("11", 3), "011");
  // Test appendChars()
  assertEquals("Append '0' 3 times to '011'", appendChars("011", "0", 3), "011000");
  // Test findMinBinDigits()
  assertEquals("Find the minimum amount of binary digits required to represent each letter of the input 'mighty'", findMinBinDigits("mighty"), 5);
  // Test convertToBinary()
  assertEquals("Convert the input 'c' to binary format, including padding", convertToBinary("c", 1, 7, 0, 0, "0", 3, true), "0000011000");
  assertEquals("Convert the input 'mighty' to binary format, including padding", convertToBinary("mighty", 8, 7, 0, 0, "0", 3, true), "00011010000001001000000011100000010000000010100000001100100011111111111111111000");
}

//////////////////////////////////////////////////
// BINARY CIRCULAR PATTERN GENERATOR SETUP
//////////////////////////////////////////////////

/**
 * Initialise the canvas element
 */
function initExperiment() {
  // Update user input fields
  userMessageElement.value = msgRing2.ringMessage;
  userNumCharsElement.value = msgRing2.numOfMsgChars;
  userNumDigitsElement.value = msgRing2.numOfDigits;
  userPaddingLenElement.value = msgRing2.paddingLen;
  userCharOffsetElement.value = msgRing2.charOffset;
  userDigitOffsetElement.value = msgRing2.digitOffset;
  
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
    // var binaryMsg = "0100110000" + "0010111000" + "0000111000" + "0011010000"
    //               + "0001010000" + "1111111111" + "1111111111" + "1111111000";

    var binaryMsg1 = msgRing1.getBinaryMessage();
    console.log(binaryMsg1);
    var binaryMsg2 = msgRing2.getBinaryMessage();
    console.log(binaryMsg2);
    var binaryMsg3 = msgRing3.getBinaryMessage();
    console.log(binaryMsg3);
        
    // Arcs to represent the pattern
    drawBinaryRing(ctx, 300, 300, 60, 60+60.7, binaryMsg1, 0.3);
    drawBinaryRing(ctx, 300, 300, 120, 120+60.7, binaryMsg2, 0.3);
    drawBinaryRing(ctx, 300, 300, 180, 180+60.7, binaryMsg3, 0.3);
    
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
 * Update the minimum number of digits of a MessageRing, based on the current message string.
 * 
 * @param {MessageRing} msgRing The MessageRing to update
 * @param {HTMLElement} numDigitsLabel HTML label for num of digits
 * @param {HTMLElement} numDigitsElement HTML input for num of digits
 */
function updateMinNumOfDigits(msgRing, numDigitsLabel, numDigitsElement) {
  msgRing.minNumOfDigits = findMinBinDigits(msgRing.ringMessage);

  // Update the label string
  numDigitsLabel.textContent = "Number of binary digits per char (minimum " + msgRing.minNumOfDigits + ")";
  numDigitsElement.min = msgRing.minNumOfDigits;

  // If the set number of digits is less than the required number of digits,
  // update this value
  if (numDigitsElement.value < msgRing2.minNumOfDigits) {
    numDigitsElement.value = msgRing2.minNumOfDigits;
    msgRing2.numOfDigits = msgRing2.minNumOfDigits;
  }

  console.log(msgRing2);
}

/**
 * Get all input keypresses
 * 
 * @param {object} e Event data
 * @param {object} context Target element
 */
function receiveKeyup(e, context) {
  console.log("=================");
  msgRing2.ringMessage = context.value.toLowerCase();

  updateMinNumOfDigits(msgRing2, userNumDigitsLabel, userNumDigitsElement);

  // Experiment with direct HTML manipulation to insert new forms for each ring (in the future)
  let ringNum = 5;
  let navTabsElement = document.getElementById("myTab");
  let tabContentsElement = document.getElementById("myTabContent");
  let navTabTemplate = `
  <li class="nav-item" role="presentation">
  <button class="nav-link" id="ring${ringNum}-tab" data-bs-toggle="tab" data-bs-target="#ring${ringNum}" type="button" role="tab" aria-controls="ring${ringNum}" aria-selected="false">Ring ${ringNum}</button>
  </li>`;
  let tabContentTemplate = `
  <div class="tab-pane fade" id="ring${ringNum}" role="tabpanel" aria-labelledby="ring${ringNum}-tab">
    <div class="row g-3">
      <div class="col-md-12 col-lg-12">
        <h4 class="mb-3">Ring ${ringNum} configuration</h4>
        <form class="needs-validation was-validated" id="form1" novalidate>
          <div class="row g-3">
            
            <div class="col-12">
              <label for="ring${ringNum}-string" class="form-label" id="ring${ringNum}-string-label">Ring message</label>
              <input type="text" class="form-control" id="ring${ringNum}-string" placeholder="" required>
              <div class="invalid-feedback">
                Ring message is required.
              </div>
            </div>

            <div class="col-sm-6">
              <label for="ring${ringNum}-num-of-msg-chars" class="form-label" id="ring${ringNum}-num-of-msg-chars-label">Message length (number of characters)</label>
              <input type="number" class="form-control" id="ring${ringNum}-num-of-msg-chars" placeholder="" value="" min="0" required>
              <div class="invalid-feedback">
                Message length cannot be excluded.
              </div>
            </div>

            <div class="col-sm-6">
              <label for="ring${ringNum}-num-of-digits" class="form-label" id="ring${ringNum}-num-of-digits-label">Number of binary digits per char</label>
              <input type="number" class="form-control" id="ring${ringNum}-num-of-digits" placeholder="" value="" min="0" required>
              <div class="invalid-feedback">
                Number of binary digits cannot be excluded.
              </div>
            </div>

            <div class="col-sm-4">
              <label for="ring${ringNum}-char-offset" class="form-label" id="ring${ringNum}-char-offset-label">Character offset</label>
              <input type="number" class="form-control" id="ring${ringNum}-char-offset" placeholder="" value="">
            </div>

            <div class="col-sm-4">
              <label for="ring${ringNum}-digit-offset" class="form-label" id="ring${ringNum}-digit-offset-label">Binary digit offset</label>
              <input type="number" class="form-control" id="ring${ringNum}-digit-offset" placeholder="" value="">
            </div>

            <div class="col-sm-4">
              <label for="ring${ringNum}-padding-len" class="form-label" id="ring${ringNum}-padding-len-label">Padding length</label>
              <input type="number" class="form-control" id="ring${ringNum}-padding-len" placeholder="" value="" min="0">
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
  `;

  navTabsElement.insertAdjacentHTML("beforeend", navTabTemplate);
  tabContentsElement.insertAdjacentHTML("beforeend", tabContentTemplate);


  initExperiment();
}

/**
 * Get all input keypresses
 * 
 * @param {object} e Event data
 * @param {object} context Target element
 * @return {string} The input value from the given context
 */
function receiveInput(e, context) {
  console.log(context.min);
  console.log(context.max);
  return context.value;
}

/**
 * Start the canvas rendering
 */
function init() {
  // Disable page refreshing on form submission
  userFormElement.addEventListener("submit", function(event) {
    event.preventDefault();
  });

  // Add event listeners to user input fields
  userMessageElement.addEventListener("keyup", function(event) {
    receiveKeyup(event, this);
  }, true);
  userNumCharsElement.addEventListener("input", function(event) {
    msgRing2.numOfMsgChars = receiveInput(event, this);
    initExperiment();
  }, true);
  userNumDigitsElement.addEventListener("input", function(event) {
    msgRing2.numOfDigits = receiveInput(event, this);
    initExperiment();
  }, true);
  userPaddingLenElement.addEventListener("input", function(event) {
    msgRing2.paddingLen = receiveInput(event, this);
    initExperiment();
  }, true);
  userCharOffsetElement.addEventListener("input", function(event) {
    msgRing2.charOffset = receiveInput(event, this);
    initExperiment();
  }, true);
  userDigitOffsetElement.addEventListener("input", function(event) {
    msgRing2.digitOffset = receiveInput(event, this);
    initExperiment();
  }, true);
  
  runUnitTests();
  initExperiment();
}
