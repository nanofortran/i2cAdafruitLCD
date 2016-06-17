//Rough first go through  . . .

var LCD = require('./MPC23008.js');
var sleep = require('sleep');

var theLCD = new LCD(0x23);
//  theLCD.off();
//  theLCD.on();

//Note: the timing cues (sleep.sleep()) will be incorporated into the Object eventually
//so user does not need to deal with coding the timeouts.

  function credits(){
    theLCD.clear();
    theLCD.lineSet(1);
    theLCD.type('Jason Geistweidt', 250);
    sleep.sleep(1);
    theLCD.lineSet(2);
    theLCD.type('>>>>>i2cLCD<<<<<', 250);
    theLCD.clear();
  }

  function getTime(){
    var d = new Date();
    theLCD.cursorSet(1,0);
    theLCD.print('    ' + d.toLocaleTimeString() + '    ');
    theLCD.cursorSet(2,0);
    theLCD.center(2, d.getMonth() + '/' + d.getDate() + '/' + d.getFullYear());
  }

  credits();
  var task1 = setInterval(getTime, 1000);
