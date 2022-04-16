//this script contains functions for resolving (linking, rendering, executing) the parsed Pauca tree of tokens into a final single string to be writen as the output to a file.

import { error, TODO, log } from "./utils/log.js";
import { Token, TokenType } from "./token.js";
import { Grams } from "./grammar.js";

//-- /from grammar.js comments/ 
//every target FUN and BLOCK function basically just receives an input of tokens and a ctx object of the pair block, which would be filled in by the pat regex match.groups.
//and every function just resolves tokens down to strings (reduce) by calling nested FUN and BLOCK and VAR etc. functions here until those themselves reduce down to strings and all strings get concatenated,
//which then goes straight into the output.txt

/**
 * Used to resolve the target token block to a final output string.
 * CTX is the regex.match.groups object that contains labeled variables from the pattern
 * recursive, bcs calls Grams functions, some of which would call this function in their body.
 * @param {Token[]} tokens
 * @param {object} ctx
 * @returns {string} output
 */
export function RecursiveReduceToString(tokens = [], ctx = {}) {
    return tokens.reduce((s = '', t) => {
        switch (t.type) {
            case TokenType.STR: return s += t.val;
            case TokenType.VAR: return s += Grams.FUN.ctx(t, ctx);
            case TokenType.LIST: return s += Grams.FUN.list(t.val, ctx);
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
 * @returns {RegExp} regex
 */
export function ResolvePattern(tokens=[]){
    const full_string = tokens.reduce((s = '', t) => {
        switch (t.type) {
            case TokenType.FUN: return s += Grams.FUN[t.val]();
            case TokenType.LIST: 
                const list_tokens = t.val
                if (list_tokens.length > 2) TODO('currently only 1 pattern tag argument allowed. [current token; list_tokens]', t, list_tokens)
                // log(list_tokens)
                if (!Grams.FUN[list_tokens[0].val]) log(list_tokens[0])
                return s += Grams.FUN[list_tokens[0].val](...list_tokens.slice(1));
            case TokenType.NULL: error('Found NULL token!', t); break;
            default: return s; //BLOCKSTART and BLOCKEND types ignored.
            // case TokenType.: ; break;
        }
    }, '') 

    // console.log(full_string)
    return RegExp(full_string, 'gm')
}

/**
 * resolves each pair's pattern block to a regex object
 * @param {object[]} pairs
 */
export function ResolvePatternsToRegex(pairs=[]){
    return pairs.map(p => {
        return {
            pat: p.pat ? ResolvePattern(p.pat.val) : undefined,
            tar: p.tar
        }
    })
}

/**
 * @param {Token} tar_block
 * @param {object} ctx
 * @returns {string} output
 */
export function ResolveTarget(tar_block, ctx){
    return RecursiveReduceToString(tar_block.val, ctx)
}