import { Preprocess, ExtractSection } from './preproc.js'
import { Parse } from './lexer.js'
import { ContextualizeTargetTags, ResolveTarget } from './linker.js'

import { info, startTimer } from "./log.js"


/**
 * @param {string} syntax
 * @param {string} source
 * @param {boolean} verbose
 */
export function Transpile(syntax, source, mode = 'flavor', verbose = false) {
    if (verbose) startTimer()

    if (verbose) info('Starting transpilation...')
    //preprocess steps before parsing the syntax file
    // syntax = ExtractSection(syntax, 0)

    syntax = Preprocess(syntax)
    if (verbose) info('Done preprocessing')

    //parse the marble syntax into a ready-to-use data structure
    const parsed_marble = Parse(syntax)
    if (verbose) info('Done parsing marble file')

    let output = ''
    //---Convert source lines with regex
    if (mode == 'flavor') {
        for (let i = 0; i < parsed_marble.length; i++) {
            const pair = parsed_marble[i]

            const ctx = source.match(pair.pat)
            if (!ctx)
                continue
            // console.log(match)
            // console.log(JSON.stringify(pair.tar.body))
            // console.log(JSON.stringify(ContextualizeTargetTags(pair.tar.body, ctx)))
            const target = ContextualizeTargetTags(pair.tar.body, ctx)
            output += ResolveTarget(target) 
        }
    }

    return output
}