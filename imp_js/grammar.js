import { error } from "./log.js";

//?: means non-capturing group
//can write string literals of regex that it should cast to
//can write lambda functions, that will be called
//can write function names, that are defined somewhere later in the script
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
        ctx: () => null,
        cond: () => null,
    },
    BLOCK:{
        //PAT
        p: () => null,
        c: () => null,
        end: () => '$',

        //TAR
        if: () => null,
        loop: () => null,
        target: () => null,
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
