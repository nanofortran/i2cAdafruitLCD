//Rough first go through  . . .

var LCD = require('./MPC23008.js');
var sleep = require('sleep'); 

var theLCD = new LCD(0x23);
//  theLCD.off();
//  theLCD.on();


  function credits(){
    theLCD.clear();
    theLCD.setLine(1);
    theLCD.type('Jason Geistweidt', 250);
    sleep.sleep(1);
    theLCD.setLine(2);
    theLCD.type('>>>>>i2cLCD<<<<<', 250);
    theLCD.clear();
  }

  function getTime(){
    var d = new Date();
    theLCD.setCursor(1,0);
    theLCD.print('    ' + d.toLocaleTimeString() + '    ');
    theLCD.setCursor(2,0);
    theLCD.center(2, d.getMonth() + '/' + d.getDate() + '/' + d.getFullYear());
  }

  credits();
  var task1 = setInterval(getTime, 1000);
