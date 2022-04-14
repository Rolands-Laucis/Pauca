# General purpose source-to-source (s2s) plain text transpiler tool and programming language - "Marble".

<p align="center"><img src="./media/Marble%20logo.png"/></p>

## What is Marble?
Marble is a glorified "find and replace" engine, where the replace bit is programmable with a LISP-like language. It does not execute the code, it merely translates from 1 plain text to another, via easily definable text patterns in the text file. These patterns are mapped to corresponding text with arguments and conditions. The mapping is manual - using Marble and your knowledge of the source texts.

### Brief intro. What does Marble do?

The Marble language syntax is LISP-like, where lists (aka "tags") are denoted with square brakets. The first element in a list is a function and the rest are its parameters. These can be nested of course.

``[sym "int"]`` tells Marble to look for a symbol string "int". A literal string in the source code text file.

These and other tags can be chained together, like so:

``[sym "public int "] [var "the_variable_name"] ...``

This will match any line of text that is similar to "public int foo", where "foo" is any \w+ string and will be captured from the pattern match, so it can programmatically be used in the transpilation.

So Marble takes a reductionist approach to patterns, by letting you build up a whole pattern by individual primitive pieces. Patterns are componential.

Then after the pattern definition comes the target block, where you define the generation of an output string, like so:

``[target] found variable decleration [the_variable_name] ... [/target]``

The target block supports IF, LOOP etc. blocks to programmatically generate the output.

An interesting use of Marble would be to create "flavors" of a programming language and transpile the source code file before handing it to the corresponding language compiler or interpreter.

You can check [the Specification for Marble syntax here](./specification.md) or [the internal compiler grammar functions here](./imp_js/grammar.js) for all possible and currently implemented tags.

## Syntax snippet ``syntax.marble``

```
[p] [var "scope"] [sym " int "] [var "variable"] [" = "] [var "val"] [/p]
[target "js"]
let [variable] = [val]; //([scope])
[/target]
[target "py"]
[variable] = [val]
[/target]
```

Marble syntax highlighting available [as a tml file](./highlight/marble/syntaxes/marble.tmLanguage.json).
Currently i just drop in the marble folder into the vscode extencions folder.

## Running Marble.

Currently Marble's specification is being developed, and this may take a considerable amount of time. So far there is a demo implementation of the Marble engine in Node.js by me, that is in development. You are free to implement it in whatever language you wish, so long as it's under the MIT licence and you credit this repo. See [./imp_js/tests](./imp_js/tests) for currently supported Marble features.

After downloading the repo, have Node installed and from ``./imp_js`` simply run:

```bat
node marble -s="./gen/syntax.marble" -i="./gen/input.txt" -o="./gen/output.txt" -v=true
```

or

```bat
npm run marble
```

This would launch Marble to read the `syntax.marble` definition script that is full of the lines seen above for generic syntax patterns, then looks for these patterns in the `input.c` text file and transpiles them to whatever target text file, here - `output.txt`.

Marble engine implementations should be built such that they can be invoked from CLI and programmatically, by calling a single function in a script.

### Navigating the repo

* `./highlight` - has a `/marble` folder VSCode extension for syntax highlighting. TML file and configs, so you can adapt to whatever IDE you use.
* `./imp_js` - has a javascript implementation of the Marble engine written by me.
* `./media` - images, logos etc.
* `./specification.md` - a Marble language specification file that is always outdated, since design choices change fast and arent stable.

#### `./imp_js`

* `/gen` - a gitignored folder used for testing locally. Should have files `test.marble`, `input.txt`, `output.txt` to run the `npm run marble` shorthand script
* `/tests` - has unit tests for the js implementation
* `/utils` - utility js scripts, like custom logger and file system wrapper, that are not a part of the engine really
* `/marble.js` - the top-level main script to run with CLI args to the 3 files, this is just a Node.js env wrapper for running on desktop. Runs `transpile.js`.
* `/transpile.js` - the main function that does the transpiling high-level steps like running the parser and resolvers.
* `/preproc.js` - preprocessing steps and a main func to apply the ones you want.
* `/parser.js` - parses the input marble syntax into abstract token trees as a json.
* `/resolver.js` - uses the parse tree and resolves the pattern tags to a regex object, then later is used with regex match objects as contexts and parse tree and Marble's grammar to resolve all the target tags to an output string.
* `/grammar.js` - contains an object that has the entirety of the Marble language grammar and each tokens functionality
* `/token.js` - defines 2 "js enums" as classes, a top-level Token that stores the parsed string symbols and a TokenType labeling the semantics of that string. 

### Motivation

I am creating this for fun and because i could not find something similar to this. Rather i found alot of specific s2s transpilers and a general purpose transpiler that is programmable, but it has to do with scripting the inner workings of the transpiler. The Marble way is to define patterns of syntax.

Contact me on this github repo issues tab or something.

## Links, resources relating to Marble

* [A higher level abstract regex compiler](https://github.com/Ruminat/Asq-Server). It lets you define regex patterns with more readable syntax, specifically for csv table and such parsing.
* [General purpose scriptable transpiler for many languages](https://awesomeopensource.com/project/jarble/transpiler). Has support for many languages and lets you script addons to the engine.
* [GNU Bison](https://www.gnu.org/software/bison/) A general-purpose parser generator for grammar syntaxes in C.
* [The Lex & Yacc Page](http://dinosaur.compilertools.net/) Tokenize source code and find its hierarchical structure.
* [Haxe language](https://haxe.org/) Haxe is an open source high-level strictly-typed programming language with a fast optimizing cross-compiler. Haxe can build cross-platform applications 
* [Antlr page](https://www.antlr.org/) Antlr is basically like Yacc and Bison, but perhaps has some cooler features. Inner workings are customizable. 
targeting JavaScript, C++, C#, Java, JVM, Python, Lua, PHP, Flash

### Name

The name "Marble" comes from the english word for a stone-like material, that is often used for sculpting sculptures. The act of building complex structures from a simple piece of stone. "Faber est suae quisque fortunae." - Every man is the artisan of his own fortune. And so is every great sculptor the picker of his marble.
