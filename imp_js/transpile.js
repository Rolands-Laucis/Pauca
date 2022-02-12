import { Preprocess, ExtractSection } from './preproc.js'
import { Parse } from './lexer.js'
import { ContextualizeTargetTags, ResolveTarget } from './linker.js'

import { info, startTimer } from "./log.js"


/**
 * @param {string} syntax
 * @param {string} source
 * @param {boolean} verbose
 */
export function Transpile(syntax, source, mode = 'transpile', verbose = false) {
    if (verbose) startTimer()

    if (verbose) info('Starting transpilation...')
    //preprocess steps before parsing the syntax file
    // syntax = ExtractSection(syntax, 0)

    syntax = Preprocess(syntax)
    if (verbose) info('Done preprocessing')
    // console.log(syntax)

    //parse the marble syntax into a ready-to-use data structure
    const parsed_marble = Parse(syntax)
    if (verbose) info('Done parsing marble file')
    // console.log(parsed_marble[0].tar.body)

    let output = ''
    //---Convert source lines with regex
    if (mode == 'transpile') {
        parsed_marble.forEach(pair => {
            const ctx = source.match(pair.pat)
            if (ctx) {
                const target = ContextualizeTargetTags(pair.tar.body, ctx)
                // console.log(target)
                // console.log(JSON.stringify(target))
                output += ResolveTarget(target)
            }
        })
    } else if (mode == 'flavor'){
        return source
    }

    return output
}