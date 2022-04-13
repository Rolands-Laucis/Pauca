import { Preprocess, ExtractSection } from './preproc.js'
import { Parse } from './parser.js'
import { ResolvePatternsToRegex, ResolveTarget } from './resolver.js'

import { info, startTimer, error, log } from "./utils/log.js"
import sizeof from 'object-sizeof'

// import { ExportParsed } from './utils/fs_utils.js'

//enum class for marble transpilation modes
export class TranspileMode {
    static SINGLE = new TranspileMode('SINGLE')//transpile as single match and single generated output
    static MULTIPLE = new TranspileMode('MULTIPLE') //transpile each pattern for every match in the input sequentially generating its output
    static REPLACE = new TranspileMode('REPLACE') //transpile via classic find and replace with generated output

    constructor(n) {this.name = n}
}

//https://stackoverflow.com/questions/20817618/is-there-a-splice-method-for-strings
String.prototype.splice = function (index, count, add='') { return this.slice(0, index) + add + this.slice(index + count); }

/**
 * @param {string} syntax
 * @param {string} source
 * @param {object} opts
 */
export function MarbleTranspile(syntax, source, { mode = TranspileMode.REPLACE, segment = null, verbose = false, only_preprocess=false, only_parse=false, only_resolve_pat=false } = {}) { //opts as a dictionary of opts with defaults
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
    // ExportParsed(parse_tree, {path:'./gen/parse_tree.json'})
    // process.exit(1)
    if (verbose) info(`Parsed marble file. Size of parse tree object: [${sizeof(parse_tree)}] Bytes`)
    if (only_parse) error('Purposeful program termination to print parse tree:',parse_tree)

    //resolve the pattern tokens to a regex object
    parse_tree = ResolvePatternsToRegex(parse_tree)
    if (verbose) info(`Resolved patterns to regex`)
    // ExportParsed(parse_tree, {path:'./gen/parse_tree.json'})
    // process.exit(1)
    if (only_resolve_pat) error('Purposeful program termination to print parse tree after pattern resolve:', parse_tree)

    let output = ''
    //---Convert source lines with regex
    switch(mode){
        case TranspileMode.SINGLE:
            parse_tree.forEach((pair, i) => {
                pair.pat = RegExp(pair?.pat, 'm') || undefined //RegExp object .flags property only has a getter, so the only way to set the flags is to create a new object. Leave only the m flag

                if (pair.pat && pair.pat.test(source)) {
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
                    if (verbose) info(`Resolved pattern [${i}] target to output string`)
                }
            })
            break;
        case TranspileMode.REPLACE:
            output = source
            parse_tree.forEach((pair, i) => {
                let offset = 0 //the match all is an iterator, which should mean that it only does the match when the next iteration is called, 
                //but actually idfk what it does, bcs if i change the input string with the custom splice, then the match indexes are still the same as they were. Maybe since strings are immutable.
                //the matched string length is most likely a different length than the resolved string, so i offset the "match index" manually with this var, otherwise it cuts too early or too late in the string.

                for (const m of source.matchAll(pair.pat)) { //have to loop like this, bcs matchAll returns an iterator, which is useful for large input texts.
                    const resolve = ResolveTarget(pair.tar, m.groups || {})
                    output = output.splice(m.index + offset, m[0].length, resolve)
                    offset += resolve.length - m[0].length
                    if (verbose) info(`Resolved pattern [${i}] target to output string`)
                }
            })
            break;
        // case TranspileMode. ;break;
        default: error('Usupported transpilation mode!', mode)
    }

    if (verbose) info('Done transpiling')
    return output
}