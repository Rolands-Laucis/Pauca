import { Pairer } from '../lexer.js'

/**
 * Testing function
 * @param {string} name
 * @param {Array} generated
 * @param {Array} expected
 */
// function test(name, generated, expected) {
//     if (generated.equals(expected))
//         console.log(`✔️\t${name} PASS`)
//     else
//         console.log(`❌\t${name} FAIL - GOT [${[generated[0].name, ...generated.slice(1)]}] BUT EXPECTED [${[expected[0].name, ...expected.slice(1)]}]`)
// }

/**
 * Testing function for single values
 * @param {string} name
 * @param {object} generated
 * @param {object} expected
 */
function test(name, generated, expected) {
    if (generated['pat'] === expected['pat'] && generated['tar'] === expected['tar'])
        console.log(`✔️\t${name} PASS`)
    else
        console.log(`❌\t${name} FAIL - GOT [${generated['pat'] + '\n' + generated['tar']}] BUT EXPECTED [${expected['pat'] + '\n' + expected['tar']}]`)
}

console.log('📝 Testing Pairer...')
test('basic string', Pairer('[var "x"] [sym " "] [end "smth"] [target] var [x] = [num] [5] [/target]'), { 'pat': '[var "x"] [sym " "] [end "smth"]', 'tar':'[target] var [x] = [num] [5] [/target]'})