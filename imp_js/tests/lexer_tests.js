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
function test_pairs(name, generated, expected) {
    if (generated['pat'] === expected['pat'] && generated['tar'] === expected['tar'])
        console.log(`✔️\t${name} PASS`)
    else
        console.log(`❌\t${name} FAIL - GOT ${'\n' + generated['pat'] + '\n' + generated['tar']}\nBUT EXPECTED \n${expected['pat'] + '\n' + expected['tar']}`)
}

console.log('📝 Testing Pairer...')
test_pairs('basic full string', Pairer('[var "x"] [sym " "] [end "smth"] [target] var [x] = [num] [5] [/target]')[0], { 'pat': '[var "x"] [sym " "] [end "smth"]', 'tar':'[target] var [x] = [num] [5] [/target]'})
test_pairs('basic string no end label', Pairer('[var "x"] [sym " "] [end] [target] var [x] = [num] [5] [/target]')[0], { 'pat': '[var "x"] [sym " "] [end]', 'tar': '[target] var [x] = [num] [5] [/target]' })
test_pairs('basic full string target label', Pairer('[var "x"] [sym " "] [end "smth"] [target "py"] var [x] = [num] [5] [/target]')[0], { 'pat': '[var "x"] [sym " "] [end "smth"]', 'tar': '[target "py"] var [x] = [num] [5] [/target]' })

test_pairs('multiline target', Pairer(`
[var "x"] [sym " "] [end] 
[target] 
var [x] = [num] [5] 
[/target]`)[0], { 'pat': '[var "x"] [sym " "] [end]', 'tar': `[target] 
var [x] = [num] [5] 
[/target]` })

test_pairs('multiline pattern', Pairer(`
[var "x"] [sym " "] 
[end] 
[target] var [x] = [num] [5] [/target]`)[0], { 'pat': '[var "x"] [sym " "] [end]', 'tar': '[target] var [x] = [num] [5] [/target]' })


