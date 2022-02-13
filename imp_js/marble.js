//Nullum magnum ingenium sine mixture dementia fuit. - There has been no great wisdom without an element of madness.
//And thus i present - Marble.

//cd imp_js
//node marble -s="./gen/test.marble" -i="./gen/input.txt" -o="./gen/output.txt"

import parse from "args-parser" //i was too lazy to parse them myself ;-;
import fs from 'fs' //for reading the 3 files content

import { MarbleTranspile } from "./transpile.js"
import { info } from "./log.js"

const error_code = Main()
if(error_code)
    console.error(`Marble exited with error code ${error_code}`)
else
    info('Success!')

function Main(){
    const args = parse(process.argv);

    //handle CLI bad cases
    if (args.h || args.help){
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
    } else if (!(args.s && args.i && args.o)){
        console.error('-s, -i, -o CLI arguments are obligatory! -h or --help for instructions')
        process.exit(1)
    }

    //set up the 3 texts to work with from their files
    const syntax = fs.readFileSync(args.s, { encoding: 'utf8', flag: 'r' })
    const source = fs.readFileSync(args.i, { encoding: 'utf8', flag: 'r' })

    //do the transpilation
    const output = MarbleTranspile(syntax, source, 'transpile', true)

    //write transpilation to output file
    fs.writeFileSync(args.o, output, { encoding: 'utf8', flag: 'w' })

    return 0
}


//https://jsdoc.app/index.html


