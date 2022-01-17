// This script contains lexing functions for parsing the Marble file syntax - "pairer", tokenizer

import { LinkPat, LinkTar } from "./linker.js" 

/**
 * Expects the syntax text preprocessed without \n, i.e. the entire string is on a single line.
 * It then segments that into pairs of pattern and target strings
 * @param {string} text
 * @returns {object[]} pairs
 */
export function Pairer(text) {
    const pairs = []

    const re_pat = /(.*?\[end(\s\".*?\")?\])/m
    const re_target = /(\[target(\s\".*?\")?\].*?\[\/target\])/m
    const re_target_start_tag = /(\[target(\s\".*?\")?\])/m
    const re_target_begin = /^(\[target(\s\".*?\")?\])/m
    const re_pat_end_tag = /(\[end(\s\".*?\")?\])/m

    let match = text.match(re_pat)
    while (match) {
        if (!match) {
            console.log(text)
            console.log(pairs)
        }
        //save down the pattern
        const pat = match[0].trim() //Object.values(match).join(' ')
        if (pat.match(re_target_start_tag)) { //make sure no conflictions in parsing
            console.log('Target tag found in pattern sequence. Exiting...')
            console.log(pairs)
            process.exit(1)
        }
        pairs.push({ 'pat': pat }) //match.groups.pat + match.groups.tail
        //remove the extracted match
        text = text.replace(re_pat, '').trim()

        //Now the text should begin with a target tag. save down the target
        if (!text.match(re_target_begin)) {
            console.log('No target tag after pattern match. Exiting...')
            console.log(text)
            console.log(pairs)
            process.exit(1)
        }
        match = text.match(re_target)
        const target = match[0].trim() //Object.values(match.groups).join(' ')
        if (target.match(re_pat_end_tag)) { //make sure no conflictions in parsing
            console.log('End tag found in target sequence. Exiting...')
            console.log(pairs)
            process.exit(1)
        }
        // console.log(pairs[pairs.length - 1])
        pairs[pairs.length - 1]['tar'] = target
        //remove the extracted match
        text = text.replace(re_target, '').trim()

        //re-search for next iter
        match = text.match(re_pat)
    }

    return pairs
}

/**
 * Expects a pairs object, where the pat and tar vals are a string. 
 * It then converts these strings into more useful arrays of tokens
 * @param {object[]} pairs
 * @returns {object[]} pairs
 */
export function Tokenizer(pairs) {
    const re_tag = /\[.*?\]/g
    const re_tar_lang = /\[target\s?("(?<lang>.*?)")?\]/
    const re_tar_body = /\[target(\s".*?")?\](?<body>.*?)\[\/target\]/
    const re_tar_split_by_tag = /(\[.+?\])/g

    //the map has to return an object, since the annonymous function body decleration has the same syntax as object decleration in javascript :(
    return pairs.map(p => { 
        return {
            //split pat string into array of [tag]. Then also remove the surrounding [] symbols from each tag
            'pat': p['pat'].match(re_tag).map(t => t.slice(1, -1)),
            //from target extract its language and tokenize its body, splitting by [tag]
            'tar': {
                'lang': p['tar'].match(re_tar_lang).groups.lang || '',
                'body': p['tar'].match(re_tar_body).groups.body.split(re_tar_split_by_tag) || ''
            }
        }
    })
}


/**
 * Expects a pairs object, where the pat and tar vals are token arrays. 
 * It then maps a function call with its arguments for every token according to its functionality
 * @param {object[]} pairs
 * @returns {object[]} pairs
 */
export function Mapper(pairs){
    return pairs.map(p => {
        return {
            'pat': p['pat'].map(token => LinkPat(token)),
            'tar': p['tar']//.map(token => LinkTar(token))
        }
    })
}

/**
 * Expects a pairs object, where the pat and tar vals are funtion+args arrays. 
 * It then resolves (links, builds) the full pattern function calls recursively from nested pattern component references
 * @param {object[]} pairs
 * @returns {object[]} pairs
 */
export function Linker(pairs){
    return pairs
}

const All_Parsing_Steps = [Pairer, Tokenizer, Mapper, Linker]
/**
 * Expects the syntax text preprocessed without \n, i.e. the entire string is on a single line
 * @param {string} text
 * @param {Function[]} steps
 * @returns {Array} pairs
 */
export function Parse(text, steps = All_Parsing_Steps){
    steps.unshift(text) //insert the text as the first element, so that we can just use the reduce function to apply all steps
    return steps.reduce((text, f) => f(text))
}