

/**
 * Logs an error and the errored object if there is one and exits the process
 * @param {string} msg
 * @param {object} obj
 * @param {boolean} exit
 */
export function error(msg, obj = null, exit = false) {
    console.log('😐 Bruh...\n'+msg)
    if(obj)
        console.log(obj)
    if (exit)
        process.exit(1)
}