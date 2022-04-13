//this script contains the grammar dictionary for the Marble language.
//it defines every meaningful keyword reserved by Marble and its functionality.

import { error, TODO, log } from "./utils/log.js";
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
        sym: (token) => `(?:${Grams.UTIL.unquote(token.val.trim())})`,// + (opt ? '?' : ''),
        var: (token) => (token.val ? `(?<${Grams.UTIL.unquote(token.val)}>\\w+)` : `(\\w+)`), // + (opt ? '?' : ''), //NOTE \w matches letters, numbers and underscore. TODO token.val might not be empty, but after cleanup, it might
        // rec: () => '(',
        // '/rec': () => ')+',
        // re: (str) => str.match(/\/(?<exp>.*)\/(a-zA-Z{0,5})?/).groups.exp,
        regex: () => { },

        //shorthands
        "": (t) => Grams.FUN.sym(t),
        s: () => '(?:\\s)',
        ';': () => '(?:;)',

        //TAR
        /**
         * @param {Token} arg
         * @param {object} ctx
         * @returns {number|string} output
         */
        ctx: (arg, ctx = {}) => {
            const num = parseInt(arg.val);
            // log('arg in ctx:', arg)
            switch(arg.type){
                case TokenType.VAR:
                    if (!isNaN(num)) //meaning this is a number, cant just check num, bcs it might be 0, which isnt truthy! Grab by index in pattern
                        return Object.values(ctx)[num] //TODO this needs an efficient error case handling, when the index might be out of bounds!
                    else //grab by label in pattern
                        return (arg.val in ctx) ? ctx[arg.val] : error('Variable accessed without declaration! [variable tag; pattern context]', arg, ctx);
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
                // log(a)
                switch (a.type){
                    case TokenType.VAR: return Grams.FUN.ctx(a, ctx);
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
        print: (...args) => { TODO('Print currently unsupported!')}, //console.log(...args)

        //reeives 2 tokens and ctx object by reference and inserts a new ctx entry. Also returns the ctx for testing purposes, but it alters the passed one.
        def: (t_arg, t_val, ctx = {}) => { ctx[t_arg.val] = Grams.FUN.ctx(t_val, ctx); return ctx},
    },
    BLOCK:{
        //PAT
        p: () => null,
        c: () => null,

        //TAR
        if: (tokens = [], ctx = {}, args = []) => Grams.FUN.cond(args, ctx) ? RecursiveReduceToString(tokens, ctx) : '',
        loop: (tokens = [], ctx = {}, args = []) => Array(Grams.FUN.ctx(args[0], ctx) || 0).fill(RecursiveReduceToString(tokens, ctx)).join(''),
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
    },

    UTIL:{
        unquote: (str='') => str.match(/[\"\'\`](?<body>.*)[\"\'\`]/)?.groups?.body,
        cast_spaces: (str='') => str.replace(/\s\t/gm, '\\s')
    }
    // : () => {},
}

