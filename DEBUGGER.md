# Debugger.md

## Basic use
Instead of `console.log(...)` use 
```js
const debug = require('./debugger.js');

debug.sendInfo('This is a info');
debug.sendWarn('This is a info');
debug.sendErr('This is a error', 'Parse your \'err\' argument here!');
```

## Documentation

Note: ? is a optional parameter

<br>

### `debug.setLevel(level = 0)`
Set the log level

params:
* level: number (-1 to 3)
  + default: 0
  + description: The log level you want to have outputed in your console.
  + levels:
    * -1: Everything (more then in default)
    * 0: Default log level
    * 1: Import log level
    * 2: Warning log level
    * 3: Error log level

<br>

### `debug.sendInfo(message, level?)`
Send information

params:
* message: string
  + description: The message to send in console.
* level?: number (-1 to 1)
  + description: The info level. Can only be 1 or -1 where -1 refers to the more detailed one.

<br>

### `debug.sendWarn(message)`
Send a warn message

params:
* message: string
  + `description: The message to send in console.`

<br>

### `debug.sendErr(message, err, exit? = false, post? = true)`
Send a error message

params:
* message: string
  + description: The message to send in console.
* err?: traceback  
  + description: Is put in the log.txt file that gets generated.
* exit?: boolean
  + default: false
  + description: Should the program exit after saving the log file?
* post?: boolean
  + default: true
  + description: Should the program post the error in console?

<br>

### `debug.time(label?)`
Start a timer

params:
* label?: string
  + description: Label of the timer. Example output: `[TIMER] myAwesomeLabel: 1.0s`

<br>

### `debug.timeEnd(label?)`
Stop a timer

params:
* label?: string
  + note: Has to be the same you provided to debug.time(...)!
  + description: Label of the timer. If none is provided, the last timer with no label will be output.

## Request changes?
Please ask me (JustMe#8491 on Discord) before making any changes to this file.

## LICENSE
GNU v.3
You can read more about the license [here](https://en.wikipedia.org/wiki/GNU_General_Public_License#Version_3).

Have fun!
