import { Pairer, Tokenizer } from '../lexer.js'

Array.prototype.contains = function (element) {
    return this.indexOf(element) > -1;
};

/**
 * Testing function for single values
 * @param {string} name
 * @param {object} generated
 * @param {object} expected
 */
function test(name, generated, expected) {
    if (JSON.stringify(generated) === JSON.stringify(expected))
        console.log(`✔️\t${name}`)
    else
        console.log(`❌\t${name} FAIL - GOT\n${JSON.stringify(generated)}\nBUT EXPECTED\n${JSON.stringify(expected)}`)
}

const test_cases = ['Tokenizer'] //'Pairer', 'Tokenizer'

if (test_cases.contains('Pairer')){
    console.log('📝 Testing Pairer...')
    test('basic full string', Pairer('[var "x"] [sym " "] [end "smth"] [target] var [x] = [num] [5] [/target]')[0], { 'pat': '[var "x"] [sym " "] [end "smth"]', 'tar': '[target] var [x] = [num] [5] [/target]' })
    test('basic string no end label', Pairer('[var "x"] [sym " "] [end] [target] var [x] = [num] [5] [/target]')[0], { 'pat': '[var "x"] [sym " "] [end]', 'tar': '[target] var [x] = [num] [5] [/target]' })
    test('basic full string target label', Pairer('[var "x"] [sym " "] [end "smth"] [target "py"] var [x] = [num] [5] [/target]')[0], { 'pat': '[var "x"] [sym " "] [end "smth"]', 'tar': '[target "py"] var [x] = [num] [5] [/target]' })

    test('multiline target', Pairer(`
[var "x"] [sym " "] [end] 
[target] 
var [x] = [num] [5] 
[/target]`)[0], {
        'pat': '[var "x"] [sym " "] [end]', 'tar': `[target] 
var [x] = [num] [5] 
[/target]` })

    test('multiline pattern', Pairer(`
[var "x"] [sym " "] 
[end] 
[target] var [x] = [num] [5] [/target]`)[0], { 'pat': '[var "x"] [sym " "] [end]', 'tar': '[target] var [x] = [num] [5] [/target]' })

}

if (test_cases.contains('Tokenizer')) {
    console.log('📝 Testing Tokenizer for pattern...')
    test('pattern simple', Tokenizer([{ 'pat': '[sym "var "] [var "x"] [end]' }])[0], { 'pat': ['sym "var "', 'var "x"', 'end']})
    test('pattern with end label', Tokenizer([{ 'pat': '[sym "var "] [var "x"] [end "pat"]' }])[0], { 'pat': ['sym "var "', 'var "x"', 'end "pat"'] })
    test('pattern with between tag garbage', Tokenizer([{ 'pat': '[sym "var "] fgdf [var "x"] sdgfs [end] sdfs' }])[0], { 'pat': ['sym "var "', 'var "x"', 'end'] })
    test('pattern with emoji', Tokenizer([{ 'pat': '[sym "var 💩"] 💩 [var "x"] 💩 [end] 💩' }])[0], { 'pat': ['sym "var 💩"', 'var "x"', 'end'] })

    console.log('📝 Testing Tokenizer for target...')
    test('target simplest', Tokenizer([{'tar': '[target] var [/target]' }])[0], { 'tar': {'body':[' var ']} })
    test('target simple with lang', Tokenizer([{'tar': '[target "js"] var [/target]' }])[0], { 'tar': { 'lang': 'js', 'body': [' var '] } })
    test('target with tags', Tokenizer([{'tar': '[target] var [x] = [/target]' }])[0], { 'tar': { 'body': [' var ', '[x]', ' = '] } })
    test('target with IF block tag', Tokenizer([{'tar': '[target] [if [1]>2] var [/if] [/target]' }])[0], { 'tar': { 'body': [' ', '[if [1]>2]', ' var ', '[/if]'] } })
}
