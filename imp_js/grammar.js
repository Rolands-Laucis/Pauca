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
        regex: () => { TODO('Regex literals currently unsupported!')},

        //shorthands
        "": (...args) => Grams.FUN.sym(...args),
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
                        var retrieved = Object.values(ctx)[num] //TODO this needs an efficient error case handling, when the index might be out of bounds!
                    else //grab by label in pattern
                        var retrieved = (arg.val in ctx) ? ctx[arg.val] : error('Variable accessed without declaration! [variable tag; pattern context]', arg, ctx);
                    const cast = parseInt(retrieved) //see if the stored value can be parsed as an int, bcs context always contains strings, but those strings would be useful as numbers
                    return cast ? cast : retrieved
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
                    case TokenType.LIST: return Grams.FUN.list(a.val, ctx);
                    default: TODO('unsuported token in COND', a); break;
                }
            })
        },

        /**
         * @param {Token[]} l - should be the whole list where the first item is always a function. So if a token is of type LIST then this should be passed the t.val = []
         * @param {object} ctx
         * @returns {number | boolean} output
         */
        list: (l=[], ctx = {}) => {
            switch (l[0].type) {
                case TokenType.LOP: return Grams.OP.LOP[l[0].val](...l.slice(1).map(t => Grams.FUN.ctx(t, ctx))) //l is a LIST so we can slice all the args to it and map them to their resolved vals from ctx, then pass them to the OP function that takes infinite params
                case TokenType.AOP: 
                    const res = Grams.OP.AOP[l[0].val](...l.slice(1).map(t => Grams.FUN.ctx(t, ctx))) //l is a LIST so we can slice all the args to it and map them to their resolved vals from ctx, then pass them to the OP function that takes infinite params
                    if (l[1].type == TokenType.VAR) //if the first arg was in the context (a named var) then the result of the OP should be stored in it.
                        ctx[l[1].val] = res
                    return res;
                case TokenType.FUN: return TODO('FUN Token resolution not supported'); //Grams.FUN[t.val[0].val]()
                default: TODO('unsuported token in COND list', l[0]); break;
            };
        },

        print: (...args) => { TODO('Print currently unsupported!')}, //console.log(...args)

        //reeives 2 tokens and ctx object by reference and inserts a new ctx entry. Also returns the ctx for testing purposes, but it alters the passed one.
        def: (t_arg, t_val, ctx = {}) => { ctx[t_arg.val] = Grams.FUN.ctx(t_val, ctx); return ctx},
        '=': (...args) => Grams.FUN.def(...args), //shorthand for def
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
        //arithmetic operators
        AOP:{
            '+': (...oprs) => oprs.reduce((a, b) => a + b),
            '-': (...oprs) => oprs.reduce((a, b) => a - b),
            '*': (...oprs) => oprs.reduce((a, b) => a * b),
            '/': (...oprs) => oprs.reduce((a, b) => b != 0 ? Math.floor(a / b) : error(`Division by 0 error. [a b] = ${[a, b]}`)),
            '^': (...oprs) => oprs.reduce((a, b) => a ^ b),
            '%': (...oprs) => oprs.reduce((a, b) => a % b),
            '!': (...oprs) => oprs.length == 1 ? !oprs[0] : oprs.map(a => !a), //returns negated element or a list of all elements negated seperately.
        },

        //logical operators
        LOP:{
            '==': (a, b) => a == b,
            '>': (a, b) => a > b,
            '<': (a, b) => a < b,
            '>=': (a, b) => a >= b,
            '<=': (a, b) => a <= b,
            '||': (a, b) => a || b,
            '&&': (a, b) => a && b,
        }

        // '': (a, b) => a  b,
    },

    UTIL:{
        unquote: (str='') => str.match(/[\"\'\`](?<body>.*)[\"\'\`]/)?.groups?.body,
        cast_spaces: (str='') => str.replace(/\s\t/gm, '\\s')
    }
    // : () => {},
}

