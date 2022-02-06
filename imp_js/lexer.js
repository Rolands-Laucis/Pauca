// This script contains lexing functions for parsing the Marble file syntax - Pairer, tTokenizer, Linter, Linker, Builder
// "If you have a problem and you solve it with regex, you now have 2 problems." Marble uses only regex for these processes.

import { LinkPat, LinkTar } from "./linker.js" 
import {error} from './log.js'

/**
 * Expects the syntax text preprocessed without \n, i.e. the entire string is on a single line.
 * It then segments that into pairs of pattern and target strings
 * @param {string} text
 * @returns {object[]} pairs
 */
export function Pairer(text) {
    const pairs = []

    const re_pat = /((.|\n|\t|\r)*?\[end(\s\".*?\")?\])/m
    const re_target = /(\[target(\s\".*?\")?\](.|\n|\t|\r)*?\[\/target\])/m
    const re_target_start_tag = /(\[target(\s\".*?\")?\])/m
    const re_target_begin = /^(\[target(\s\".*?\")?\])/m
    const re_pat_end_tag = /(\[end(\s\".*?\")?\])/m

    let match = text.match(re_pat)
    if (!match)
        error('Could not find starting pattern block', match)
        

    while (match) {
        
        //save down the pattern
        const pat = match[0].trim().replace('\n', '') || null
        if (pat) {
            pairs.push({ 'pat': pat })
            //remove the extracted match
            text = text.replace(re_pat, '').trim()
        }else{
            error('Could not find starting pattern block', match)
        }

        if (pat && pat.match(re_target_start_tag))
            error('Target tag found in pattern sequence. Exiting...', pairs)

        //Now the text should begin with a target tag. save down the target
        if (!text.match(re_target_begin)) 
            error('No target tag after pattern match. Exiting...', pairs)

        match = text.match(re_target)
        if(!match){
            pairs[pairs.length - 1]['tar'] = {}
            //re-search for next iter
            match = text.match(re_pat)
            continue
        }

        const target = match[0].trim() || null

        if (target && target.match(re_pat_end_tag))
            error('End tag found in target sequence. Exiting...', pairs)

        if(target){
            pairs[pairs.length - 1]['tar'] = target
            //remove the extracted match
            text = text.replace(re_target, '').trim()
        }

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
    const re_tar_split_by_tag = /(\[[a-z/]+?(?:\s[\[\d\>\<\=\]]+)?\])/g

    //the map has to return an object, since the annonymous function body decleration has the same syntax as object decleration in javascript :(
    return pairs.map(p => { 
        return {
            //split pat string into array of [tag]. Then also remove the surrounding [] symbols from each tag
            'pat': p['pat'] ? p['pat'].match(re_tag).map(t => t.slice(1, -1)) : undefined,
            //from target extract its language and tokenize its body, splitting by [tag]
            'tar': p['tar'] ? {
                'lang': p['tar'] ? p['tar'].match(re_tar_lang).groups.lang : undefined,
                'body': p['tar'] ? p['tar'].match(re_tar_body).groups.body.split(re_tar_split_by_tag) : undefined
            } : undefined
        }
    })
}

/**
 * Expects a pairs object, where the pat and tar vals are arrays of tokens after the Tokenizer. 
 * It then lints some of the tokens - unique indexing the target block if/loop/etc. tags as code blocks - to better know where a block begins and ends
 * Unique indexing happens by a counter that just increments upon seeing a new block begining and a stack mechanism to ensure the closing tag has the same index as the starting
 * The index (number) is just prepended to the tag in its string. It can later easily be ignored or removed if need be.
 * @param {object[]} pairs
 * @returns {object[]} pairs
 */
export function Linter(pairs){
    const re_block_begin = /^\[(if|loop)/m //NOTE code block keywords
    const re_block_end = /^\[\/(if|loop)/m //NOTE code block keywords

    return pairs.map(p => {
        let counter = 0 //unique identifier - could be something fancier like a UUID or combination of counter + random ascii, but rly this just works
        const stack = [] //stack mechanism, whereby pushing and popping in the same order as source text keeps the structure of the source text blocks

        return {
            'pat': p['pat'] ? p['pat'] : undefined,
            'tar': p['tar'] ? {
                'lang': p['tar']['lang'] ? p['tar']['lang'] : undefined,
                'body': p['tar']['body'] ? p['tar']['body'].map(t => {
                    if (t.match(re_block_begin)) {
                        counter++
                        stack.push(counter)
                        return counter + t
                    } else if (t.match(re_block_end))
                        return stack.pop() + t
                    else
                        return t
                }) : undefined
            } : undefined
        }
    })
}

/**
 * Expects a pairs object, where the pat and tar vals are token arrays. 
 * It then maps a function call with its arguments for every token according to its functionality
 * Used to be called "Mapper", but really it just calls the Linker.js main functions. This might be a bit confusing to have a file Linker and a function Linker.
 * @param {object[]} pairs
 * @returns {object[]} pairs
 */
export function Linker(pairs){
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
export function Builder(pairs){
    return pairs
}

const All_Parsing_Steps = [Pairer, Tokenizer, Linter, Linker, Builder]
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