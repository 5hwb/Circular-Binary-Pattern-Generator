/*
NEXT TASKS:
* Add ability to add rings dynamically
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
   * Create an 'empty' MessageRing instance.
   * 
   * @return A new MessageRing instance
   */
  static createEmptyInstance() {
    return new MessageRing("", 1, 5, 2, 0, 0);
  }
  
  /**
   * Convert the given input string into a binary string
   * 
   * @return The binary string representation of this MessageRing
   */
  getBinaryMessage() {
    return convertToBinary(this.ringMessage, this.numOfMsgChars, this.numOfDigits, this.charOffset, this.digitOffset, "0", this.paddingLen, true);
  }
}

//////////////////////////////////////////////////
// BOOLEAN FLAGS
//////////////////////////////////////////////////

// True: Alphabet mode - each letter is encoded according to its order (A = 1, B = 2 etc)
// False: ASCII/Unicode mode - each letter is encoded with its Unicode number
let isLatinAlphabetMode = true;

// True: Message is spread across more than 1 ring automatically
// False: Message is manually defined for each ring
let isSpreadAcrossRings = false;

//////////////////////////////////////////////////
// PATTERN GENERATOR PARAMETERS
//////////////////////////////////////////////////

// Canvas dimensions
let sizeX = 600;
let sizeY = 600;

// Number of MessageRings to display
let numOfMsgRings = 3;

// List of MessageRing instances
let msgRings = [
  new MessageRing("dare", 8, 7, 3, 0, 0),
  new MessageRing("mighty", 8, 7, 3, 4, 0),
  new MessageRing("things", 8, 7, 3, -2, 0)
];

// Overlap parameters (to minimise artifacts)
let arcOverlap = 0.3;
let ringOverlap = 0.7;

// Pattern radius percentages
let innerPatternRadius = 75;
let outerPatternRadius = 300;

// Pattern colour
let patternColour = "#ffffff";

// Background colour
let backgroundColour = "#000000";

//////////////////////////////////////////////////
// OTHER IMPORTANT VARIABLES
//////////////////////////////////////////////////

// Keycode for the 'Enter' key
const KEY_ENTER = 13; 

