//Nullum magnum ingenium sine mixture dementia fuit. - There has been no great wisdom without an element of madness.
//And thus i present - Marble.

//cd imp_js
//node marble -s="./gen/test.marble" -i="." -o="./gen/output.txt"

import parse from "args-parser" //i was too lazy to parse them myself ;-;
import fs from 'fs' //for reading the 3 files content

import { Preprocess, AllPreProcSteps, SliceSection} from './preproc.js'

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

    //set up the 3 texts to work with from their files
    let syntax = fs.readFileSync(args.s, { encoding: 'utf8', flag: 'r' })
    let source = '' //fs.readFileSync(args.i, { encoding: 'utf8', flag: 'r' })
    let output = "TODO..."

    //do the transpilation
    output = Transpile(syntax, source)

    //write transpilation to output file
    fs.writeFileSync(args.o, output, { encoding: 'utf8', flag: 'w' })

    return 0
}

/**
 * @param {string} syntax
 * @param {string} source
 * @param {string} output
 */
function Transpile(syntax, source){

    //preprocess steps before parsing the syntax file
    syntax = SliceSection(syntax, 0)
    syntax = Preprocess(AllPreProcSteps, syntax)



    return syntax
}


