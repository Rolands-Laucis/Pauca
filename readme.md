# General purpose source-to-source (s2s) programming language transpiler tool/framework - "Marble".

## What is Marble?
Marble is a pseudo code language syntax for writing transpilers for other languages (or plain text in general). It does not execute the code, it merely translates from 1 programming language source code to another, via easily definable syntax patterns in the source code text file. These patterns are mapped to corresponding syntax in the output target language syntax. The mapping is manual - using Marble and your knowledge of the languages. Marble of course also has its own syntax for enabling you to do things. Lets take a quick look.

### So how do you define anything in Marble? What tells Marble to search for syntax?

Using square brackets to define tags similarly to html and xml. The inside of square bracket says what type of tag it is - its functionality in the Marble syntax.
So Marble takes a reductionist approach to patterns, by letting you build up a whole pattern by individual primitive pieces. This is easier and more readable than using regex.

``[sym "int"]`` tells Marble to look for a symbol string "int". A literal string in the source code text file.

These can be chained together, delimiting tags by spaces, like so:

``[sym "public"] [sym " "] [sym "int"] ...``

This will match any line of text that is similar to "public int". [sym] tags are just string literals to search for, so most often in programming languages these are language reserved keywords. But you can look for any string literal, since Marble aims for generalization.

An interesting use of Marble would be to create "flavors" of whatever language you desire and transpile the source code file before handing it to the corresponding language compiler or interpreter. Like so:

``[sym="public-ish"] [sym=" "] [sym="int"] ...``

"Public-ish" is not a reserved keyword in C like languages, but you can introduce it via Marble. What you do with this match is up to you to define. 

You can check [the Specification for Marble syntax here](https://github.com/Rolands-Laucis/Marble/blob/master/specification.md) for all possible tags.

## Running Marble.

Currently Marble's specification is being devloped by Rolands Laucis, and this may take a considerable amount of time. So far there is no implementation of the Marble engine, i.e. it is still just an idea. You are free to implement it in whatever language you wish, so long as you credit this repo.

Marble would be built with Node.js, so it could simply run with a CLI as such:

``node marble syntax.marble script.c output.js``

This would launch Marble to read the syntax definition script that is full of the lines seen above for generic syntax patterns, then looks for these patterns in the script.c text file and transpiles them to whatever target language script, here - output.js. 

Marble engine implementations should be built such that they can be invoked from CLI and programmatically, by calling a single function in a script.

### Motivation

I am creating this for fun and because i could not find something similar to this. Rather i found alot of specific s2s transpilers and a general purpose transpiler that is programmable, but it has to do with scripting the inner workings of the transpiler. The Marble way is to define patterns of syntax.

### Links, resources relating to Marble

* [A higher level abstract regex compiler](https://github.com/Ruminat/Asq-Server). It lets you define regex patterns with more readable syntax, specifically for csv table and such parsing.
* [General purpose scriptable transpiler for many languages](https://awesomeopensource.com/project/jarble/transpiler). Has support for many languages and lets you script addons to the engine.
* [GNU Bison](https://www.gnu.org/software/bison/) A general-purpose parser generator for grammar syntaxes in C.

### Name

The name "Marble" comes from the english word for a stone-like material, that is often used for sculpting sculptures. The act of building complex structures from a simple piece of stone. "Faber est suae quisque fortunae." - Every man is the artisan of his own fortune. And so is every great sculptor the picker of his marble.
