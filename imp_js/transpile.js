import { Preprocess, ExtractSection } from './preproc.js'
// import { Parse } from './lexer.js'
import { Parse } from './parser.js'
import { ResolvePatternsToRegex, ResolveTarget } from './resolver.js'

import { info, startTimer, error, TODO } from "./log.js"
import sizeof from 'object-sizeof'

export class TranspileMode {
    static SINGLES = new TranspileMode('SINGLES')//this is a regular string. Either unknown type or a literal string to be pushed to the output

    constructor(n) {this.name = n}
}


/**
 * @param {string} syntax
 * @param {string} source
 * @param {object} opts
 */
export function MarbleTranspile(syntax, source, { mode = TranspileMode.SINGLES, segment = null, verbose = false, only_preprocess=false, only_parse=false, only_resolve_pat=false } = {}) { //opts as a dictionary of opts with defaults
    if (verbose) startTimer()

    if (verbose) info('Starting transpilation...')

    //for debugging it is useful to extract a part of a full syntax file and run only that one.
    if (segment != null) syntax = ExtractSection(syntax, segment)
    if (segment != null && verbose) info(`Extracted syntax file section [${segment}]`)

    //preprocess steps before parsing the syntax file
    syntax = Preprocess(syntax)
    if (verbose) info('Done preprocessing')
    if (only_preprocess) return syntax

    //parse the marble syntax into a ready-to-use data structure
    let parse_tree = Parse(syntax)
    if (verbose) info(`Parsed marble file. Size of parsed target object ${sizeof(parse_tree)} Bytes`)
    console.log(parse_tree[0].pat.val[4])
    if (only_parse) error('Purposeful program termination to print parse tree:',parse_tree)

    //resolve the pattern tokens to a regex object
    parse_tree = ResolvePatternsToRegex(parse_tree)
    if (verbose) info(`Resolved patterns to regex`)
    if (only_resolve_pat) error('Purposeful program termination to print parse tree after pattern resolve:', parse_tree)

    let output = ''
    //---Convert source lines with regex
    switch(mode){
        case TranspileMode.SINGLES:
            parse_tree.forEach((pair, i) => {
                console.log(pair)
                if (pair.pat && pair.pat.test(source)) {
                    if (verbose) info(`Matched pattern [${i}] in input string`)
                    const ctx = source.match(pair.pat)?.groups
                    output += ResolveTarget(pair.tar, ctx)
                    if (verbose) info(`Resolved pattern [${i}] target to output string`)
                }
            });break;
        // case TranspileMode. ;break;
        default: error('Usupported transpilation mode!', mode)
    }

    if (verbose) info('Done transpiling')
    return output
}