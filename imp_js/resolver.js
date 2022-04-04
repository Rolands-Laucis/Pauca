//this script contains functions for resolving (linking, rendering, executing) the parsed Marble tree of tokens into a final single string to be writen as the output to a file.

import { error, TODO } from "./log.js";
import { Token, TokenType } from "./token.js";
import { Grams } from "./grammar.js";

//-- /from grammar.js comments/ 
//every target FUN and BLOCK function basically just receives an input of tokens and a ctx object of the pair block, which would be filled in by the pat regex match.groups.
//and every function just resolves tokens down to strings (reduce) by calling nested FUN and BLOCK and VAR etc. functions here until those themselves reduce down to strings and all strings get concatenated,
//which then goes straight into the output.txt

/**
 * @param {Token[]} tokens
 * @param {object} ctx
 * @returns {string} output
 */
export function RecursiveReduceToString(tokens = [], ctx = {}) {
    return tokens.reduce((s = '', t) => {
        switch (t.type) {
            case TokenType.STR: return s += t.val;
            case TokenType.VAR: return s += ctx[t.val];
            case TokenType.LIST://first item in a list is always a function
                switch (t.val[0].type) {
                    case TokenType.OP: return s += (Grams.OP[t.val[0].val](Grams.FUN.ctx(t.val[1], ctx), Grams.FUN.ctx(t.val[2], ctx))).toString();//TODO no reason why this should only be 2. Could use the ...spread args syntax to apply the operator on infinite operands
                    case TokenType.FUN: return TODO('FUN Token resolution not supported'); //Grams.FUN[t.val[0].val]()
                    default: TODO('unsuported token in Recursive reduction list', t.val[0]); break;
                }; break;
            case TokenType.BLOCK:
                return s += Grams.BLOCK[t.val[0].val](t.val.slice(2, -1), ctx, t.val[1].type == TokenType.ARGS ? t.val[1].val : t.val[1])
            case TokenType.NULL: error('Found NULL token!', t); break;
            default: return s; //BLOCKSTART and BLOCKEND types ignored.
            // case TokenType.: ; break;
        }
    }, '') //initial value is an empty string
}

/**
 * @param {Token[]} tokens
 * @param {object} ctx
 * @returns {string} output
 */
export function ResolveCondition(tokens = [], ctx = {}){
    
}