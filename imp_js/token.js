//enum idea borrowed from https://www.sohamkamani.com/javascript/enums/

//token type enum
export class TokenType{
    static LIST = new TokenType('LIST')
    static STR = new TokenType('STR')
    static FUN = new TokenType('FUN')
    static VAR = new TokenType('VAR')
    static NULL = new TokenType('NULL')

    constructor(n){this.name = n}
}

// const TypeFromStr = {
//     '[': TokenType.OB,
//     ']': TokenType.CB,
// }

//actual token object
export class Token{
    constructor(v = '', t = TokenType.NULL){
        this.val = v
        this.type = t //typeof (t) == 'string' ? TypeFromStr[t] : t
    }

    // GetType(){return this.type.name}
}

// export class TokenList{
//     constructor(t = []){
//         this.tokens = t
//     }
// }