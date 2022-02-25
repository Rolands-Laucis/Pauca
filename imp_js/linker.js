// this script holds the functions of marble syntax grammar - links tokens (lexemes) to functional grams (computer linguistic grams) in the Marble grammar.
// i.e. links a token to its corresponding method to be called when the regex needs to be generated or an action needs to be taken

import {error} from './log.js'

const verbose = false

//?: means non-capturing group
//can write string literals of regex that it should cast to
//can write lambda functions, that will be called
//can write function names, that are defined somewhere later in the script
export const pat_grams = {
    'n': '^',
    'c': '',
    'i': '([\t\s]+)',
    'sym': (str, opt = false) => `(?:${str})` + (opt ? '?' : ''),
    '': (str, opt = false) => `(?:${str})` + (opt ? '?' : ''),
    'var': (label = '', opt = false) => (label ? `(?<${label}>[a-zA-Z\\d_]+)` : `([a-zA-Z\\d_]+)`) + (opt ? '?' : ''),
    'rec': '(',
    '/rec': ')+',
    're': (str) => str.match(/\/(?<exp>.*)\/(a-zA-Z{0,5})?/).groups.exp,
    'end': (label = '') => '$',

    //shorthands
    's': '(?: )',
    ';': '(?:;)'
}

export const tar_grams = {
    'ctx': (ctx, val) => ResolveFromContext(ctx, val),
    'cond': (ctx, op, a, b) => opr(ctx, op, a, b),
    'if': (cond, nest) => tar_grams['cond'](...cond.slice(1)) ? nest : '',
    'loop': (count, nest) => Array(count).fill(nest)
    
}

export const ops = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => Math.floor(a / b),

    '==': (a, b) => a === b,
    '>': (a, b) => a > b,
    '<': (a, b) => a < b,
    '>=': (a, b) => a >= b,
    '<=': (a, b) => a <= b
};

const re_tag_name = /^[a-zA-Z/]+/m

/**
 * Expects a token as a string, which should be 1 tag, 
 * It then links a method with its arguments for the token according to its functionality
 * @param {string} token
 * @returns {Array} f
 */
