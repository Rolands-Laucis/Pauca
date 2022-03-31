//node parser_tests.js

import { Parse } from '../parser.js'
import { endTimer, startTimer } from "../log.js"

const test_cases = ['operators'] //
const all = true

/**
 * Testing function for single values
 * @param {string} name
 * @param {Token} generated
 * @param {TokenType} expected
 */
function test(name, generated, expected) {
    if (JSON.stringify(generated) === JSON.stringify(expected))
        console.log(`✔️\t${name} - ${endTimer()}ms`)
    else
        console.log(`❌\t${name} FAIL - GOT\n${JSON.stringify(generated)}\nBUT EXPECTED\n${JSON.stringify(expected)}`)
    startTimer()
}

startTimer()
if (test_cases.includes('operators') || all) {
    const body = Parse(`[end] [target][if[x] [+ [1] [2]]][/target]`)[0].tar.body
    // console.log(body[body.length - 1].val)
    console.log(body[0].val)
    // console.log(body[0].val[2].val)
    // console.log(body)
    // test('operators', Parse(), '')
}

// if (test_cases.includes('') || all) {

// }