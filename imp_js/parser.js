import { Token, TokenType } from './token.js'
import { Grams } from './grammar.js'
import { error } from './log.js'

//these need to be outside the scope of Tokenize function, since it is recursive and uses these. Could also define these as static inside a Token enum, but does that make sense? idk. I dont like them being global here tho
let counter = 0 //unique identifier - could be something fancier like a UUID or combination of counter + random ascii, but rly this just works
const stack = [] //stack mechanism, whereby pushing and popping in the same order as source text keeps the structure of the source text blocks
Array.prototype.last = function () { return this[this.length - 1] } //for some reason this cant be an annonymous function

/**
 * Expects a target body string
 * It then converts these strings into more useful arrays of tokens
 * @param {string} str
 * @returns {Token[]} tokens
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
                        if (Object.keys(Grams.BLOCK).includes(FUN_str)){
                            counter++; stack.push(counter); //console.log(stack); //stack and counter defined globally at the top of script
                            Add(FUN_str, TokenType.BLOCKSTART(stack.last()))//insert the blockstart token
                            Add(list_tokens, TokenType.ARGS) //blockstarts are currently always functions, so the lists within are the function arguments, which is still just a LIST token, but there may later be blockstarts that arent functions and therefor would have LIST here instead of ARGS
                        }
                        else
                            Add([new Token(FUN_str, Object.keys(Grams.OP).includes(FUN_str) ? TokenType.OP : TokenType.FUN), ...list_tokens], TokenType.LIST) //insert the FUN or OP token at the start of the list. LIST types indicate that this token's val property is an array of other tokens
                        break;
                    case Object.keys(Grams.BLOCK).includes(list_str): //a block without ARGS
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
 * @param {Token[]} tokens
 * @returns {Token[]} blocks
 */
export function WrapBlocks(tokens){
    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i]
        // console.log(t.type.name, t.val, `i:${i}`)
        if (t.type.name == 'BLOCKSTART') {
            for (let j = 1; j < tokens.length - i; j++) {
                // console.log('inner', tokens[i + j].type.name, tokens[i + j].val, `j:${j}`)
                if (tokens[i + j].type.name == 'BLOCKEND' && t.type.id == tokens[i + j].type.id) {
                    tokens.splice(i, j + 1, new Token([t, ...WrapBlocks(tokens.slice(i + 1, i + j)), tokens[i + j]], TokenType.BLOCK)) //splice goes to index i, then deletes the next j+1 elements, then inserts a new BLOCK token at that place, but that BLOCK token is recursively parsed the same way
                    break
                }
            }
        }
    }
    return tokens
}

/**
 * Expects an array of BLOCK tokens, some of which may be components, patterns or targets
 * This function organizes them into correct pairs of blocks, since patterns must have targets
 * @param {Token[]} blocks
 * @returns {Array} pairs
 */
export function Pair(blocks) {
    blocks = blocks.filter(b => b.type == TokenType.BLOCK) //keep only BLOCK tokens, bcs there might be anything between them
    const pairs = []
    const Add = ({ pat = undefined, tar=undefined, comp=false } = {}) => pairs.push({pat:pat, tar:tar, comp:comp})

    for(let i = 0; i < blocks.length; i++){
        const b = blocks[i]
        if (b.type == TokenType.BLOCK) //current token is a BLOCk
            switch(b.val[0].val){//BLOCKs val is a LIST, where the first and last token are BLOCK start and end tokens.
                case 'c': Add({pat:b, comp:true});break;
                case 'p':
                    Add({ pat: b, tar: blocks[i+1]})
                    i += 1;
                    break;
                default: error('Pairing has gone wrong. Possibly have not skipped over a target block. Current BLOCKs first BLOCKSTART token:', b.val[0])
            }
    }
    return pairs
}

/**
 * Expects the syntax text preprocessed without \n, i.e. the entire string is on a single line
 * @param {string} text
 * @param {Function[]} steps
 * @returns {object[]} pairs
 */
export function Parse(text, steps = [Tokenize, WrapBlocks, Pair]) { //
    steps.unshift(text) //insert the text as the first element, so that we can just use the reduce function to apply all steps
    return steps.reduce((text, f) => f(text))
}