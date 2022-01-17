//Nullum magnum ingenium sine mixture dementia fuit. - There has been no great wisdom without an element of madness.
//And thus i present - Marble.

//cd imp_js
//node marble -s="./gen/test.marble" -i="." -o="./gen/output.txt"

import parse from "args-parser" //i was too lazy to parse them myself ;-;
import fs from 'fs' //for reading the 3 files content
import pino from "pino"

import { Preprocess, ExtractSection} from './preproc.js'
import { Parse } from './lexer.js'
import { CastToRegex } from "./grammer.js"

const error_code = Main()
if(error_code)
    console.error(`Marble exited with error code ${error_code}`)
else
    console.log('Marble Success!')

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

    //set up a logger
    // const logger = pino(pino.destination({ dest: './run.log', sync: false }))

    //set up the 3 texts to work with from their files
    let syntax = fs.readFileSync(args.s, { encoding: 'utf8', flag: 'r' })
    let source = fs.readFileSync(args.i, { encoding: 'utf8', flag: 'r' })
    let output = "TODO..."

    //do the transpilation
    output = Transpile(syntax, source)

    //write transpilation to output file
    fs.writeFileSync(args.o, output, { encoding: 'utf8', flag: 'w' })

    return 0
}


//https://jsdoc.app/index.html

/**
 * @param {string} syntax
 * @param {string} source
 * @param {Function} logger
 */
function Transpile(syntax, source, logger = null){

    // if (!logger){
    //     logger = pino(pino.destination({dest: './run.log', sync: false}))
    // }
    // logger.info('Hello world!')

    //preprocess steps before parsing the syntax file
    syntax = ExtractSection(syntax, 3)
    syntax = Preprocess(syntax)
    // console.log(syntax)

    // const parsed = Parse(syntax, [Pairer, Tokenizer])

    //---construct syntax parse tree data structure
    
    //parse the marble syntax into a ready-to-use data structure
    const parsed_marble = Parse(syntax)
    // console.log(parsed_marble)
    // console.log(parsed_marble[0]['pat'])
    // console.log(parsed_marble[0]['tar'])

    //---create regex patterns from marble syntax
    // const re = CastToRegex(parsed_marble[0]['pat'])
    // console.log(source.match(re))

    //---Convert source lines with regex


    return syntax
}
