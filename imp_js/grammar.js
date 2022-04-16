//this script contains the grammar dictionary for the Pauca language.
//it defines every meaningful keyword reserved by Pauca and its functionality.

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

Array.prototype.last = function () {return this[this.length-1]}

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
            const num = parseFloat(arg.val);
            // log('arg in ctx:', arg, num)
            switch(arg.type){
                case TokenType.VAR:
                    if (!isNaN(num)) //meaning this is a number, cant just check num, bcs it might be 0, which isnt truthy! Grab by index in pattern
                        var retrieved = Object.values(ctx)[num] //TODO this needs an efficient error case handling, when the index might be out of bounds!
                    else //grab by label in pattern
                        var retrieved = (arg.val in ctx) ? ctx[arg.val] : error('Variable accessed without declaration! [variable tag; pattern context]', arg, ctx);
                    const cast = parseFloat(retrieved) //see if the stored value can be parsed as an float, bcs context always contains strings, but those strings would be useful as numbers
                    return cast ? cast : retrieved
                case TokenType.STR: //its a string literal that could be a number
                    return !isNaN(num) ? num : Grams.UTIL.unquote(arg.val)
                default: error('unsuported token in CTX', arg); break;
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
            //edge case, when the list is the function DEF, then all this will fail
            if (l[0].type == TokenType.FUN && (l[0].val == 'def' || l[0].val == '=')) //TODO the shorthand would never actually get called.
                return Grams.FUN.def(l[1], l[2], ctx)

            //resolve the args to this list function, since they can be variables or more lists
            const args = l.slice(1).map(t => {
                switch(t.type){
                    case TokenType.VAR: return Grams.FUN.ctx(t, ctx)
                    case TokenType.STR: return Grams.FUN.ctx(t, ctx)
                    case TokenType.LIST: return Grams.FUN.list(t.val, ctx)
                    default: error('unsuported token in LIST args', t); break;
                }
            })//l is a LIST so we can slice all the args to it and map them to their resolved vals from ctx or res if they are other list, then pass them to the OP function that takes infinite params
            
            //perform this list function
            switch (l[0].type) {
                case TokenType.LOP: return Grams.OP.LOP[l[0].val](...args) 
                case TokenType.AOP: 
                    const res = Grams.OP.AOP[l[0].val](...args)
                    if (l[1].type == TokenType.VAR) //if the first arg was in the context (a named var) then the result of the OP should be stored in it.
                        ctx[l[1].val] = res;
                    return res;
                case TokenType.FUN: args.push(ctx); return Grams.FUN[l[0].val](...args); //meaning from this point on, that LISTs containing non-internal functions will receive all their params as an infinite spread, where the last element is the context object and can be extracted via the .ctx()
                default: TODO('unsuported token in LIST func', l[0]); break;
            };
        },

        print: (...args) => { args.slice(0, -1).forEach(a => log(a)); return '';},

        //reeives 2 tokens and ctx object by reference and inserts a new ctx entry. t_arg is a token with a string label of the var and t_val will be its value. Overwrites existing. Also returns the ctx for testing purposes, but it alters the passed one.
        def: (t_arg, t_val, ctx = {}) => { 
            switch(t_val.type){
                case TokenType.LIST: ctx[t_arg.val] = Grams.FUN.list(t_val.val, ctx); break;
                default: ctx[t_arg.val] = Grams.FUN.ctx(t_val, ctx); break;  //for VAR and STR tokens, otherwise would raise error in ctx()
            }
            // log('added to ctx', ctx)
            return ctx[t_arg.val]
        },
        '=': (...args) => Grams.FUN.def(...args), //shorthand for def

        /**
         * executes a list or arg, but always returns an empty string. A way to not print something out to output.
         * @param {Token[]} args
         * @returns {string} empty
         */
        '\\': (...args) => {
            const ctx = args.last()
            args.slice(0, -1).forEach(a => a.type == TokenType.LIST ? Grams.FUN.list(a.val, ctx) : null) //eval all the arguments, if they are lists, but dont care about what they return
            return ''
        }
    },
    BLOCK:{
        //PAT
        p: () => null,
        c: () => null,

        //TAR
        if: (tokens = [], ctx = {}, args = []) => Grams.FUN.cond(args, ctx) ? RecursiveReduceToString(tokens, ctx) : '',
        repeat: (tokens = [], ctx = {}, args = []) => Array(Grams.FUN.ctx(args[0], ctx) || 0).fill(RecursiveReduceToString(tokens, ctx)).join(''), //computes once and just repeats the nest
        loop: (tokens = [], ctx = {}, args = []) => Array.from({ length: Grams.FUN.ctx(args[0], ctx) || 0 }, (_, i) => RecursiveReduceToString(tokens, ctx)).join(''), //computes the nest multiple times
        target: (tokens = [], ctx = {}, args = []) => RecursiveReduceToString(tokens, ctx),
    },
    OP: {
        //arithmetic operators
        AOP:{
            '+': (...oprs) => oprs.reduce((a, b) => a + b),
            '-': (...oprs) => oprs.reduce((a, b) => a - b),
            '*': (...oprs) => oprs.reduce((a, b) => a * b),
            '/': (...oprs) => oprs.reduce((a, b) => b != 0 ? a / b : error(`Division by 0 error. [a b] = ${[a, b]}`)),
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
            '|': (a, b) => a || b,
            '&': (a, b) => a && b,
        }

        // '': (a, b) => a  b,
    },

    UTIL:{
        unquote: (str='') => str.match(/[\"\'\`](?<body>.*)[\"\'\`]/)?.groups?.body || str,
        cast_spaces: (str='') => str.replace(/\s\t/gm, '\\s') || str
    }
    // : () => {},
}

