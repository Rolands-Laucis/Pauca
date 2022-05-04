# A general plain text templating, parsing and processing engine - "Pauca" (glorified find and replace).

<p align="center"><img src="./media/pauca%20logo.png"/></p>

## What is Pauca?
Pauca is a glorified "find and replace" engine, where the replace bit is programmable with a LISP-like language. It translates from 1 plain text to another, via easily definable text patterns to look for in the text file. These patterns are mapped to corresponding text with arguments and conditions. The mapping is manual - using Pauca and your knowledge of the source texts.

[LIVE ONLINE REPL](https://pauca.vercel.app/)

### Brief intro. What does Pauca do?

The Pauca language syntax is LISP-like, where lists are denoted with square brakets. The first element in a list is a function and the rest are its parameters. These can be nested of course.

``[sym "int"]`` tells Pauca to look for a symbol string "int". A literal string in the source code text file.

These and other lists can be chained together, like so:

``[sym "public int "] [var "the_variable_name"] ...``

This will match any line of text that is similar to "public int foo", where "foo" is any \w+ string and will be captured from the pattern match, so it can programmatically be used in the transpilation.

So Pauca takes a reductionist approach to patterns, by letting you build up a whole pattern by individual primitive pieces. Patterns are componential.

Then after the pattern definition comes the target block, where you define the generation of an output string, like so:

``[target] found variable decleration [the_variable_name] ... [/target]``

The target block supports IF, LOOP etc. blocks to programmatically generate the output.

An interesting use of Pauca would be to create "flavors" of a programming language and transpile the source code file before handing it to the corresponding language compiler or interpreter.

You can check [the Specification for Pauca syntax here](./specification.md) or [the internal compiler grammar functions here](./src/grammar.js) for all possible and currently implemented lists.

## Syntax snippet ``syntax.Pauca``

```
[p] [var "scope"] [sym " int "] [var "variable"] [" = "] [var "val"] [/p]
[target "js"]
let [variable] = [val]; //([scope])
[/target]
[target "py"]
[variable] = [val]
[/target]
```

Pauca syntax highlighting available [as a tml file](./highlight/).
Currently i just drop in the Pauca folder into the vscode extencions folder.

# Running Pauca

Currently Pauca's specification is being developed, and this may take a considerable amount of time. So far there is a demo implementation of the Pauca engine in Node.js by me, that is in development. You are free to implement it in whatever language you wish, so long as it's under the MIT licence and you credit this repo. See [./imp_js/tests](./src/tests) for currently supported Pauca features.

A Pauca REPL website currently under development, [src in the web folder](./web/)

Download:
 
```bat
npm i pauca
```

and import

```js
import { Transpile } from 'pauca/transpile.js'
let out = Transpile('source.pau', 'in.txt')
```

Or download the repo

```bat
cd src
npm i
npm run pauca
```

Then run:

```bat
node pauca -s="./syntax.pau" -i="./in.txt" -o="./out.txt" -v=true
```
or
```bat
npm run pauca
```
or
```bat
pauca -s="./syntax.pau" -i="./in.txt" -o="./out.txt" -v=true
```

Help:
```bat
node pauca -h
```

This would launch Pauca to read the `syntax.pau` definition script that is full of the lines seen above for generic syntax patterns, then looks for these patterns in the `input.c` text file and transpiles them to whatever target text file, here - `output.txt`.

Pauca engine implementations should be built such that they can be invoked from CLI and programmatically, by calling a single function in a script.

### Navigating the repo

* `./highlight` - has a `/pauca` folder VSCode extension for syntax highlighting. TML file and configs, so you can adapt to whatever IDE you use.
* `./imp_js` - has a javascript implementation of the Pauca engine written by me.
* `./media` - images, logos etc.
* `./specification.md` - a Pauca language specification file that is always outdated, since design choices change fast and arent stable.

#### `./imp_js`

* `/gen` - a gitignored folder used for testing locally. Should have files `test.Pauca`, `input.txt`, `output.txt` to run the `npm run Pauca` shorthand script
* `/tests` - has unit tests for the js implementation
* `/utils` - utility js scripts, like custom logger and file system wrapper, that are not a part of the engine really
* `/Pauca.js` - the top-level main script to run with CLI args to the 3 files, this is just a Node.js env wrapper for running on desktop. Runs `transpile.js`.
* `/transpile.js` - the main function that does the transpiling high-level steps like running the parser and resolvers.
* `/preproc.js` - preprocessing steps and a main func to apply the ones you want.
* `/parser.js` - parses the input Pauca syntax into abstract token trees as a json.
* `/resolver.js` - uses the parse tree and resolves the pattern lists to a regex object, then later is used with regex match objects as contexts and parse tree and Pauca's grammar to resolve all the target lists to an output string.
* `/grammar.js` - contains an object that has the entirety of the Pauca language grammar and each tokens functionality
* `/token.js` - defines 2 "js enums" as classes, a top-level Token that stores the parsed string symbols and a TokenType labeling the semantics of that string. 

### Motivation

I am creating this for fun and because i could not find something similar to this. Rather i found alot of specific s2s transpilers and a general purpose transpiler that is programmable, but it has to do with scripting the inner workings of the transpiler. The Pauca way is to define patterns of syntax.

Contact me on this github repo issues tab or something.

## Links, resources relating to Pauca

* [A higher level abstract regex compiler](https://github.com/Ruminat/Asq-Server). It lets you define regex patterns with more readable syntax, specifically for csv table and such parsing.
* [General purpose scriptable transpiler for many languages](https://awesomeopensource.com/project/jarble/transpiler). Has support for many languages and lets you script addons to the engine.
* [GNU Bison](https://www.gnu.org/software/bison/) A general-purpose parser generator for grammar syntaxes in C.
* [The Lex & Yacc Page](http://dinosaur.compilertools.net/) Tokenize source code and find its hierarchical structure.
* [Haxe language](https://haxe.org/) Haxe is an open source high-level strictly-typed programming language with a fast optimizing cross-compiler. Haxe can build cross-platform applications 
* [Antlr page](https://www.antlr.org/) Antlr is basically like Yacc and Bison, but perhaps has some cooler features. Inner workings are customizable. 
targeting JavaScript, C++, C#, Java, JVM, Python, Lua, PHP, Flash
* [SED](https://www.gnu.org/software/sed/manual/sed.html) A stream editor is used to perform basic text transformations on an input stream (a file or input from a pipeline)
* [ltpl](https://github.com/ikoloki/ltpl) ltpl is a delaritive text processing dsl. A utility that just happends to have a language inside of it. A CLI version similar to Pauca. Kinda like SED

### Name

"Pauca" /pɑukɑ/ is an inflection of a latin word that means "a few words". Since this is a text templating engine and uses a simple LISP-like syntax, i thought it was fitting. "Inteligenti pauca." - few words suffice for he who understands /latin proverb/.