export function LinkPatToken(token){
    const tag_name = token.match(re_tag_name) || ''

    if (!(tag_name in pat_grams))
        error('Unrecognized tag name! Exiting...', tag_name)

    const linked_func = pat_grams[tag_name]

    if (typeof (linked_func) == 'string') //if its not a function, then it must be a string, so just use that, and no need for args
        return [linked_func]
        
    let args = token.replace(re_tag_name, '').trim().split(',') //TODO this would mean that , cannot be used inside labels. NOTE looks like supplying more args to a func than it supports, has no negative effect, so no need to check arg lenth
    args = args.map(a => isNaN(parseInt(a)) ? a.replace(/"/g, '') : parseInt(a)) //turn number strings into numbers

    return args.every(a => a != '') ? [linked_func, ...args] : [linked_func] //edge case for when args is [''] - an empty string. Makes it difficult to test
}

/**
 * Expects a token as a string, which should be 1 tag, 
 * It then links a method with its arguments for the token according to its functionality
 * @param {string[]} tokens
 * @returns {Array} f
 */
export function LinkPat(tokens){ return tokens.map(t => LinkPatToken(t))}

const re_tar_var_tag = /^\[[\w_]+\]/m
const re_tar_tag = /^\[(?<f>[a-zA-Z_+\-\/*=<>]+)\s(?<args>[\w\[\]\s,]+)\]/m
const re_tar_block_begin_tag = /^(?<index>\d+)\[(?<f>if|loop)\s(?<args>.+)\]/m //NOTE code block keywords

/**
 * Expects a token array, 
 * It then links a method with its arguments for each token or block of tokens according to its functionality
 * @param {string[]} tokens
 * @returns {Array} f
 */
export function LinkTar(tokens){
    const tree = []

    for(let i = 0; i < tokens.length; i++){
        if (tokens[i].match(re_tar_var_tag)) //found variable tag in target
            tree.push([tar_grams['ctx'], tokens[i]])

        else if (tokens[i].match(re_tar_block_begin_tag)){ //found the begining of a code block, so gonna have to recursively link the inside of it
            const match = tokens[i].match(re_tar_block_begin_tag)
            const name = match.groups.f
            const skip_to = tokens.indexOf(`${match.groups.index}[/${name}]`)

            if (skip_to == -1)
                error(`Didnt find ending tag with index ${match.groups.index}. Tokens in this function call:`, tokens)

            tree.push([tar_grams[name], LinkCond(match.groups.args), LinkTar(tokens.slice(i + 1, skip_to))])

            i = skip_to //this is why this loop needs to be a regular for loop
        }
        else if (tokens[i].match(re_tar_tag)) //found any regular target tag in target
            tree.push(LinkTarTag(tokens[i].match(re_tar_tag).groups.f, tokens[i].match(re_tar_tag).groups.args))

        else //prob just a string, meaning literally put this token in the output and no action needed
            tree.push(tokens[i])
    }

    return tree
}

const re_cond = /(?<op1>[\w_\[\]]+)\s?(?<opr>[><=]{1,2})\s?(?<op2>[\w_\[\]]+)/ 
//some
/**
 * Expects string of a condition to be evalueate, like "[1]>2"
 * Parses it to the corresponding oprerator function with corresponding operands from the string
 * @param {string} cond
 * @returns {Array} f
 */
export function LinkCond(cond){
    const match = cond.match(re_cond)
    if(match)
        if(match.groups.opr in ops)
            return [opr, match.groups.opr, match.groups.op1, match.groups.op2]
        else
            error(`Invalid operator [${match.groups.opr}] in condition evaluation!`, cond)
    else if(cond.match(/\d+/))
        return parseInt(cond.match(/\d+/)[0])
    else
        error(`Could not parse condition, since it is not a valid condition expression signature/format!`, cond)
}

const re_tar_tag_args = /([,\s])/m //TODO this does not support correct splitting of args, if an arg is of type string and has a space in the string

/**
 * Expects string that is the name of the tag and then space or comma delimited args to it
 * Parses it to the corresponding oprerator function with corresponding operands from the string
 * @param {string} f
 * @returns {string} args
 */
export function LinkTarTag(f, args){
    args = args.split(re_tar_tag_args).filter((a) => a != ' ' && a != '')

    if(f in ops && args.length >= 2)
        return [opr, f, args[0], args[1]]
    else if (f in tar_grams)
        return [tar_grams[f], ...args]
    else
        error('Target tag not recognized!', [f, args], exit=true)
}

export function opr(ctx, op, a, b) {
    if (!(op in ops))
        error(`Unsupported operand [${op}] with args [${a}] [${b}]! Has context [${ctx}]. Exiting...`)

    a = ResolveFromContext(ctx, a)
    b = ResolveFromContext(ctx, b)
    if (verbose) console.log(`${a} ${op} ${b} = ${ops[op](a, b)}`)
    return ops[op](a, b)
}

const re_tar_var_ind = /\[(\d+)\]/
const re_tar_var_label = /\[([a-zA-Z_]+)\]/

/**
 * Expects a regex match array as the context.
 * Resolves the target tag value as a string. Resolving, because there can be a labeled [my_var] and unlabeled [1] tag or int and string literals.
 * @param {RegExpMatchArray} ctx
 * @param {string|number} val
 * @returns {string} regex
 */
export function ResolveFromContext(ctx, val) {
    if (isNaN(val) && val.match(re_tar_var_label))
        return ctx.groups[val.match(re_tar_var_label)[1]]
    else if (isNaN(val) && val.match(re_tar_var_ind))
        return ctx[val.match(re_tar_var_ind)[1]]
    else
        return parseInt(val) ? parseInt(val) : val
}

/**
 * Expects tags array, where the first element of a tag is a the tag function and the others are args to it. Calls the function with its args and returns a regex object
 * @param {Array} tags
 * @returns {RegExp} regex
 */
export function CastPatToRegex(tags) {
    return RegExp(tags.map(t => typeof (t[0]) == 'function' ? t[0](...t.slice(1)) : t[0]).join(''), 'm')
    //https://stackoverflow.com/questions/185510/how-can-i-concatenate-regex-literals-in-javascript
}

/**
 * Expects a tag as an array, where the first element is a the tag function and the others are args to it. Calls the function with its args and returns a regex object
 * @param {Array} tag
 * @returns {RegExp} regex
 */
export function CastTagToRegex(tag) {
    return RegExp((typeof (tag[0]) == 'function' ? tag[0](...tag.slice(1)) : tag[0]), 'm')
}

/**
 * Inserts (recursively) the regex match object as the context (ctx) into all the functions of the pair.tar object, that need it.
 * @param {Array} target
 * @param {RegExpMatchArray} ctx
 * @returns {Array} tree
 */
export function ContextualizeTargetTags(target, ctx){
    const tree = []
    target.forEach((t,i) => {
        if(verbose) console.log(typeof(t))
        if(typeof(t) == 'function' && [tar_grams.cond, tar_grams.ctx, opr].includes(t))
            tree.push(t, ctx)
        else if(typeof(t) == 'object') //array
            tree.push(ContextualizeTargetTags(t, ctx))
        else if (typeof (t) == 'string' || typeof (t) == 'number' || (typeof (t) == 'function' && [tar_grams.if, tar_grams.loop].includes(t)))
            tree.push(t)
        else
            error(`U dun fucked up now, idk what u did, but the current token (${JSON.stringify(t)}|${typeof(t)}) in the target tag parse tree is not a function, object or string. Fix it.`, t, true)
    })
    return tree
}

/**
 * Traverses (recursively) the target object and calls the functions in it to generate a single string to be written into the output file
 * @param {Array} target
 * @returns {string} output
 */
export function ResolveTarget(target){
    let str = ''
    for(let i = 0; i < target.length; i++){
        const t = target[i]
        if (i > 0 && typeof (t) == 'object' && t.groups) //this means the current element is the context for the function call, so skip this. typeof (target[i - 1]) == 'function'
            str += ''
        else if (typeof (t) == 'function'){
            if (verbose) console.log(`calling function [${t.name}] with arg count [${target.slice(i + 1).length}]`)
            const gen = t(...target.slice(i + 1))
            if(typeof(gen) == 'string')
                return str + gen
            else if (typeof (gen) == 'object')
                return str + ResolveTarget(gen)
        }
        else if (typeof (t) == 'string')
            str += t
        else if (typeof (t) == 'object')
            str += ResolveTarget(t)
        else
            error(`U dun fucked up now, idk what u did, but the current [${i}] token (${JSON.stringify(t)}|${typeof (t)}) in the target tag parse tree is not a function, object or string. Fix it.`, t, true)
    }
    return str
}