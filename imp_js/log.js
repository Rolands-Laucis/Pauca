let last_time = 0

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
    console.log(`${prefix('MARBLE ERROR')} 😐 Bruh...\n`, msg)
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
    console.log(`${prefix('MARBLE TODO')} Not implemented:`, msg)
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

function prefix(msg = 'MARBLE'){
    return `[${msg}]`
}