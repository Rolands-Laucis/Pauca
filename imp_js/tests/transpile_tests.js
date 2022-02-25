import { MarbleTranspile } from '../transpile.js'

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
        console.log(`✔️\t${name}`)
    else
        console.log(`❌\t${name} FAIL - GOT\n${generated}\nBUT EXPECTED\n${expected}`)
}

if(test_cases.includes('basic') || all){
    console.log('📝 Testing basic transpilations...')

    test('basic symbols and variables', MarbleTranspile(`
["public int "] [var "x"] [" = "] [var "num"] [end]
[target]
[x] is [num]
[/target]`, 'public int my_var = 2', 'transpile', true), ' my_var is 2 ')
}

if (test_cases.includes('if') || all) {
    test('basic IF block', MarbleTranspile(`
["public int "] [var "x"] [" = "] [var "num"] [end]
[target]
[if [num]>3]
[x] is bigger than 3
[/if]
[/target]`, 'public int my_var = 2', 'transpile', true), '')

    test('basic IF block without tag spaces', MarbleTranspile(`
["public int "][var "x"][" = "][var "num"][end]
[target][if [num]>1][x] is bigger than 1[/if][/target]`, 'public int my_var = 2', 'transpile', true), 'my_var is bigger than 1')
}

if (test_cases.includes('loop') || all){
    console.log('📝 Testing loop...')

    test('basic loop with count literal', MarbleTranspile(`
["public int "] [var "x"] [" = "] [var "num"] [end]
[target]
    [loop 2]
        [x] is [num]
    [/loop]
[/target]`, 'public int my_var = 2', 'transpile'), `
    
        my_var is 2
    
        my_var is 2
    
`)
}

if (test_cases.includes('nests') || all){
    console.log('📝 Testing nests...')

    test('basic IF in LOOP', MarbleTranspile(`
["public int "] [var "x"] [" = "] [var "num"] [end]
[target]
    [loop 2]
        [if [2] > 1]
            [x] is [num]
        [/if]
    [/loop]
[/target]`, 'public int my_var = 2', 'transpile'), `
    
        my_var is 2
    
        my_var is 2
    
`)

    test('basic LOOP in IF', MarbleTranspile(`
["public int "] [var "x"] [" = "] [var "num"] [end]
[target]
    [if [2] > 1]
        [loop 2]
            [x] is [num]
        [/loop]
    [/if]
[/target]`, 'public int my_var = 2', 'transpile'), `
    
        my_var is 2
    
        my_var is 2
    
`)
}