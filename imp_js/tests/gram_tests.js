//node linker_tests.js
import { Token, TokenType } from "../token.js"
import { Grams } from "../grammar.js"
import { Parse, Tokenize, WrapBlocks } from "../parser.js"
// import { ResolveTarget } from "../resolver.js"
import { endTimer, startTimer, log, error } from "../utils/log.js"

const test_cases = ['ctx']
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

    let tokens = Parse('[x]', [Tokenize])
    test('variable by label', Grams.FUN.ctx(tokens[0], {'x':1}), 1)

    tokens = Parse('[x]', [Tokenize])
    test('variable by label as stored string', Grams.FUN.ctx(tokens[0], { 'x': 'y' }), 'y')

    tokens = Parse('[x]', [Tokenize])
    test('variable by label as stored string of an int parsed as a num', Grams.FUN.ctx(tokens[0], { 'x': '1' }), 1)

    tokens = Parse('[0]', [Tokenize])
    test('variable by index', Grams.FUN.ctx(tokens[0], { 'smth': 1 }), 1)

    tokens = Parse('[0]', [Tokenize])
    test('variable pat label as int', Grams.FUN.ctx(tokens[0], { '0': 1 }), 1)

    tokens = Parse('1', [Tokenize])
    test('variable as int literal', Grams.FUN.ctx(tokens[0], {}), 1)

    tokens = Parse('[0]', [Tokenize])
    test('variable by index as string of an int parsed as a num', Grams.FUN.ctx(tokens[0], {'x':'1'}), 1)
}

if (test_cases.includes('list') || all) {
    log('📝', 'Testing list resolutions...')

    let token = Parse('[> [0] [1]]', [Tokenize])[0].val
    test('LOP >', Grams.FUN.list(token, { '0': 0, '1': 1 }), false)

    token = Parse('[< [0] [1]]', [Tokenize])[0].val
    test('LOP <', Grams.FUN.list(token, { '0': 0, '1': 1 }), true)

    token = Parse('[== [0] [1]]', [Tokenize])[0].val
    test('LOP ==', Grams.FUN.list(token, { '0': 1, '1': 1 }), true)

    token = Parse('[> [x] 1]', [Tokenize])[0].val
    test('LOP > with variable and num literal', Grams.FUN.list(token, { 'x': 2 }), true)

    token = Parse('[> 2 [x]]', [Tokenize])[0].val
    test('LOP > with variable and num literal reversed order and falsy', Grams.FUN.list(token, { 'x': 2 }), false)

    token = Parse('[+ [x] 1]', [Tokenize])[0].val
    let ctx = { 'x': 1 }
    Grams.FUN.list(token, ctx)
    test('storing the AOP result into the first arg when its a labeled var', ctx.x, 2)

    token = Parse('[+ 1 [x]]', [Tokenize])[0].val
    ctx = { 'x': 1 }
    Grams.FUN.list(token, ctx)
    test('not storing the AOP result into the first arg when its an int literal', ctx.x, 1)

    token = Parse('[+ [x] [x] [x] 1]', [Tokenize])[0].val
    ctx = { 'x': 1 }
    Grams.FUN.list(token, ctx)
    test('+ AOP for 4 args', ctx.x, 4)

    token = Parse('[+ [x] 1]', [Tokenize])[0].val
    ctx = { 'x': '1' }
    Grams.FUN.list(token, ctx)
    test('+ AOP for ctx numbers as strings', ctx.x, 2)

    // token = Parse('[> 2 1]', [Tokenize])
    // test('LOP > with both num literal', Grams.FUN.cond(token, { }), true)
}

if (test_cases.includes('cond') || all) {
    log('📝', 'Testing condition resolutions...')

    let tokens = Parse('[> [0] [1]]', [Tokenize])
    test('LOP >', Grams.FUN.cond(tokens, { '0': 0, '1': 1 }), false)

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
    const ctx = { y: 1 } //a ctx passed by reference here will augment this ctx just by the f call.
    test('def ctx variable to label', Grams.FUN.def(tokens[0].val[1], tokens[0].val[2], ctx).x, { 'x': 1 }.x)
}

if (test_cases.includes('if') || all) {
    log('📝', 'Testing if condition resolutions...')

    let t = Parse('[if [> [x] 1]]x[/if]', [Tokenize, WrapBlocks])[0]
    test('if true cond output inner', Grams.BLOCK[t.val[0].val](t.val.slice(2, -1), {'x':2}, t.val[1].type == TokenType.ARGS ? t.val[1].val : t.val[1]), 'x')
    test('if false cond output empty string', Grams.BLOCK[t.val[0].val](t.val.slice(2, -1), { 'x': 1 }, t.val[1].type == TokenType.ARGS ? t.val[1].val : t.val[1]), '')
}

if (test_cases.includes('loop') || all) {
    log('📝', 'Testing loop resolutions...')

    let t = Parse('[loop [x]]x[/loop]', [Tokenize, WrapBlocks])[0]
    // console.log(t.val)
    test('loop variable times', Grams.BLOCK[t.val[0].val](t.val.slice(2, -1), { 'x': 2 }, t.val[1].type == TokenType.ARGS ? t.val[1].val : t.val[1]), 'xx')
    test('loop variable times none', Grams.BLOCK[t.val[0].val](t.val.slice(2, -1), { 'x': 0 }, t.val[1].type == TokenType.ARGS ? t.val[1].val : t.val[1]), '')
}