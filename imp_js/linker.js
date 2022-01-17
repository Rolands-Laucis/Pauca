// this script holds the functions of marble syntax grammar - links tokens (lexemes) to functional grams (computer linguistic grams) in the Marble grammar.
// i.e. links a token to its corresponding method to be called when the regex needs to be generated or an action needs to be taken

export const pat_grams = {
    'n': new_line,
    'c': none,
    'i': indent,
    'sym': sym,
    '': sym,
    'var': var_tag,
    'rec': rec_start,
    '/rec': rec_end,
    'end' : none
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
 * @param {number} index
 * @returns {Array} f
 */
export function LinkPat(token, index = 1){
    const tag_name = token.match(re_tag_name) || ''
    // console.log(tag_name)
    if (!(tag_name in pat_grams)){
        console.error('Unrecognized tag name! Exiting...')
        process.exit(1)
    }
    let args = token.replace(re_tag_name, '').trim().split(',') //TODO this would mean that , cannot be used inside labels. NOTE looks like supplying more args to a func than it supports, has no negative effect, so no need to check arg lenth
    args = args.map(a => isNaN(parseInt(a)) ? a.replace(/"/g, '') : parseInt(a)) //turn number strings into numbers

    return args.every(a => a != '') ? [pat_grams[tag_name], ...args] : [pat_grams[tag_name]] //edge case for when args is [''] - an empty string. Makes it difficult to test
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
    return RegExp(tags.map(t => t[0](...t.slice(1))).join(''), 'm')
    //https://stackoverflow.com/questions/185510/how-can-i-concatenate-regex-literals-in-javascript
}

/**
 * Expects a tag as an array, where the first element is a the tag function and the others are args to it. Calls the function with its args and returns a regex object
 * @param {Array} tag
 * @returns {RegExp} regex
 */
export function CastTagToRegex(tag) {
    return RegExp(tag[0](...tag.slice(1)), 'm')
}

//----pattern tags

//----generic tags
function none() { return '' }

//--pre and post tags
function new_line(){
    return '^'
}

function indent(){
    return '([\t\s]+)'
}

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

function rec_start(){
    return '('
}

function rec_end() {
    return ')+'
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

// function add(ctx, a, b){ return opr(ctx, a, b, '+') }
// function sub(ctx, a, b) { return opr(ctx, a, b, '-') }
// function div(ctx, a, b) { return opr(ctx, a, b, '/') }
// function mul(ctx, a, b) { return opr(ctx, a, b, '*') }
// function eq(ctx, a, b) { return opr(ctx, a, b, '==') }
// function (ctx, a, b) { return opr(ctx, a, b, '>') }
// function add(ctx, a, b) { return opr(ctx, a, b, '<') }
// function add(ctx, a, b) { return opr(ctx, a, b, '>=') }
// function add(ctx, a, b) { return opr(ctx, a, b, '<=') }