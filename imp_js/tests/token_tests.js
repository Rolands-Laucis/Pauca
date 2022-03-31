import { Token, TokenType } from '../token.js'
import { endTimer, startTimer } from "../log.js"

const test_cases = ['token types'] //
const all = true

/**
 * Testing function for single values
 * @param {string} name
 * @param {Token} generated
 * @param {TokenType} expected
 */
function test(name, generated, expected) {
    if (generated.type.name === expected.name)
        console.log(`✔️\t${name} - ${endTimer()}ms`)
    else
        console.log(`❌\t${name} FAIL - GOT\n${JSON.stringify(generated)}\nBUT EXPECTED\n${JSON.stringify(expected)}`)
    startTimer()
}

startTimer()
if (test_cases.includes('token types') || all) {
    test('open bracket', new Token('[', TokenType.OB), TokenType.OB)
}

// if (test_cases.includes('') || all) {

// }