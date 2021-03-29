var debug = true;
var defaultLevel = 0;

/* Levels:
  0 - All
  1 - Only important info
  2 - Warn
  3 - Error
*/
function sendInfo(message, level = null) { send(message, level, 'INFO'); }
function sendWarn(message) { send(message, 2, 'WARNING'); }
function sendErr(message) { send(message, 3, 'ERROR'); process.exit() }

var timers = [];
function time(label) {
  timers.push({ label: label, timestamp: Date.now() })
}

function timeEnd(label) {
  for (i in timers) {
    if (timers[i]['label'] == label) {
      let calc = Date.now() - timers[i]['timestamp'];
      let e = 'ms'
      if (calc > 999) { calc = calc / 1000; e = 's' }

      if (label == null) label = "";
      else label = `${label}: `;

      send(`${label}${calc}${e}`, null, 'TIMER')
      timers.pop(i)
      return;
    }
  }
}

function send(message, level = null, type) {
  if (typeof level != 'number') level = 1;
  if (typeof message != 'string') { console.log(`[ERROR] The message argument has to be type of string`); process.exit(); }

  if (debug) {
    if (defaultLevel <= level) {
      console.log(`[${type}] ${message}`);
    }
  }
}

module.exports = { debug, defaultLevel, sendInfo, sendWarn, sendErr, time, timeEnd }