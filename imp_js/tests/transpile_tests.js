import { Transpile } from '../transpile.js'

const test_cases = ['basic']
const all = true

/**
 * Testing function for single values
 * @param {string} name
 * @param {string} generated
 * @param {string} expected
 */
function test(name, generated, expected) {
    if (generated === expected)
        console.log(`✔️\t${name}`)
    else
        console.log(`❌\t${name} FAIL - GOT\n${generated}\nBUT EXPECTED\n${expected}`)
}

if(test_cases.includes('basic') || all){
    console.log('📝 Testing basic transpilations...')

    test('basic symbols and variables', Transpile(`
["public int "] [var "x"] [" = "] [var "num"] [end]
[target]
[x] is [num]
[/target]`, 'public int my_var = 2', 'flavor', true), ' my_var is 2 ')

}