// Gap between grid lines
const gridGap = 50;

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
  for (let i = 0; i < sizeX; i += 10) {
    ctx.strokeStyle = 'rgb(0, 0, 0)';
    let isMajorInterval = i % gridGap == 0;
    let lineSize = (isMajorInterval) ? 10 : 5;

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
  for (let j = 0; j < sizeY; j += 10) {
    ctx.strokeStyle = 'rgb(0, 0, 0)';
    let isMajorInterval = j % gridGap == 0;
    let lineSize = (isMajorInterval) ? 10 : 5;

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
 * @param {string} fillColour Fill colour of arc
 */
function drawArc(ctx, centreX, centreY, innerRadius, outerRadius, angleStart, angleEnd, fillColour) {
  ctx.beginPath();
  // Draw an arc clockwise.
  // Formula is (Math.PI/180)*deg where 'deg' is the angle in degrees.
  ctx.arc(centreX, centreY, outerRadius, angleStart, angleEnd, false);
  // Draw the other arc counterclockwise
  ctx.arc(centreX, centreY, innerRadius, angleEnd, angleStart, true);
  ctx.fillStyle = fillColour;
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

  for (let i = 0; i < numOfArcs; i += 1) {
    // If char is 1, draw an arc
    if (binaryMsg[i] == 1) {
      drawArc(ctx, centreX, centreY, innerRadius, outerRadius, (Math.PI/180)*arcSize*i, (Math.PI/180)*(arcSize*(i+1)+overlapDegrees), patternColour);
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
// HTML TEMPLATE RENDERING AND EVENT LISTENER FUNCTIONS
//////////////////////////////////////////////////

/**
 * Generate the nav tab HTML elements for the MessageRing form with the given number ID 
 * 
 * @param {number} ringNum Number of the MessageRing
 * @return {string} Fully-formed nav tab HTML string
 */
function getNavTabTemplate(ringNum) {
  // Set the 1st element as active
  let showActive = (ringNum == 0) ? "active" : "";
  return `
  <li class="nav-item" role="presentation">
  <button class="nav-link ${showActive}" id="ring${ringNum}-tab" data-bs-toggle="tab" data-bs-target="#ring${ringNum}" type="button" role="tab" aria-controls="ring${ringNum}" aria-selected="false">Ring ${ringNum}</button>
  </li>`;
}

/**
 * Generate the tab content HTML elements for the MessageRing form with the given number ID 
 * 
 * @param {number} ringNum Number of the MessageRing
 * @return {string} Fully-formed tab content string
 */
function getTabContentTemplate(ringNum) {
  // Set the 1st element as active
  let showActive = (ringNum == 0) ? "show active" : "";
  return `
  <div class="tab-pane fade ${showActive}" id="ring${ringNum}" role="tabpanel" aria-labelledby="ring${ringNum}-tab">
    <div class="row g-3">
      <div class="col-md-12 col-lg-12">
        <h4 class="mb-3">Ring ${ringNum} configuration</h4>
        <form class="needs-validation was-validated" id="ring${ringNum}" novalidate>
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
}

/**
 * Add event listeners to the elements of the MessageRing form with the given number.
 * 
 * @param {number} ringNum Number of the MessageRing
 */
function addRingFormEventListeners(ringNum) {
  // Get the user input fields
  let userFormElement = document.getElementById(`ring${ringNum}`);
  let userMessageElement = document.getElementById(`ring${ringNum}-string`);
  let userNumCharsElement = document.getElementById(`ring${ringNum}-num-of-msg-chars`);
  let userNumDigitsElement = document.getElementById(`ring${ringNum}-num-of-digits`);
  let userCharOffsetElement = document.getElementById(`ring${ringNum}-char-offset`);
  let userDigitOffsetElement = document.getElementById(`ring${ringNum}-digit-offset`);
  let userPaddingLenElement = document.getElementById(`ring${ringNum}-padding-len`);
  let userMessageLabel = document.getElementById(`ring${ringNum}-string-label`);
  let userNumCharsLabel = document.getElementById(`ring${ringNum}-num-of-msg-chars-label`);
  let userNumDigitsLabel = document.getElementById(`ring${ringNum}-num-of-digits-label`);
  let userCharOffsetLabel = document.getElementById(`ring${ringNum}-char-offset-label`);
  let userDigitOffsetLabel = document.getElementById(`ring${ringNum}-digit-offset-label`);
  let userPaddingLenLabel = document.getElementById(`ring${ringNum}-padding-len-label`);

  // Add event listeners to user input fields
  userFormElement.addEventListener("submit", function(event) {
    // Disable page refreshing on form submission
    event.preventDefault();
  });
  userMessageElement.addEventListener("keyup", function(event) {
    receiveKeyup(event, this, msgRings[ringNum], userNumDigitsLabel, userNumDigitsElement);
  }, true);
  userNumCharsElement.addEventListener("input", function(event) {
    msgRings[ringNum].numOfMsgChars = receiveInput(event, this);
    initExperiment();
  }, true);
  userNumDigitsElement.addEventListener("input", function(event) {
    msgRings[ringNum].numOfDigits = receiveInput(event, this);
    initExperiment();
  }, true);
  userPaddingLenElement.addEventListener("input", function(event) {
    msgRings[ringNum].paddingLen = receiveInput(event, this);
    initExperiment();
  }, true);
  userCharOffsetElement.addEventListener("input", function(event) {
    msgRings[ringNum].charOffset = receiveInput(event, this);
    initExperiment();
  }, true);
  userDigitOffsetElement.addEventListener("input", function(event) {
    msgRings[ringNum].digitOffset = receiveInput(event, this);
    initExperiment();
  }, true);

  // Update user input fields
  userMessageElement.value = msgRings[ringNum].ringMessage;
  userNumCharsElement.value = msgRings[ringNum].numOfMsgChars;
  userNumDigitsElement.value = msgRings[ringNum].numOfDigits;
  userPaddingLenElement.value = msgRings[ringNum].paddingLen;
  userCharOffsetElement.value = msgRings[ringNum].charOffset;
  userDigitOffsetElement.value = msgRings[ringNum].digitOffset;
}

/**
 * Generate forms dynamically from an array of MessageRing instances
 * 
 * @param {MessageRing[]} msgRings Array of MessageRing instances
 */
function generateForms(msgRings) {
  for (let i = 0; i < msgRings.length; i++) {
    let ringNum = i;
    
    // Get tab elements
    let navTabsElement = document.getElementById("myTab");
    let tabContentsElement = document.getElementById("myTabContent");

    // Fill in the templates
    let navTabTemplate = getNavTabTemplate(ringNum);
    let tabContentTemplate = getTabContentTemplate(ringNum);

    // Insert completed templates to the tab elements
    navTabsElement.insertAdjacentHTML("beforeend", navTabTemplate);
    tabContentsElement.insertAdjacentHTML("beforeend", tabContentTemplate);

    addRingFormEventListeners(ringNum);
  }

}

/**
 * Add event listeners for the main form.
 */
function addMainFormEventListeners() {
  // Get the user input fields
  let userNumOfRingsElement = document.getElementById(`patgen-num-of-rings`);
  let userInnerRadiusElement = document.getElementById(`patgen-inner-radius`);
  let userOuterRadiusElement = document.getElementById(`patgen-outer-radius`);
  let userPatternColourElement = document.getElementById(`patgen-pattern-colour`);
  let userBackgroundColourElement = document.getElementById(`patgen-background-colour`);

  // Add event listeners to user input fields
  userNumOfRingsElement.addEventListener("input", function(event) {
    numOfMsgRings = parseInt(receiveInput(event, this));
    initExperiment();
  }, true);
  userInnerRadiusElement.addEventListener("input", function(event) {
    innerPatternRadius = parseInt(receiveInput(event, this));
    console.log("innerPatternRadius = " + innerPatternRadius);
    initExperiment();
  }, true);
  userOuterRadiusElement.addEventListener("input", function(event) {
    outerPatternRadius = parseInt(receiveInput(event, this));
    console.log("outerPatternRadius = " + outerPatternRadius);
    initExperiment();
  }, true);
  userPatternColourElement.addEventListener("input", function(event) {
    patternColour = receiveInput(event, this);
    initExperiment();
  }, true);
  userBackgroundColourElement.addEventListener("input", function(event) {
    backgroundColour = receiveInput(event, this);
    initExperiment();
  }, true);

  // Update user input fields
  userNumOfRingsElement.value = parseInt(numOfMsgRings);
  userInnerRadiusElement.value = parseInt(innerPatternRadius);
  userOuterRadiusElement.value = parseInt(outerPatternRadius);
  userPatternColourElement.value = patternColour;
  userBackgroundColourElement.value = backgroundColour;

  // Update ranges
  userInnerRadiusElement.max = sizeX / 2;
  userOuterRadiusElement.max = sizeX / 2;
}

//////////////////////////////////////////////////
// CIRCULAR BINARY PATTERN GENERATOR SETUP
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
  let c = document.getElementById("tutorial");
  
  if (c.getContext) {
    let ctx = c.getContext("2d");
    
    ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0, 0, sizeX, sizeY); // clear canvas

    // Circle pattern dimensions
    let patternRadius = sizeX / 2;
    let patternWidth = outerPatternRadius - innerPatternRadius;

    // Render the message rings to form the pattern
    msgRings.forEach(function(msgRing, i) {
      let binaryMsg = msgRing.getBinaryMessage();
      //console.log(binaryMsg);

      let actualRingOverlap = (i == msgRings.length - 1) ? 0 : ringOverlap;
  
      drawBinaryRing(ctx, patternRadius, patternRadius, 
          innerPatternRadius + (patternWidth*i / numOfMsgRings), 
          innerPatternRadius + (patternWidth*(i+1) / numOfMsgRings) + actualRingOverlap, 
          binaryMsg, arcOverlap);
    });
    
    // Render the base
    ctx.beginPath();
    ctx.arc(sizeX / 2, sizeY / 2, patternRadius, 0, Math.PI * 2, false);
    ctx.fillStyle = backgroundColour;
    ctx.fill();
    
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
  if (numDigitsElement.value < msgRing.minNumOfDigits) {
    numDigitsElement.value = msgRing.minNumOfDigits;
    msgRing.numOfDigits = msgRing.minNumOfDigits;
  }

  console.log(msgRing);
}

/**
 * Set the ring message value from the input field.
 * (TODO: merge this with receiveInput()?)
 * 
 * @param {KeyboardEvent} e Event data
 * @param {HTMLElement} context Target element
 * @param {MessageRing} msgRing The MessageRing to update
 * @param {HTMLElement} numDigitsLabel HTML label for num of digits
 * @param {HTMLElement} numDigitsElement HTML input for num of digits
 */
function receiveKeyup(e, context, msgRing, numDigitsLabel, numDigitsElement) {
  console.log("=================");
  msgRing.ringMessage = context.value.toLowerCase();

  updateMinNumOfDigits(msgRing, numDigitsLabel, numDigitsElement);
  initExperiment();
}

/**
 * Get the value from the input field
 * 
 * @param {Event} e Event data
 * @param {HTMLElement} context Target element
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
  generateForms(msgRings);
  addMainFormEventListeners();
  runUnitTests();
  initExperiment();
}
