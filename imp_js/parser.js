import { Token, TokenType } from './token.js'
import { TarGrams } from './grammar.js'
import { error } from './log.js'

let counter = 0 //unique identifier - could be something fancier like a UUID or combination of counter + random ascii, but rly this just works
const stack = [] //stack mechanism, whereby pushing and popping in the same order as source text keeps the structure of the source text blocks
Array.prototype.last = function () { return this[this.length - 1] } //for some reason this cant be an annonymous function

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
        } else {
            error('Could not find starting pattern block', match)
        }

        if (pat && pat.match(re_target_start_tag))
            error('Target tag found in pattern sequence. Exiting...', pairs)

        //Now the text should begin with a target tag. save down the target
        if (!text.match(re_target_begin))
            error('No target tag after pattern match. Exiting...', pairs)

        match = text.match(re_target)
        if (!match) {
            pairs[pairs.length - 1]['tar'] = {}
            //re-search for next iter
            match = text.match(re_pat)
            continue
        }

        const target = match[0].trim() || null

        if (target && target.match(re_pat_end_tag))
            error('End tag found in target sequence. Exiting...', pairs)

        if (target) {
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
    //the map has to return an object, since the annonymous function body decleration has the same syntax as object decleration in javascript :(
    return pairs.map(p => {
        return {
            //split pat string into array of [tag]. Then also remove the surrounding [] symbols from each tag
            pat: p.pat?.split(/\[.*?\]/g).map(t => t.slice(1, -1)) || undefined,
            tar: p.tar ? Tokenize(p.tar) : undefined
        }
    })
}

/**
 * Expects a target body string
 * It then converts these strings into more useful arrays of tokens
 * @param {string} str
 * @returns {object[]} tokens
 */
