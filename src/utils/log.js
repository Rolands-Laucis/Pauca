let last_time = 0

//https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
export const console_colors = {
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
 * short form of log, since i type it so much and the default is too long
 * @param {object[]} objs
 */
export function log(...objs) {console.log(...objs)}

/**
 * short form of log, since i type it so much and the default is too long
 * @param {object[]} objs
 */
export function log_call_stack(...objs) {console.trace(...objs)}

/**
 * Logs an error and the errored object if there is one and exits the process
 * @param {string} msg
 * @param objs
 * @param {boolean} exit
 */
export function error(msg, ...objs) {
    console.log(`${prefix('PAUCA ERROR', console_colors.BgRed + console_colors.FgWhite)} 😐 Bruh...\n\n${msg}`)
    if(objs)
        console.log(...objs, '\n')
    
    throw new Error(msg)
}

/**
 * @param {string} msg
 * @param {object} obj
 * @param {boolean} exit
 */
export function TODO(msg = '', obj = null, exit=false){
    console.log(`${prefix('PAUCA TODO', console_colors.FgYellow)} Not implemented:`, msg, '\n')
    if (obj) console.trace(obj)
    if (exit) process.exit(1)
    return null
}

export function info(msg, color = ''){
    console.log(`${prefix('PAUCA', color)} ${msg} - ${endTimer()}ms`)
}

export function startTimer(){
    last_time = performance.now()
}

export function endTimer(reset = false){
    let ms = performance.now() - last_time
    if(reset) startTimer()
    return ms.toFixed(2)
}

function prefix(msg = 'PAUCA', color=''){
    return `${color}[${msg}]${console_colors.Reset}`
}