//enum idea borrowed from https://www.sohamkamani.com/javascript/enums/

//token type enum
export class TokenType{
    static LIST = new TokenType('LIST')//this tokens val is an array of other tokens
    static STR = new TokenType('STR')//this is a regular string. Either unknown type or a literal string to be pushed to the output
    static FUN = new TokenType('FUN')//the string is a function and this function is to be invoked
    static VAR = new TokenType('VAR') //the string is a variable in the patter
    static BLOCK = new TokenType('BLOCK') //blocks are special function "subclasses" that mean this function will have a body and do actions with that body based on the func args
    static BLOCKEND = new TokenType('BLOCKEND') //disignates the end of the block body. Unlike BLOCK, this is not a FUN.
    static NULL = new TokenType('NULL') //fallback

    constructor(n){this.name = n}
}

//actual token object
export class Token{
    constructor(v = '', t = TokenType.NULL){
        this.val = v
        this.type = t
    }
}