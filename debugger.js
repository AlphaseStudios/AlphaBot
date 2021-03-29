const fs = require('fs').promises;

var logPath = 'logs/';
var debug = true;
var defaultLevel = 1;

/* Levels:
 -1 - All (literally)
  0 - Default level
  1 - Only important info
  2 - Warn
  3 - Error
*/
function sendInfo(message, level = null) { send(message, level, 'INFO', '\u001b[33m'); }
function sendWarn(message) { send(message, 2, 'WARNING', '\u001b[38;5;166m'); }
function sendErr(message, err, exit = false) {
  let ts = Date.now();
  postLog(err, ts).then(() => {
    exit ? process.exit() : null;
  });
  send(`${message} A complete log of this run can be found here: logs/log_${ts}.txt`, 3, 'ERROR', '\u001b[31;1m');
}

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

      send(`${label}${calc}${e}`, null, 'TIMER', '\u001b[36;1m')
      timers.pop(i)
      return;
    }
  }

  send('No timer found.', null, 'TIMER', '\u001b[36;1m')
}

var logs = [];
function send(message, level = null, type, color) {
  if (typeof level != 'number') level = 1;
  try {
    message = message.toString();
  } catch (err) {
    ts = Date.now();
    console.log(`[ERROR] Debugger failed at converting the message argument of type '${typeof message}' to type 'string'. A complete log can be found here: 'logs/log_${ts}.txt'`);
    postLog(err.stack, ts).then(() => {
      process.exit();
    });
    return;
  }

  if (debug) {
    if (defaultLevel <= level) {
      console.log(`${color}[${type}] ${message}\u001b[0m`);
      logs.push(`[${type}] ${message}`);
    }
  }
}

function collectLog() {
  let log = '';
  for (item of logs) {
    log += `${item}\n`;
  }
  return log;
}

async function postLog(log, ts = null) {
  if (typeof ts != 'number') ts = Date.now();
  try { log = log.toString(); }
  catch (err) { console.log(`[ERROR] Debugger failed at converting the data argument of type '${typeof message}' to type 'string'.`); return; }

  let date = new Date(ts);
  let formatDate = `${date.getMonth()}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  log = `${formatDate}\n---------------- LOG ----------------\n${collectLog()}---------------- ERROR ----------------\n${log == '0' ? 'No traceback parsed.' : log}`;

  return fs.writeFile(`${logPath}log_${ts}.txt`, log);
}

module.exports = { debug, defaultLevel, sendInfo, sendWarn, sendErr, time, timeEnd, postLog };