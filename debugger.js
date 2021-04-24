const fsp = require("fs").promises;
const fs = require("fs");
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

var logPath = "./logs/";
var debug = true;
var defaultLevel = 0;

/* Levels:
 -1 - All (literally)
  0 - Default level
  1 - Only important info
  2 - Warn
  3 - Error
*/
function setLevel(level) {
  if (typeof level != "number") {
    debug.sendWarn(`Level has to be type of 'number' not '${typeof level}'!`);
    return;
  }

  defaultLevel = level;
}
/** Send a info to stdout. */
function sendInfo(message, level = 0) {
  send(message, level, "INFO", "\u001b[33;1m");
}

/** Send a warn to stdout. */
function sendWarn(message) {
  send(message, 2, "WARNING", "\u001b[38;5;166m");
}

/** Send an error to stdout. */
function sendErr(message, err, exit = false, post = true) {
  if (err.stack != null) err = err.stack;

  let type = exit ? "FATAL" : "ERROR";
  let ts = Date.now();
  send(
    `${message} A complete log of this run can be found here: logs/log_${ts}.txt`,
    3,
    type,
    "\u001b[31;1m"
  );
  try {
    if (post) send(`Stack: ${err}`, 3, type, "\u001b[31;1m");
  } catch {
    console.log("Couldn't post err.stack");
  }

  postLog(err, ts)
    .then(() => {
      exit ? process.exit() : null;
    })
    .catch((err) => {
      console.log("Something just went horribly wrong: ", err);
    });
}

/** Start a timer. */
var timers = [];
function time(label) {
  timers.push({ label: label, timestamp: Date.now() });
}

/** End a timer. */
function timeEnd(label) {
  for (i in timers) {
    if (timers[i]["label"] == label) {
      let calc = Date.now() - timers[i]["timestamp"];
      let e = "ms";
      if (calc > 999) {
        calc = calc / 1000;
        e = "s";
      }

      if (label == null) label = "";
      else label = `${label}: `;

      send(`${label}${calc}${e}`, null, "TIMER", "\u001b[36;1m");
      timers.pop(i);
      return;
    }
  }

  send("No timer found.", null, "TIMER", "\u001b[36;1m");
}

var logs = [];
function send(message, level = null, type, color) {
  if (typeof level != "number") level = 1;
  try {
    message = message.toString();
  } catch (err) {
    ts = Date.now();
    console.log(
      `[ERROR] Debugger failed at converting the message argument of type '${typeof message}' to type 'string'. A complete log can be found here: 'logs/log_${ts}.txt'`
    );
    postLog(err.stack, ts).then(() => {
      process.exit();
    });
    return;
  }

  if (debug) {
    if (defaultLevel <= level) {
      let date = new Date();
      let msgDate = `[${date.getDay()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}.${date.getSeconds()}] `;
      let msg = `[${type}] ${message}`;
      console.log(`${msgDate}${color}${msg}\u001b[0m`);
      logs.push(msgDate + msg);
    }
  }
}

function collectLog() {
  let log = "";
  for (item of logs) {
    log += `${item}\n`;
  }
  return log;
}

async function postLog(log, ts = null) {
  if (typeof ts != "number") ts = Date.now();
  try {
    log = log.toString();
  } catch (err) {
    console.log(
      `[ERROR] Debugger failed at converting the data argument of type '${typeof message}' to type 'string'.`
    );
    return;
  }

  let date = new Date(ts);
  let formatDate = `${date.getMonth()}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  log = `${formatDate}\n---------------- LOG ----------------\n${collectLog()}---------------- ERROR ----------------\n${
    log == "0" ? "No traceback parsed." : log
  }`;

  return fsp.writeFile(`${logPath}log_${ts}.log`, log);
}

module.exports = {
  debug,
  setLevel,
  sendInfo,
  sendWarn,
  sendErr,
  time,
  timeEnd,
  postLog,
};

var main = function() {
  if (process.argv[2] != null) {
    switch (process.argv[2]) {
      case "flush":
        sendWarn("CAUTION: All logs will be flushed!");
        rl.question("Do you want to proceed? (Y/N)", (res) => {
          res = res.toLowerCase();
          if (res.includes("n")) {
            console.log("Aborting...");
            return;
          } else {
            sendWarn("All logs will be flushed!");
            fs.readdirSync(`${logPath}`).map((file) => {
              sendInfo(`Flushing file ${file}`);
              fs.unlink(`${logPath}${file}`, (err) => {
                if (err != null) {
                  sendWarn(err);
                } else sendInfo(`${file} got flushed successfully.`);
              });
            });
            sendInfo('Done.');
              process.exit();
              return;
          }
        });
    }
  }
};

if (require.main === module) {
  main();
}
