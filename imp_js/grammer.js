// this script holds the functions of marble syntax grammar - links tokens to functional grams (linguistic grams)
// i.e. links a token to its corresponding method to be called when the regex needs to be generated

const grams = {
    'sym': sym,
    'var': var_tag,
    'end' : end
}

/**
 * Expects a token as a string, which should be 1 tag, it then links a method with its arguments for the token according to its functionality
 * @param {string} token
 * @returns {Array} f
 */
export function Link(token){
    try{
        const tag_name = token.split(' "')[0]
        let args = token.split(' ').slice(1).join(' ').split(',') //TODO this would mean that , cannot be used inside labels
        args = args.map(a => isNaN(parseInt(a)) ? a.replace(/"/g, '') : parseInt(a)) //turn number strings into numbers

        return tag_name in grams ? [grams[tag_name], ...args] : []
    }catch (e){
        console.log(token)
        console.error(e)
        process.exit(1)
    }
}

/**
 * Expects a tag as an array, where the first element is a the tag function and the others are args to it. Calls the function with its args and returns a regex object
 * @param {Array} tag
 * @returns {RegExp} regex
 */
export function CastToRegex(tag){
    return RegExp(tag.map(t => t[0](...t.slice(1))).join(''), 'm')
}

//https://stackoverflow.com/questions/185510/how-can-i-concatenate-regex-literals-in-javascript

function end(label = ''){
    return '$'
}

function sym(str, opt = false){
    return `(${str})` + (opt ? '?' : '')
}

function var_tag(label = '', opt = false){
    return (label ? `(?<${label}>[a-zA-Z_]+)` : `([a-zA-Z_]+)`) + (opt ? '?' : '')
}