# i2cAdafruitLCD

This code uses the Johnny-Five library/module to control the MCP23008 expander board found on the Adafruit I2C LCD backpack (Product No. 292) cited here: https://www.adafruit.com/products/292, and thus control the Hitachi HD44780 LCD controller. It is based upon earlier Arduino libraries from LadyAda and others,but is mainly grounded in the inspired work of Donald Weimann, whose seminal monograph on the instricacies of the HD44780 can be found here: http://web.alfredstate.edu/weimandn/  Portions of Weiman's naming schemes, diagrams, and annotations have been retained for pedagogical purposes.

## Dependencies
Node.js 6.x (testing currently in progress on 6.2.2)
johnny-five 0.9+ JavaScript Robotics and Testing Framework
raspi-io 6.x Firmata-compatible Raspberry Pi I/O API
sleep 3.x "sleep" and "usleep" functionality for node.js

The MCP23008 pin out and datasheet:
<https://cdn-shop.adafruit.com/datasheets/MCP23008.pdf>

The HD44780 pin out and datasheet:
https://cdn-shop.adafruit.com/datasheets/HD44780.pdf

The four data lines and two control lines as designed by Adafruit connect pins GP1, GP2, GP2, GP4, GP5, and GP6 to the HD44780 controller pins RE, E, D4, D5, D6, and D7, respectively.

The connections to the I2C backpack might vary according to your RasPi model, for the Model B, SDA/GPIO3 connects to DATA, SCL/GPIO5 to CLOCK, 5Volts to +5v, and GND to GND.
 
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

The code to implement turning on and off of the backlight has not been included in this version, but may be added at a later time.               

##Include
var LCD = require('./MPC23008.js');

##Constructor
var theLCD = new LCD(0x23); //one argument, the address of the MPC23008 you are addressing in hex

##Functions

###.print(string)
//print string . . . string begins printing at cursor placement

###.clear()
//clear the LCD

###.home()       
//return cursor to home, (first line, first character space) without clearing the screen

###.lineSet(line)    
//set line (row), defaults to character space 0

###.cursorSet(line, space)  
//set cursor to a specific line and space

###.center(line, string)
//center the string on the line indicated (best fit, odd length strings will be shifted right one space)

###.on()
//turn LCD on

###.off()
//turn LCD off







