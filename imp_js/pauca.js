//Nullum magnum ingenium sine mixture dementia fuit. - There has been no great wisdom without an element of madness.
//And thus i present - Marble.

//cd imp_js
//node marble -s="./gen/test.marble" -i="./gen/input.txt" -o="./gen/output.txt"

import parse from "args-parser" //i was too lazy to parse them myself ;-;
import fs from 'fs' //for reading the 3 files content

import { Transpile, TranspileMode } from "./transpile.js"
import { info } from "./utils/log.js"

const error_code = Main()
if(error_code)
    console.error(`Marble exited with error code ${error_code}`)
else
    info('Success!')

function Main(){
    let CLI = parse(process.argv);
    // process.exit(0)

    //handle CLI bad cases
    if (CLI.h || CLI.help){
        console.log(`
usage: marble.py [-h] -s SYNTAX -i INPUT -o OUTPUT

Runs the Marble engine transpilation on an input script.

optional arguments:
  -h, --help            show this help message and exit
  -s SYNTAX, --syntax SYNTAX
                        Path to the transpilation syntax .marble file.
  -i INPUT, --input INPUT
                        Path to the input source code plain text file.
  -o OUTPUT, --output OUTPUT
                        Path to the target source code plain text file.
        `)
        process.exit(0)
    } else if (!(CLI.s && CLI.i && CLI.o)){
        console.error('-s, -i, -o CLI arguments are obligatory! -h or --help for instructions')
        process.exit(1)
    }

    const args = Object.assign({}, { s: './s.pau', i: './input.txt', o: './output.txt', m: TranspileMode.REPLACE, v: true }, CLI);
    // console.log(args)

    //set up the 2 texts to work with from their files
    const syntax = fs.readFileSync(args.s, { encoding: 'utf8', flag: 'r' })
    const source = fs.readFileSync(args.i, { encoding: 'utf8', flag: 'r' })

    //do the transpilation
    const output = Transpile(syntax, source, { verbose: args.v}) || ''

    //write transpilation to output file
    fs.writeFileSync(args.o, output, { encoding: 'utf8', flag: 'w' })

    return 0
}


//https://jsdoc.app/index.html


