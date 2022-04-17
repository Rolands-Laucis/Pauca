//node parse_tests.js
import { Token, TokenType } from "../token.js"
import { Grams } from "../grammar.js"
import { Parse, Tokenize, WrapBlocks } from "../parser.js"
// import { ResolveTarget } from "../resolver.js"
import { endTimer, startTimer, log, error } from "../utils/log.js"

const test_cases = ['types']
const all = false
startTimer()

Array.prototype.equals = function (arr) {
    if (!arr || this.length != arr.length) return false

    //compare all aligned elements (same order in place) recursively. This will exit early, if there is a mismatch.
    return this.every((e, i) => typeof (e) == 'array' ? (typeof (arr[i]) == 'array' ? e.equals(arr[i]) : false) : e === arr[i])
}

function test(name, generated, expected) {
    if (JSON.stringify(generated) === JSON.stringify(expected))
        console.log('✔️\t', name, ` - ${endTimer()}ms`)
    else
        console.log('❌', name, 'FAIL - GOT\n', generated, '\nBUT EXPECTED\n', expected)
    startTimer()
}

if (test_cases.includes('types') || all) {
    log('📝', 'Testing pattern type parsing...')

    let t = Parse('[sym "x"]', [Tokenize])[0].val
    test('sym', t, [new Token('sym', TokenType.FUN), new Token('"x"', TokenType.STR)])

    t = Parse('["x"]', [Tokenize])[0].val
    test('sym shorthand', t, [new Token('', TokenType.FUN), new Token('"x"', TokenType.STR)])

    t = Parse('[var "x"]', [Tokenize])[0].val
    test('var', t, [new Token('var', TokenType.FUN), new Token('"x"', TokenType.STR)])

    t = Parse('[d "x"]', [Tokenize])[0].val
    test('d', t, [new Token('d', TokenType.FUN), new Token('"x"', TokenType.STR)])

    t = Parse('[f "x"]', [Tokenize])[0].val
    test('f', t, [new Token('f', TokenType.FUN), new Token('"x"', TokenType.STR)])
}