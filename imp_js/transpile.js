import { Preprocess, ExtractSection } from './preproc.js'
import { Parse } from './parser.js'
import { ResolvePatternsToRegex, ResolveTarget } from './resolver.js'

import { info, startTimer, error, log } from "./utils/log.js"
import sizeof from 'object-sizeof'

export class TranspileMode {
    static SINGLE = new TranspileMode('SINGLE')//transpile as single match and single generated output
    static MULTIPLE = new TranspileMode('MULTIPLE') //transpile each pattern for every match in the input sequentially generating its output
    static REPLACE = new TranspileMode('REPLACE') //transpile via classic find and replace with generated output

    constructor(n) {this.name = n}
}


/**
 * @param {string} syntax
 * @param {string} source
 * @param {object} opts
 */
export function MarbleTranspile(syntax, source, { mode = TranspileMode.MULTIPLE, segment = null, verbose = false, only_preprocess=false, only_parse=false, only_resolve_pat=false } = {}) { //opts as a dictionary of opts with defaults
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
    // log(parse_tree)
    if (verbose) info(`Parsed marble file. Size of parse tree object: [${sizeof(parse_tree)}] Bytes`)
    if (only_parse) error('Purposeful program termination to print parse tree:',parse_tree)

    //resolve the pattern tokens to a regex object
    parse_tree = ResolvePatternsToRegex(parse_tree)
    if (verbose) info(`Resolved patterns to regex`)
    // log(parse_tree)
    if (only_resolve_pat) error('Purposeful program termination to print parse tree after pattern resolve:', parse_tree)

    let output = ''
    //---Convert source lines with regex
    switch(mode){
        case TranspileMode.SINGLE:
            parse_tree.forEach((pair, i) => {
                pair.pat = RegExp(pair?.pat, 'm') || undefined //RegExp object .flags property only has a getter, so the only way to set the flags is to create a new object. Leave only the m flag

                if (pair.pat && pair.pat.test(source)) {
                    if (verbose) info(`Matched pattern [${i}] in input string`)
                    const ctx = source.match(pair.pat)?.groups || {}
                    output += ResolveTarget(pair.tar, ctx)
                    if (verbose) info(`Resolved pattern [${i}] target to output string`)
                }
            })
            break;
        case TranspileMode.MULTIPLE:
            parse_tree.forEach((pair, i) => {
                for (const m of source.matchAll(pair.pat)) { //have to loop like this, bcs matchAll returns an iterator, which is useful for large input texts.
                    const ctx = m?.groups || {}
                    output += ResolveTarget(pair.tar, ctx)
                }
            })
            break;
        // case TranspileMode. ;break;
        default: error('Usupported transpilation mode!', mode)
    }

    if (verbose) info('Done transpiling')
    return output
}