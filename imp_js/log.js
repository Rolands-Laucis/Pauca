let last_time = 0

/**
 * Logs an error and the errored object if there is one and exits the process
 * @param {string} msg
 * @param {object} obj
 * @param {boolean} exit
 */
export function error(msg, obj = null, exit = true) {
    console.log('😐 Bruh...\n'+msg)
    if(obj)
        console.log(obj)
    if (exit)
        process.exit(1)
}

export function info(msg){
    console.log(`[MARBLE] ${msg} - ${endTimer()}ms`)
}

export function startTimer(){
    last_time = process.hrtime();
}

function endTimer(reset = false){
    let ms = process.hrtime(last_time)
    if(reset) startTimer()
    return ((ms[0] * 1000) + (ms[1] / 1000000)).toFixed(2)
}