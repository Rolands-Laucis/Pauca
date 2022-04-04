//this script contains the grammar dictionary for the Marble language.
//it defines every meaningful keyword reserved by Marble and its functionality.

import { error, TODO } from "./log.js";
import { RecursiveReduceToString } from './resolver.js'
import { Token, TokenType } from "./token.js"; //for ES linting

//?: means non-capturing group
//can write string literals of regex that it should cast to
//can write lambda functions, that will be called
//can write function names, that are defined somewhere later in the script

//every target FUN and BLOCK function basically just receives an input of tokens and a ctx object of the pair block, which would be filled in by the pat regex match.groups.
//and every function just resolves tokens down to strings (reduce) by calling nested FUN and BLOCK and VAR etc. functions here until those themselves reduce down to strings and all strings get concatenated, 
//which then goes straight into the output.txt
//the resolving is called here, but the logic for it is defined in the resolver.js , bcs that logic should be seperate, but since infinite recursion is supported, then the chain has to start from here, if that makes sense


export const Grams = {
    FUN:{
        //PAT
        //pre-tags:
        n: () => '^',
        i: () => '(?<indent>[\t\s]+)',

        //regular
        sym: (str, opt = false) => `(?:${str})` + (opt ? '?' : ''),
        var: (label = '', opt = false) => (label ? `(?<${label}>[a-zA-Z\\d_]+)` : `([a-zA-Z\\d_]+)`) + (opt ? '?' : ''),
        rec: () => '(',
        '/rec': () => ')+',
        re: (str) => str.match(/\/(?<exp>.*)\/(a-zA-Z{0,5})?/).groups.exp,

        //shorthands
        s: () => '(?: )',
        ';': () => '(?:;)',

        //TAR
        /**
         * @param {Token} arg
         * @param {object} ctx
         */
        ctx: (arg, ctx = {}) => {
            const num = parseInt(arg.val);
            // console.log(arg, num, ctx[arg.val])
            switch(arg.type){
                case TokenType.VAR:
                    if (!isNaN(num)) //meaning this is a number, cant just check num, bcs it might be 0, which isnt truthy! Grab by index in pattern
                        return Object.values(ctx)[num] //TODO this needs an efficient error case handling, when the index might be out of bounds!
                    else //grab by label in pattern
                        return ctx.hasOwnProperty(arg.val) ? ctx[arg.val] : error('Variable accessed without declaration! [variable tag; pattern context]', arg, ctx);
                case TokenType.STR: //its a string literal for a number
                    return num ? num : error('String could not be parsed as integer!', arg)
                default: TODO('unsuported token in CTX', arg); break;
            }
        },

        /**
         * @param {Token[]} args
         * @param {object} ctx
         * @returns {boolean} output
         */
        cond: (args=[], ctx = {}) => { //args is definitely an ARGS token - .val array of tokens, since that check was made when calling the if
            return args.every(a => {
                // console.log(a)
                switch (a.type){
                    case TokenType.VAR: return Grams.FUN.ctx(a.val, ctx);
                    case TokenType.LIST://first item in a list is always a function
                        switch (a.val[0].type) {
                            case TokenType.OP: return Grams.OP[a.val[0].val](Grams.FUN.ctx(a.val[1], ctx), Grams.FUN.ctx(a.val[2], ctx));//TODO no reason why this should only be 2. Could use the ...spread args syntax to apply the operator on infinite operands
                            case TokenType.FUN: return TODO('FUN Token resolution not supported'); //Grams.FUN[t.val[0].val]()
                            default: TODO('unsuported token in COND list', a.val[0]); break;
                        }; break;
                    default: TODO('unsuported token in COND', a); break;
                }
            })
        },
    },
    BLOCK:{
        //PAT
        p: () => null,
        c: () => null,
        end: () => '$',

        //TAR
        if: (tokens = [], ctx = {}, args = []) => Grams.FUN.cond(args, ctx) ? RecursiveReduceToString(tokens, ctx) : '', //RecursiveReduceToString(tokens, ctx),
        loop: (tokens = [], ctx = {}, args = []) => TODO('Loop blocks'), //RecursiveReduceToString(tokens, ctx),
        target: (tokens = [], ctx = {}, args = []) => RecursiveReduceToString(tokens, ctx),
    },
    OP: {
        '+': (a, b) => a + b,
        '-': (a, b) => a - b,
        '*': (a, b) => a * b,
        '/': (a, b) => b != 0 ? Math.floor(a / b) : error(`Division by 0 error. [a b] = ${[a, b]}`),
        '^': (a, b) => a ^ b,
        '%': (a, b) => a % b,

        '==': (a, b) => a === b,
        '>': (a, b) => a > b,
        '<': (a, b) => a < b,
        '>=': (a, b) => a >= b,
        '<=': (a, b) => a <= b,
        '||': (a, b) => a || b,
        '&&': (a, b) => a && b,

        // '': (a, b) => a  b,
    }
    // : () => null,
}

