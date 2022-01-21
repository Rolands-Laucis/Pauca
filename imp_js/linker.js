// this script holds the functions of marble syntax grammar - links tokens (lexemes) to functional grams (computer linguistic grams) in the Marble grammar.
// i.e. links a token to its corresponding method to be called when the regex needs to be generated or an action needs to be taken

import {error} from './log.js'

export const pat_grams = {
    'n': '^',
    'c': '',
    'i': '([\t\s]+)',
    'sym': sym,
    '': sym,
    's': '(?: )',
    'var': var_tag,
    'rec': '(',
    '/rec': ')+',
    'end': end
}

const tar_grams = {
    '+': opr
}

const re_tag_name = /^[a-z/]+/m
const re_tar_var_ind = /\[([0-9]+)\]/
const re_tar_var_label = /"[a-z_]+"/

/**
 * Expects a token as a string, which should be 1 tag, it then links a method with its arguments for the token according to its functionality
 * @param {string} token
 * @returns {Array} f
 */
export function LinkPat(token){
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

export function LinkTar(token){
    return token
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

//----pattern tags

//----generic tags

function end(label = ''){
    return '$'
}

//--pattern tags
function sym(str, opt = false){
    return `(?:${str})` + (opt ? '?' : '') //?: means non-capturing group
}

function var_tag(label = '', opt = false){
    return (label ? `(?<${label}>[a-zA-Z_]+)` : `([a-zA-Z_]+)`) + (opt ? '?' : '')
}

//-----target tags
/**
 * Expects a regex match array as the context.
 * Resolves the target tag value as a string. Resolving, because there can be a labeled ["my_var"] and unlabeled [1] tag or int and string literals.
 * @param {RegExpMatchArray} ctx
 * @param {string|number} val
 * @returns {string} regex
 */
export function ResolveFromContext(ctx, val) {
    // val = parseInt(val) ? parseInt(val) : val //even if the string contains a number, convert to number

    if (isNaN(val) && val.match(re_tar_var_label))
        return ctx[val.match(re_tar_var_label)[1]]
    else if (isNaN(val) && val.match(re_tar_var_ind))
        return ctx[val.match(re_tar_var_ind)[1]]
    else
        return parseInt(val) ? parseInt(val) : val
}

function opr(ctx, a, b, op) {
    //try to parse as int literals, else look for these vars in the current match by label
    a = ResolveFromContext(ctx, a)
    b = ResolveFromContext(ctx, b)

    if (op == '+')
        return a + b
    else if (op == '-')
        return a - b
    else if (op == '/')
        return Math.floor(a / b)
    else if (op == '*')
        return a * b
    else if (op == '==')
        return a == b
    else if (op == '>')
        return a > b
    else if (op == '<')
        return a < b
    else if (op == '>=')
        return a >= b
    else if (op == '<=')
        return a <= b
}