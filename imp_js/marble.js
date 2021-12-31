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


//https://jsdoc.app/index.html

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
    let pairs = PairPatTarget(syntax)
    // console.log(pairs)

    //---parse the segments into a tree of tokens
    pairs = TokenizePattern(pairs)

    //---create regex patterns from marble syntax

    
    //---Convert source lines with regex


    return syntax
}


/**
 * Expects the syntax text preprocessed without \n, i.e. the entire string is on a single line
 * @param {string} text
 * @returns {Array} pairs
 */
function PairPatTarget(text){
    const pairs = []
    
    const re_pat = /(.*?\[end(\s\".*?\")?\])/m
    const re_target = /(\[target(\s\".*?\")?\].*?\[\/target\])/m
    const re_target_start_tag = /(\[target(\s\".*?\")?\])/m
    const re_target_begin = /^(\[target(\s\".*?\")?\])/m
    const re_pat_end_tag = /(\[end(\s\".*?\")?\])/m

    let match = text.match(re_pat)
    while(match){
        if (!match){
            console.log(text)
            console.log(pairs)
        }
        //save down the pattern
        const pat = match[0].trim() //Object.values(match).join(' ')
        if (pat.match(re_target_start_tag)){ //make sure no conflictions in parsing
            console.log('Target tag found in pattern sequence. Exiting...')
            console.log(pairs)
            process.exit(1)
        }
        pairs.push({ 'pat': pat }) //match.groups.pat + match.groups.tail
        //remove the extracted match
        text = text.replace(re_pat, '').trim()

        //Now the text should begin with a target tag. save down the target
        if (!text.match(re_target_begin)){
            console.log('No target tag after pattern match. Exiting...')
            console.log(text)
            console.log(pairs)
            process.exit(1)
        }
        match = text.match(re_target)
        const target = match[0].trim() //Object.values(match.groups).join(' ')
        if (target.match(re_pat_end_tag)) { //make sure no conflictions in parsing
            console.log('End tag found in target sequence. Exiting...')
            console.log(pairs)
            process.exit(1)
        }
        // console.log(pairs[pairs.length - 1])
        pairs[pairs.length - 1]['tar'] = target
        //remove the extracted match
        text = text.replace(re_target, '').trim()

        //re-search for next iter
        match = text.match(re_pat)
    }

    return pairs
}

/**
 * Expects the syntax text preprocessed without \n, i.e. the entire string is on a single line
 * @param {object[]} pairs
 * @returns {object[]} pairs
 */
function TokenizePattern(pairs){
    pairs.map(p => {
        p['pat'] //tokenize
    })
}
