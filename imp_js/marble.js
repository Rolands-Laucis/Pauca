//Nullum magnum ingenium sine mixture dementia fuit. - There has been no great wisdom without an element of madness.
//And thus i present - Marble.

//cd imp_js
//node marble -s="./gen/test.marble" -i="." -o="./gen/output.txt"

import parse from "args-parser" //i was too lazy to parse them myself ;-;
import fs from 'fs' //for reading the 3 files content

import { Preprocess, AllPreProcSteps, ExtractSection} from './preproc.js'

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
 */
function Transpile(syntax, source){

    //preprocess steps before parsing the syntax file
    // syntax = ExtractSection(syntax, 1)
    syntax = Preprocess(AllPreProcSteps, syntax)

    //---construct syntax parse tree data structure
    
    //segment the syntax file into block pairs, where the first element of the pair is the pattern string, the second - the target string
    let segments = {}
    
    let pat = '', target = '', on_target = false;
    const re_target_start = /(\[target(\s\".+\")?\])/m
    const re_target_end = /(\[\/target\])/m

    //due to the preprocessing, we should be starting on a pattern line, that may spill over to a new line
    syntax.split('\n').forEach(line => {
        if(line.match(re_target_start))
            on_target = true
        else if (line.match(re_target_end)){
            on_target = false
            target += line.trimEnd() //since the lower conditional branch wont be run, grab that clossing target tag

            //save down the pattern
            if (pat.match(re_target_start) || pat.match(re_target_end)){
                console.log('Target and pattern segments misaligned! Exiting...')
                process.exit(1)
            }
            segments[Object.keys(segments).length] = {'pat': pat, 'target':target}

            //reset for next segment
            pat = ''
            target = ''

            return //here acts as a continue keyword would in a for loop
        }
        
        if (on_target)
            target += line.trimEnd() 
        else
            pat += line.trim() 
    })

    console.log(segments)

    //---parse the segments into a tree of tokens

    //---create regex patterns from marble syntax

    
    //---Convert source lines with regex


    return syntax
}


