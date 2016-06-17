/*
This code uses the Johnny-Five library/module to control the MCP23008
expander board found on the Adafruit I2C LCD backpack (Product No. 292)
cited here: https://www.adafruit.com/products/292, and thus control
the Hitachi HD44780 LCD conroller.

The work is based upon earlier Arduino libraries from LadyAda and others,
but is mainly grounded in the inspired work of Donald Weimann, whose
seminal monograph on the instracacies of the HD44780 can be found
here: http://web.alfredstate.edu/weimandn/  It is _truly_ worth a read.
Portions of Weiman's naming schemes, diagrams, and annotations have been 
retained for pedagogical purposes.

Thank you Mr. Weiman and LadyAda for contributing to the commons!

Copyleft (C) 2016 Jason E Geistweidt <jason(at)geistweidt(dot)com>
 after
Copyright (C) 2013 Donald Weiman    <weimandn(at)alfredstate(dot)edu>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

Acquire your own personal copy of the GNU General Public License at
<http://www.gnu.org/licenses/>.

/******************************* Program Notes ******************************
 
This program uses an 4-bit data interface but does not use the busy flag to 
determine when the LCD controller is ready.  The LCD RW line (pin 5) is not 
connected to the uProcessor and it must be connected to GND for the program 
to function. NOTE: Adafruit's I2C LCD Backpack complies by having this pin 
grounded by default.

NOTE: In 4-bit mode, data is send as two 4-bit nibbles in succession.
 
All time delays are longer than those specified in most datasheets in order to 
accommodate slower than normal LCD modules.  This requirement is well documented 
but almost always ignored.  The information is in a note at the bottom of the right 
hand (Execution Time) column of the instruction set.
 
************************** MCP23008 & RASPI *****************************
The MCP23008 pin out and datasheet:
<https://cdn-shop.adafruit.com/datasheets/MCP23008.pdf>

The HD44780 pin out and datasheet:
https://cdn-shop.adafruit.com/datasheets/HD44780.pdf

The four data lines and two control lines as designed by Adafruit connect pins
GP1, GP2, GP2, GP4, GP5, and GP6 to the HD44780 controller pins RE, E, D4, D5, 
D6, and D7, respectively.

The connections to the I2C backpack might vary according to your RasPi model, 
for the Model B, SDA/GPIO3 connects to DATA, SCL/GPIO5 to CLOCK, 5Volts to +5v, 
and GND to GND.
 
                 -----------                   ----------
                |  RASPI 2  |                 |   I2C    |
                |  Model B  |                 | Backpack |
                |           |                 |          |
                |        SDA|GPIO3 ---------->|DATA      |
                |        SCL|GPIO5 ---------->|CLOCK     |
                |        PD5|5Volts --------->|+5V       |
                |        GND|GND ------------>|GND       |
                |           |                 |          |
                |           |                 |          |
                |           |                 |          |
                |           |                 |          |
                |___________|                 |__________|

The code to implement turning on and off of the backlight has not been included
in this version, but may be added at a later time.                 
 
**************************************************************************/

//Includes
var five = require('johnny-five'); //johnny-five library to control MCP23008
var raspi = require('raspi-io'); //io function for raspi GPIO
var sleep = require('sleep'); //delay function

//Configure Johnny-Five to work with raspi virtual board
var board = new five.Board({
  io: new raspi()
});

var LCD = function (address){
  this.address = address;
  this.expander = this.getLCD();

  //Set all pins on the MCP23008 to OUTPUT mode
    for(var i = 0; i < 8; i++){
     this.expander.pinMode(i, this.expander.MODES.OUTPUT);
    }

  sleep.usleep(100000);               		  //initial delay, 100000 useconds is 100 ms
  this.expander.digitalWrite(LCD.RS, 0);  	//write RS LOW
  this.expander.digitalWrite(LCD.E, 0);   	//write E LOW
  this.lcdWrite(LCD.lcdFunctionReset);    	//send lcdFunctionReset Byte
  sleep.usleep(100000);               		  //wait
  this.lcdWrite(LCD.lcdFunctionReset);    	//send lcdFunctionReset Byte
  sleep.usleep(200);                  		  //wait
  this.lcdWrite(LCD.lcdFunctionReset);    	//send lcdFunctionReset Byte
  sleep.usleep(200);                  		  //wait

  this.lcdWrite(LCD.lcdFunctionSet4Bit); 	  //Preliminary function set to go 4-bit
  sleep.usleep(80);
  this.lcdWriteInstructions(LCD.lcdFunctionSet4Bit); 	//'True' function set
  sleep.usleep(80);

  this.lcdWriteInstructions(LCD.lcdDisplayOff);	//turn lcd display OFF
  sleep.usleep(80);
  this.lcdWriteInstructions(LCD.lcdClear);	    //clear the lcd (buffer or screen ?)
  sleep.usleep(4);
  this.lcdWriteInstructions(LCD.lcdEntryMode);	//entry mode advanced cursor with each new character
  sleep.usleep(80);
  this.lcdWriteInstructions(LCD.lcdDisplayOn);	//turn lcd display ON
  sleep.usleep(80);

  console.log('Board at address ' + this.address + ' initialized!'); //give the user some feedback
  return this;
}

//Declare control pins (which MCP23008 pin is connected to the LCD module)
LCD.RS = 0x01;
LCD.E = 0x02;

//Declare data pins
LCD.D4 = 0x03;
LCD.D5 = 0x04;
LCD.D6 = 0x05;
LCD.D7 = 0x06;

