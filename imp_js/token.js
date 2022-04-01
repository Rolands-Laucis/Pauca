//enum idea borrowed from https://www.sohamkamani.com/javascript/enums/

//token type enum
export class TokenType{
    static LIST = new TokenType('LIST')//this tokens val is an array of other tokens
    static STR = new TokenType('STR')//this is a regular string. Either unknown type or a literal string to be pushed to the output
    static FUN = new TokenType('FUN')//the string is a function and this function is to be invoked
    static VAR = new TokenType('VAR') //the string is a variable in the patter
    static NULL = new TokenType('NULL') //fallback

    constructor(n, id = null){
        this.name = n
        if(id)
            this.id = id
    }

    //blocks are special FUN "subtokens" that means, this FUN token will have a body and will do actions with that body based on the FUN args
    //initialized here from a static function, bcs it needs a variable id passed to it, that uniquely identifies it in the tree, such that only its end block token has the same ids
    static BLOCK = (id = null) => new TokenType('BLOCK', id)
        
    //disignates the end of the block body. Unlike BLOCK, this is not a FUN.
    static BLOCKEND = (id = null) => new TokenType('BLOCKEND', id)
}

//actual token object
export class Token{
    constructor(v = '', t = TokenType.NULL){
        this.val = v
        this.type = t
    }
}