export function Tokenize(str, {ignore_ws=false} = {}){
    if (!str) return undefined

    //looks further into the string until a closing ] is found for the original opening [. Expects a string to be passed in
    function Peek(str) {
        let bracket_count = 1 //finds it via simple braket balacing algo. Starts at 1, bcs peek begins after a [ symbol has been detected
        for (let j = 1; j < str.length; j++) {
            if (str[j] == '[')
                bracket_count++
            else if (str[j] == ']') {
                bracket_count--;
                if (bracket_count == 0) { //when no more open brackets are left
                    return j
                }
            }
        }
        error('Did not find a closing ] symbol when peeking a list. Braket count unbalanced.', { str: str, open_brackets_left: bracket_count })
    }

    let tokens = []
    let col = '' //current chars collected from parsing

    function Add(str = col, t = TokenType.STR) { str ? tokens.push(new Token(str, t)) : null; col = '';}

    //said to be fastest current way to go through all chars https://stackoverflow.com/questions/1966476/how-can-i-process-each-letter-of-text-using-javascript
    for (let i = 0; i < str.length; i++) {
        switch(str[i]){
            case str[i].match(/[\n\r\t\s]/)?.input: if(!ignore_ws) col += str[i]; break; //dont accumulate white space symbols

            case '[': //starting a new list - [...]
                Add(); //add str token of whatever was before the new list

                const j = Peek(str.slice(i))//peek a few chars ahead and find where this particular [ ends with a ] then that string is recursively parsed into smaller tokens
                const list_str = str.slice(i + 1, i + j) //select the whole list string

                //a space or another [ would indicate the first chars is the name of a function for this list, otherwise it should be a variable name. I.e. [fun [x] ...] or [my_var]
                const list_type = list_str.replace(/[\n\r\s\t]+/, '').match(/[\[\"]/) //collapse spaces, just bcs. If this matches, then its a FUN, otherwise VAR

                switch (true) { //meaning true has to match one of the cases, so case expr have to resolve to true to execute
                    case list_str[0] == '/' && list_str[1] != ' '://if begins with a slash, then it is the end of a block. The space checks that its not a literal OP / FUN
                        Add(list_str, TokenType.BLOCKEND(stack.pop()))
                        break;
                    case list_type != null: //this is a list, so recursive parse down the arguments after the first part of the string, which would be the FUN token name asociated with this list and prepend that
                        const list_tokens = Tokenize(list_str.slice(list_type.index), { ignore_ws: true }) //recursively parse. Whitespaces inside lists should be ignored. Generate less tokens
                        
                        //a function can be a regular function to execute on some params, like an operation, but it can also designate a block that has a body, this destincion can be made by checking the grams of Marble
                        const FUN_str = str.slice(i + 1, i + list_type.index + 1)
                        if (Object.keys(TarGrams.BLOCK).includes(FUN_str)){
                            counter++; stack.push(counter); //console.log(stack); //stack and counter defined globally at the top of script
                            Add(FUN_str, TokenType.BLOCKSTART(stack.last()))//insert the blockstart token
                            Add(list_tokens, TokenType.ARGS) //blockstarts are currently always functions, so the lists within are the function arguments, which is still just a LIST token, but there may later be blockstarts that arent functions and therefor would have LIST here instead of ARGS
                        }
                        else
                            Add([new Token(FUN_str, Object.keys(TarGrams.OP).includes(FUN_str) ? TokenType.OP : TokenType.FUN), ...list_tokens], TokenType.LIST) //insert the FUN or OP token at the start of the list. LIST types indicate that this token's val property is an array of other tokens
                        break;
                    case Object.keys(TarGrams.BLOCK).includes(list_str): //a block without ARGS
                        counter++; stack.push(counter);//stack and counter defined globally at the top of script
                        Add(list_str, TokenType.BLOCKSTART(stack.last()))
                        break;
                    default:
                        Add(list_str, TokenType.VAR)
                        break;
                }
                i += j //skip over the peeked string
                break; //and end this case

            //base case just add the chars to the string, since they arent important
            default: col += str[i]; break;
        }
    }
    Add() //handling end of string last collected

    return tokens
}


/**
 * Expects a pairs object, where the pat and tar vals are tokenized. 
 * Wraps target raw block start and end and body tokens into a single BLOCK token
 * @param {object[]} pairs
 * @returns {object[]} pairs
 */
export function BlockWrapper(pairs){

    /**
     * @param {Token[]} tokens
     * @param {number} id
     * @returns {Token[]} tokens
     */
    function Wrap(tokens, id = 0){
        for(let i = 0; i < tokens.length; i++){
            const t = tokens[i]
            // console.log(t.type.name, t.val, `i:${i}`)
            if (t.type.name == 'BLOCKSTART') {
                for (let j = 1; j < tokens.length - i; j++) {
                    // console.log('inner', tokens[i + j].type.name, tokens[i + j].val, `j:${j}`)
                    if (tokens[i + j].type.name == 'BLOCKEND' && t.type.id == tokens[i + j].type.id) {
                        tokens.splice(i, j+1, new Token([t, ...Wrap(tokens.slice(i+1, i + j), t.type.id), tokens[i + j]], TokenType.BLOCK)) //splice goes to index i, then deletes the next j+1 elements, then inserts a new BLOCK token at that place, but that BLOCK token is recursively parsed the same way
                        break
                    }
                }
            }
        }
        return tokens
    }

    return pairs.map(p => {
        return {
            pat: p.pat || undefined,
            tar: p.tar ? Wrap(p.tar) : undefined
        }
    })
}

/**
 * Expects the syntax text preprocessed without \n, i.e. the entire string is on a single line
 * @param {string} text
 * @param {Function[]} steps
 * @returns {object[]} pairs
 */
export function Parse(text, steps = [Pairer, Tokenizer, BlockWrapper]) { //
    steps.unshift(text) //insert the text as the first element, so that we can just use the reduce function to apply all steps
    return steps.reduce((text, f) => f(text))
}