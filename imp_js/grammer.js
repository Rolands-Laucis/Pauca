// this script holds the functions of marble syntax grammar - links tokens to functional grams (linguistic grams)
// i.e. links a token to its corresponding method to be called when the regex needs to be generated

const pat_grams = {
    'n': new_line,
    'c': none,
    'i': indent,
    'sym': sym,
    'var': var_tag,
    'end' : end
}

const tar_grams = {
    '+': add
}

/**
 * Expects a token as a string, which should be 1 tag, it then links a method with its arguments for the token according to its functionality
 * @param {string} token
 * @param {object} grams - which set of grams to test for? Pattern tokens are different from target tokens.
 * @returns {Array} f
 */
export function LinkPat(token){
    try{
        const tag_name = token.split(' "')[0]
        if (!(tag_name in pat_grams)){
            console.error('Unrecognized tag name! Exiting...')
            process.exit(1)
        }
        let args = token.split(' ').slice(1).join(' ').split(',') //TODO this would mean that , cannot be used inside labels
        if (args.length > pat_grams[tag_name].length){
            console.error('Tag has more args than the function supports! Exiting...')
            process.exit(1)
        }
        args = args.map(a => isNaN(parseInt(a)) ? a.replace(/"/g, '') : parseInt(a)) //turn number strings into numbers

        return [pat_grams[tag_name], ...args] //tag_name in grams ? [grams[tag_name], ...args] : []
    }catch (e){
        console.log(token)
        console.error(e)
        process.exit(1)
    }
}

export function LinkTar(token){
    return token
    try {
        const tag_name = token.split(' "')[0]
        
    } catch (e) {
        console.log(token)
        console.error(e)
        process.exit(1)
    }
}

//----generic tags
function none() { }

//----pattern tags

/**
 * Expects a tag as an array, where the first element is a the tag function and the others are args to it. Calls the function with its args and returns a regex object
 * @param {Array} tag
 * @returns {RegExp} regex
 */
export function CastToRegex(tag){
    return RegExp(tag.map(t => t[0](...t.slice(1))).join(''), 'm')
}

//https://stackoverflow.com/questions/185510/how-can-i-concatenate-regex-literals-in-javascript

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

//--basic tags
function sym(str, opt = false){
    return `(${str})` + (opt ? '?' : '')
}

function var_tag(label = '', opt = false){
    return (label ? `(?<${label}>[a-zA-Z_]+)` : `([a-zA-Z_]+)`) + (opt ? '?' : '')
}

//-----target tags

function add(a, b){
    //try to parse as int literals, else look for these vars in the current match by label
    return 0
}