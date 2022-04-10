let last_time = 0

//https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
const console_colors = {
    Reset:"\x1b[0m",
    Bright:"\x1b[1m",
    Dim:"\x1b[2m",
    Underscore:"\x1b[4m",
    Blink:"\x1b[5m",
    Reverse:"\x1b[7m",
    Hidden:"\x1b[8m",

    FgBlack:"\x1b[30m",
    FgRed:"\x1b[31m",
    FgGreen:"\x1b[32m",
    FgYellow:"\x1b[33m",
    FgBlue:"\x1b[34m",
    FgMagenta:"\x1b[35m",
    FgCyan:"\x1b[36m",
    FgWhite:"\x1b[37m",

    BgBlack:"\x1b[40m",
    BgRed:"\x1b[41m",
    BgGreen:"\x1b[42m",
    BgYellow:"\x1b[43m",
    BgBlue:"\x1b[44m",
    BgMagenta:"\x1b[45m",
    BgCyan:"\x1b[46m",
    BgWhite:"\x1b[47m"
}

/**
 * @param {object[]} objs
 */
export function log(...objs){
    console.log(...objs)
}

/**
 * Logs an error and the errored object if there is one and exits the process
 * @param {string} msg
 * @param {object[]} objs
 * @param {boolean} exit
 */
export function error(msg, ...objs) {
    console.log(`${prefix('MARBLE ERROR', console_colors.FgRed)} 😐 Bruh...\n`, msg)
    if(objs)
        console.log(...objs)
    process.exit(1)
}

/**
 * @param {string} msg
 * @param {object} obj
 * @param {boolean} exit
 */
export function TODO(msg = '', obj = null, exit=false){
    console.log(`${prefix('MARBLE TODO', console_colors.FgYellow)} Not implemented:`, msg, '\n')
    if (obj)
        console.log(obj)
    if (exit)
        process.exit(1)
    return null
}

export function info(msg){
    console.log(`${prefix()} ${msg} - ${endTimer()}ms`)
}

export function startTimer(){
    last_time = process.hrtime();
}

export function endTimer(reset = false){
    let ms = process.hrtime(last_time)
    if(reset) startTimer()
    return ((ms[0] * 1000) + (ms[1] / 1000000)).toFixed(2)
}

function prefix(msg = 'MARBLE', color=console_colors.Reset){
    return `${color}[${msg}]${console_colors.Reset}`
}