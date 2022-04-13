import { MarbleTranspile } from '../transpile.js'
import { endTimer, startTimer } from "../log.js"

const test_cases = ['loop']
const all = true

/**
 * Testing function for single values
 * @param {string} name
 * @param {string} generated
 * @param {string} expected
 */
function test(name, generated, expected) {
    if (generated.trim() === expected.trim())
        console.log(`✔️\t${name} - ${endTimer()}ms`)
    else
        console.log(`❌\t${name} FAIL - GOT\n${generated.trim()}\nBUT EXPECTED\n${expected.trim()}`)
    startTimer()
}

startTimer()
if(test_cases.includes('basic') || all){
    console.log('📝 Testing basic transpilations...')
}
