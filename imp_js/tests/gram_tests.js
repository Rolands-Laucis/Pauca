//node linker_tests.js
// import { Token, TokenType } from "../token.js"
import { Grams } from "../grammar.js"
import { Parse, Tokenize } from "../parser.js"
// import { ResolveTarget } from "../resolver.js"
import { endTimer, startTimer, log } from "../utils/log.js"

const test_cases = ['def']
const all = false
startTimer()

Array.prototype.equals = function (arr) {
    if (!arr || this.length != arr.length)
        return false

    //compare all aligned elements (same order in place) recursively. This will exit early, if there is a mismatch.
    return this.every((e, i) => typeof (e) == 'array' ? (typeof (arr[i]) == 'array' ? e.equals(arr[i]) : false) : e === arr[i])
}

/**
 * Testing function for single values
 * @param {string} name
 * @param generated
 * @param expected
 */
function test(name, generated, expected) {    
    if (generated === expected)
        console.log('✔️\t', name, ` - ${endTimer()}ms`)
    else
        console.log('❌', name, 'FAIL - GOT\n', generated, '\nBUT EXPECTED\n', expected)
    startTimer()
}

if (test_cases.includes('ctx') || all) {
    log('📝', 'Testing context resolutions...')

    let tokens = Parse('[smth]', [Tokenize])
    test('variable by label', Grams.FUN.ctx(tokens[0], {'smth':1}), 1)

    tokens = Parse('[0]', [Tokenize])
    test('variable by index', Grams.FUN.ctx(tokens[0], { 'smth': 1 }), 1)

    tokens = Parse('[0]', [Tokenize])
    test('variable pat label as int', Grams.FUN.ctx(tokens[0], { '0': 1 }), 1)

    tokens = Parse('1', [Tokenize])
    test('variable as int literal', Grams.FUN.ctx(tokens[0], {}), 1)
}

if (test_cases.includes('cond') || all) {
    log('📝', 'Testing condition resolutions...')

    let tokens = Parse('[> [0] [1]]', [Tokenize])
    test('condition OP >', Grams.FUN.cond(tokens, { '0': 0, '1':1 }), false)

    tokens = Parse('[< [0] [1]]', [Tokenize])
    test('condition OP <', Grams.FUN.cond(tokens, { '0': 0, '1': 1 }), true)

    tokens = Parse('[== [0] [1]]', [Tokenize])
    test('condition OP ==', Grams.FUN.cond(tokens, { '0': 1, '1': 1 }), true)

    tokens = Parse('[smth]', [Tokenize])
    test('condition single variable truthyness', Grams.FUN.cond(tokens, { smth:1 }), true)

    tokens = Parse('[smth]', [Tokenize])
    test('condition single variable falsyness', Grams.FUN.cond(tokens, { smth: 0 }), false)
}

if (test_cases.includes('def') || all) {
    log('📝', 'Testing definition resolutions...')

    let tokens = Parse('[def [x] 1]', [Tokenize])
    test('def num literal to label', Grams.FUN.def(tokens[0].val[1], tokens[0].val[2], { }).x, {'x':1}.x)

    tokens = Parse('[def [x] [y]]', [Tokenize])
    const ctx = { y: 1 }
    test('def ctx variable to label', Grams.FUN.def(tokens[0].val[1], tokens[0].val[2], ctx).x, { 'x': 1 }.x)
    log(ctx)
}