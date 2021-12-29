//cd imp_js
//node marble -s="." -i="." -o="."

import parse from "args-parser"

const args = parse(process.argv);

const output = Transpile(args)
console.log(output)

function Transpile(args){
    // TODO
    return "TODO..."
}