//LCD module information
LCD.lcdLineOne = 0x00;
LCD.lcdLineTwo = 0x40;

//LCD Instructions (1 byte instructions, only the upper nibble is read in the 4bit system)
LCD.lcdClear = 0b00000001;              // replace all characters with ASCII 'space'
LCD.lcdHome =  0b00000010;              // return cursor to first position on first line
LCD.lcdEntryMode = 0b00000110;          // shift cursor from left to right on read/write
LCD.lcdDisplayOff =  0b00001000;        // turn display off
LCD.lcdDisplayOn = 0b00001100;          // display on, cursor off, don't blink character
LCD.lcdFunctionReset = 0b00110000       // reset the LCD
LCD.lcdFunctionSet4Bit = 0b00101000;    // 4-bit data, 2-line display, 5 x 7 font
LCD.lcdSetCursor =  0b10000000;         // set cursor position
//LCD.lcdTest = 0b10010110;             // dummy byte for testing

//getLCD
LCD.prototype.getLCD = function(){
  var expander = new five.Expander({
    controller: "MCP23008",             //specific to this expander IC
    address: this.address
  });
  return expander;
}

//lcdWrite
LCD.prototype.lcdWrite = function(theByte){
  this.expander.digitalWrite(LCD.D7, 0);                         //set pin to LOW
  if(theByte & 1<<7){this.expander.digitalWrite(LCD.D7, 1)};     //change pin if bit is HIGH
  this.expander.digitalWrite(LCD.D6, 0);                         //and the same for remaining pins
  if(theByte & 1<<6){this.expander.digitalWrite(LCD.D6, 1)};
  this.expander.digitalWrite(LCD.D5, 0);
  if(theByte & 1<<5){this.expander.digitalWrite(LCD.D5, 1)};
  this.expander.digitalWrite(LCD.D4, 0);
  if(theByte & 1<<4){this.expander.digitalWrite(LCD.D4, 1)};
  //write the data nibble by setting E HIGH and then pulling it LOW
  this.expander.digitalWrite(LCD.E, 1); //HIGH
  sleep.usleep(1);
  this.expander.digitalWrite(LCD.E, 0); //LOW
  sleep.usleep(1);
}

//lcdWriteInstructions
LCD.prototype.lcdWriteInstructions = function(theInstructions){
  this.expander.digitalWrite(LCD.RS, 0);  //set RS (register) LOW (command mode)
  this.expander.digitalWrite(LCD.E, 0);   //set E low (encode command)
  this.lcdWrite(theInstructions);         //send first nibble
  this.lcdWrite(theInstructions << 4);    //send second nibble
}

//lcdWriteCharacter
LCD.prototype.lcdWriteCharacter = function(theData){
  this.expander.digitalWrite(LCD.RS, 1);  //set RS to HIGH (character mode)
  this.expander.digitalWrite(LCD.E, 0);
  this.lcdWrite(theData);
  this.lcdWrite(theData << 4);
}

//print(string)
LCD.prototype.print = function(theString){
  for(var i = 0; i < theString.length; i++){
    this.lcdWriteCharacter(theString.charCodeAt(i));
    sleep.usleep(80);
  }
  theString = ' ';
}

//clear() and return cursor to HOME (0,0)
LCD.prototype.clear = function(){
 this.lcdWriteInstructions(LCD.lcdClear);
 sleep.usleep(10);
}

//home() - return LCD to home (without clearing)
LCD.prototype.home = function(){
this.lcdWriteInstructions(LCD.lcdHome);
sleep.usleep(10); 
}

//lineSet(line) - set the cursor to a specific line, at character place 0
LCD.prototype.lineSet = function(line){
  if(line && line  == 1){
    this.lcdWriteInstructions(LCD.lcdSetCursor | LCD.lcdLineOne);
  }
  if(line && line == 2){
    this.lcdWriteInstructions(LCD.lcdSetCursor | LCD.lcdLineTwo);
  }
}

//cursorSet(line, space) - set cursor to line and space of your choosing
LCD.prototype.cursorSet = function(line, space){
  if(line && line == 1){
    this.lcdWriteInstructions(LCD.lcdSetCursor | LCD.lcdLineOne + space);
  }
  if(line && line == 2){
    this.lcdWriteInstructions(LCD.lcdSetCursor | LCD.lcdLineTwo + space);
  }
}

//center(line, theString) - center text on line of your choosing
LCD.prototype.center = function(line, theString){
  var l = theString.length;
  this.cursorSet(line, l/2);
  this.print(theString);  
}

//flyIn() - flyIn (from right) theString on line with a delay in ms of the shift/flying
LCD.prototype.flyIn = function(theString, line, delay){
  
  for(var i = 16; i > -1; i--){
    this.cursorSet(line, i);
    this.print(theString);
    sleep.usleep(delay * 1000);
  }
}

//type(theString, delay) - mimicking a typewriter effect
LCD.prototype.type = function(theString, delay){
  for(var i = 0; i < theString.length; i++){
    this.lcdWriteCharacter(theString.charCodeAt(i));
    sleep.usleep(delay * 1000);
  }
  theString = ' ';
}

//not sure the following are implemented correctly . . . missing RS and second nibble . . .

//off() - turn LCD off
LCD.prototype.off = function(){
  this.lcdWriteInsructions(LCD.lcdDisplayOff);
}

//on() - turn LCD on
LCD.prototype.on = function(){
  this.lcdWriteInsructions(LCD.lcdDisplayOn);
}

module.exports = LCD;




