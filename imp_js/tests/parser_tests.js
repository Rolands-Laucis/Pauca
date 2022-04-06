//These are unit tests for the new tokenizer and parser implementations of Marble. 

//cd imp_js/tests
//node parser_tests.js

import { Parse, Tokenize, WrapBlocks, Pair } from '../parser.js'
// import { endTimer, startTimer } from "../utils/log.js"
import { ExportParsed } from '../utils/fs_utils.js'
import { ExtractSection } from '../preproc.js'
import { Token, TokenType } from '../token.js'
import { Grams } from '../grammar.js'
import { ResolvePatternsToRegex, ResolveTarget } from '../resolver.js'

import fs from 'fs'


const test_cases = ['operators'] //
const all = true

const syntax = ExtractSection(fs.readFileSync('../gen/test.marble', {encoding:'utf-8'}), 0)
const parsed = Parse(syntax)
// console.log(parsed)
// const out = ResolvePatternsToRegex(parsed)
// const out = ResolveTarget(parsed[0].tar, { 'x': 3, 'y': 2, 'z': 'my_var' })
// console.log(out)
ExportParsed(parsed)
process.exit(0)

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
    const parse_tree = Tokenize(`[target] other stuff here [if[x][1]] x [/if] and here [/target]`)
    console.log(parse_tree)
}
