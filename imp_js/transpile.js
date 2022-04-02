import { Preprocess, ExtractSection } from './preproc.js'
// import { Parse } from './lexer.js'
import { Parse } from './parser.js'
import { ContextualizeTargetTags, ResolveTarget } from './linker.js'

import { info, startTimer } from "./log.js"
import sizeof from 'object-sizeof'

/**
 * @param {string} syntax
 * @param {string} source
 * @param {object} opts
 */
export function MarbleTranspile(syntax, source, { mode = 'transpile', segment = null, verbose = false } = {}) { //opts as a dictionary of opts with defaults
    if (verbose) startTimer()

    if (verbose) info('Starting transpilation...')
    //preprocess steps before parsing the syntax file
    if (segment != null) syntax = ExtractSection(syntax, segment)

    syntax = Preprocess(syntax)
    if (verbose) info('Done preprocessing')
    // console.log(syntax)
    // return ''

    //parse the marble syntax into a ready-to-use data structure
    const parsed_marble = Parse(syntax)
    if (verbose) info(`Done parsing marble file. Size of parsed target object ${sizeof(parsed_marble)} Bytes`)
    // console.log(parsed_marble[0].tar.body)
    console.log(parsed_marble)
    return

    let output = ''
    //---Convert source lines with regex
    if (mode == 'transpile') {
        parsed_marble.forEach(pair => {
            const ctx = source.match(pair.pat)
            if (ctx) {
                const target = ContextualizeTargetTags(pair.tar.body, ctx)
                if(verbose) info(`Contextualized target. Size of contextualized target object ${sizeof(target)} Bytes`)
                // console.log(target[1][2][1])
                // console.log(JSON.stringify(target))
                output += ResolveTarget(target)
            }
        })
    } else if (mode == 'flavor'){
        return source
    }

    if (verbose) info('Done transpiling')
    return output
}