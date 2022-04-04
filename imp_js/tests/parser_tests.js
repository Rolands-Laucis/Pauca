//These are unit tests for the new tokenizer and parser implementations of Marble. 

//cd imp_js/tests
//node parser_tests.js

import { Parse, Tokenize, WrapBlocks, Pair } from '../parser.js'
// import { endTimer, startTimer } from "../log.js"
import { ExportParsed } from '../utils/fs_utils.js'
import { ExtractSection } from '../preproc.js'
import { Token, TokenType } from '../token.js'
import { Grams } from '../grammar.js'

import fs from 'fs'


const test_cases = ['operators'] //
const all = true

// const tree = [new Token('smth', TokenType.STR), new Token(' other stuff \n', TokenType.STR)]
// const out = Grams.BLOCK.target(tree)
// console.log(out)
// process.exit(0)

const syntax = ExtractSection(fs.readFileSync('../gen/test.marble', {encoding:'utf-8'}), 0)
const parsed = Parse(syntax)
// console.log(parsed)
const out = Grams.BLOCK.target(parsed[0].tar.val, {'1':3, '2':2, 'x':'my_var'})
console.log(out)
// ExportParsed(parsed)
process.exit(0)

// const parse_tree = Tokenize(syntax)
// console.log(parse_tree)
// process.exit(0)

// const wrapped = BlockWrapper([{tar:parse_tree}])
// console.log(wrapped[0])
// ExportParsed(wrapped[0])
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
    // const parse_tree = Parse(`[end] [target][if [x] [+ [1] [2]]] inner [/if][/target]`)
    // process.exit(0)
    const parse_tree = Tokenize(`[target] other stuff here [if[x][1]] x [/if] and here [/target]`)
    console.log(parse_tree)
    
    // ExportParsed(parse_tree, {path:'./gen/parse_tree.json'})
    // ExportParsed(parse_tree)
}

// if (test_cases.includes('') || all) {

// }