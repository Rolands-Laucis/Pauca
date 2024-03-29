//this script contains the grammar dictionary for the Pauca language.
//it defines every meaningful keyword reserved by Pauca and its functionality.

//JavaScript is beautiful :)

import { error, TODO, log } from "./utils/log.js"
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
        sym: (token) => `(?:${Grams.UTIL.unq_and_escape(token.val.trim())})`,// + (opt ? '?' : ''),
        var: (token) => (token?.val ? `(?<${Grams.UTIL.unq_and_escape(token.val)}>\\w+)` : `(\\w+)`), // + (opt ? '?' : ''), //NOTE \w matches letters, numbers and underscore. TODO token.val might not be empty, but after cleanup, it might
        regex: () => { TODO('Regex literals currently unsupported!')},
        d: (token) => (token.val ? `(?<${Grams.UTIL.unq_and_escape(token.val)}>\\d+)` : `(\\d+)`),
        f: (token) => (token.val ? `(?<${Grams.UTIL.unq_and_escape(token.val)}>\\d+\\.\\d+?f?)` : `(\\d+\\.\\d+?f?)`),
        num: (token) => (token.val ? `(?<${Grams.UTIL.unq_and_escape(token.val)}>\\-?\\d+\\.?\\d+?f?)` : `(\\-?\\d+\\.?\\d+?f?)`),

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
                default: error('unsuported token in CTX resolve', arg, ctx); break;
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
            //edge case, when the list is the function DEF or DEFN, then all this will fail, so handle them beforehand
            if (!l[0]?.type) error('First token in a LIST doesnt have a type, wtf...', l)
            if (l[0].type == TokenType.FUN && ['def', '=', 'defn', '=>'].includes(l[0].val))
                return l.length >= 3 ? Grams.FUN[l[0].val](l[1], ctx, ...(l.slice(2))) : error(`The ${l[0].val} list takes at least 2 parameters, but ${l.length} were given.`, l)

            //resolve the args to this list function, since they can be variables or more lists
            const args = l.slice(1).map(t => {
                switch(t.type){
                    case TokenType.VAR: return Grams.FUN.ctx(t, ctx)
                    case TokenType.STR: return Grams.FUN.ctx(t, ctx)
                    case TokenType.LIST: return Grams.FUN.list(t.val, ctx)
                    case TokenType.BLOCK: return RecursiveReduceToString([t], ctx)
                    default: error('unsuported token type in LIST args', t); break;
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
                case TokenType.BLOCK: return RecursiveReduceToString([l], ctx)
                case TokenType.FUN: args.push(ctx); return Grams.UTIL.call(l[0].val, ...args) //meaning from this point on, that LISTs containing non-internal functions will receive all their params as an infinite spread, where the last element is the context object and can be extracted via the .ctx()
                case TokenType.LIST: return Grams.FUN.list(l[0].val, ctx) //TODO this doesnt make any sense that the first token, that should be the name of the function, is itself a list.
                default: error('unsuported token type in LIST func', l[0]); break;
            };
        },

        print: (...args) => { log(args.slice(0, -1).join('\t')); return '';},

        //reeives 2 tokens and ctx object by reference and inserts a new ctx entry. t_arg is a token with a string label of the var and t_val will be its value. Overwrites existing. Also returns the ctx for testing purposes, but it alters the passed one.
        def: (t_arg, ctx = {}, ...tokens) => {
            tokens = tokens[0] //Grams.UTIL.listify(tokens)
            switch (tokens.type){
                case TokenType.LIST: ctx[t_arg.val] = Grams.FUN.list(tokens.val, ctx); break;
                default: ctx[t_arg.val] = Grams.FUN.ctx(tokens, ctx); break;  //for VAR and STR tokens, otherwise would raise error in ctx()
            }
            // log('added to ctx', ctx)
            return ctx[t_arg.val]
        },
        '=': (...args) => Grams.FUN.def(...args), //shorthand for def

        //receives 2 tokens and ctx object by reference and inserts a new ctx entry. Overwrites existing.
        defn: (t_name, ctx = {}, ...tokens) => {
            const t_val = Grams.UTIL.listify(tokens)
            const name = Grams.UTIL.unquote(t_name.val)
            switch (t_val.type) {
                case TokenType.LIST: ctx[name] = t_val.val ; break;
                default: ctx[name] = t_val; break;  //for VAR and STR tokens, otherwise would raise error in ctx()
            }
            // log(`added ${name} to ctx`, ctx)
            return ''
        },
        '=>': (...args) => Grams.FUN.defn(...args), //shorthand for defn

        /**
         * executes a list or arg, but always returns an empty string. A way to not print something out to output.
         * @param {Token[]} args
         * @returns {string} empty
         */
        '\\': (...args) => {
            const ctx = args.last()
            args.slice(0, -1).forEach(a => a.type == TokenType.LIST ? Grams.FUN.list(a.val, ctx) : null) //eval all the arguments, if they are lists, but dont care about what they return
            return ''
        },

        ret: (...args) => { log(args.slice(0, -1)); return RecursiveReduceToString(args.slice(0, -1), args.last())}
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
            // '%': (...oprs) => oprs[0] % oprs[1],
        },

        //logical operators
        LOP:{
            '==': (a, b) => a === b,
            '!=': (a, b) => a != b,
            '>': (a, b) => a > b,
            '<': (a, b) => a < b,
            '>=': (a, b) => a >= b,
            '<=': (a, b) => a <= b,
            '|': (a, b) => a || b,
            '&': (a, b) => a && b,
            '!': (...oprs) => oprs.length == 1 ? !oprs[0] : oprs.map(a => !a), //returns negated element or a list of all elements negated seperately.
        }
    },

    UTIL:{
        unq_and_escape: (s = '') => Grams.UTIL.escape(Grams.UTIL.unquote(s)),
        unquote: (s='') => s.match(/[\"\'\`](?<body>.*)[\"\'\`]/)?.groups?.body || s,
        escape: (s = '') => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), // $& means the whole matched string. https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
        cast_spaces: (s='') => s.replace(/\s\t/gm, '\\s') || s,
        call: (name, ...args) => {
            const ctx = args.last()
            switch(true){
                case name in Grams.FUN: return Grams.FUN[name](...args)
                case name in ctx:
                    const fn = ctx[name]
                    const params = Object.fromEntries(Array.from(args.slice(0, -1), (a, i) => [i, a])) //create a dictionary of all args. Args here would come from FUN.list resolve args loop, where they all end up as number or string, so create dict {'0':'arg', ...}
                    const local_scope_ctx = Object.assign({}, ctx, params) //create a new object from ctx + custom func params as overwrites
                    switch(true){
                        case Array.isArray(fn)://if its an array
                            return Grams.FUN.list(fn, local_scope_ctx) //resolve the list with global context + func args/params ctx overwrites
                        case typeof(fn) == 'object' && fn?.type == TokenType.BLOCK: //if its a block
                            return RecursiveReduceToString([fn], local_scope_ctx) //have to use [fn] like this bcs the fn is a block token, but this function expects an array of tokens. Also cant use fn.val for the block tokens, bcs this function needs to run into the block token in the array to call it and handle.
                        default: error(`Tried to call a something [${name}] that wasnt a function or block`, fn)
                    }
                    
                default: error(`Function [${name}] does not exist, but something tried to call it. [ctx]`, args.last(), name)
            }
        },
        listify: (tokens) => tokens.length == 1 ? tokens[0] : new Token(tokens, TokenType.LIST),//will put all these tokens inside a new LIST token, if there are more than 1 tokens, otherwise will return the input token
    }
    // : () => {},
}

