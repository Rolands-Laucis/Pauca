# The Marble language transpiler syntax and spec - the idea

## What is Marble?
Marble is a universal pseudo code language syntax for writing transpilers for other languages. It does not execute anything, it merely translates from 1 programming language to another, via easily definable syntax patterns in the source code text file. These patterns are mapped to corresponding syntax in the output target language syntax. The mapping is manual - using Marble. Marble of course also has its own syntax for enabling you to do things. Lets explore it.

### So how do you define anything in Marble? What tells Marble to search for syntax?

using angle brackets to define tags like html and xml. The inside of angle bracket says what type of tag it is - its functionality in the Marble syntax.

``<sym="int">`` tells Marble to look for a symbol string "int". A literal string in the source code text file.

These can be chained together, delimiting tags by spaces, since thats how Marble will tokenize the syntax file. Like so:

``<sym="public"> <sym=" "> <sym="int">``

This will match any line of text that is similar to "public int". "sym" tags are just string literals to search for, so most often in programming languages these are language reserved keywords. But you can look for any string literal, since marble aims for generalization.

You can use Marble to create flavors of whatever language you desire and transpile the source code text file before handing it to the corresponding language compiler or interpreter. Like so:

``<sym="public-ish"> <sym=" "> <sym="int">``

"Public-ish" is not a reserved keyword in C like languages, but you can introduce it via Marble. What you do with this match is up to you to define. 

### Variables in Marble.

Marble knows about high-level language concepts in common languages and generalizes them for easy use into their own tags. Like the variable tag:

``<sym="int"> <sym=" "> <var>``

This will match any line of text that is similar to "int my_var", "int x" etc. It will then remember that whatever came after "int " is a string literal for a variable in the source text. This is useful, since you can give an ID to each variable in the syntax for later use in more complex patterns.

``<sym="int"> <sym=" "> <var="var_1">``

Marble will remember internally whatever comes after "int " as "var_1".

### A common pattern definition for a strongly typed language.

``<sym="int"> <sym=" "> <var="var_1"> <sym=" "> <sym="="> <sym=" "> <var="var_2"> <sym=";">``

This will match any line of text that is similar to "int my_var = 1;", "int x = abc;" etc. Note that the second match is invalid syntax in C like languages. Also note that this line is unnecessarily long and can be shortened by removing the space characters.

### The transpile definition.

So far we've only defined what patters marble should look for, but not what to do with them or how to transpile them. The "end" tag is used to mark the end of the syntax.

<sym="int "> <var="var_1"> <sym=" = "> <var="var_2"> <?sym=";"> <end>
<target>
int x
</target>

Here the match string "int abc" will be output to the target language source code text file as the line "int x". However, we can use our saved variable in the transpiled code, like such:

<sym="int "> <var="var_1"> <sym=" = "> <var="var_2"> <?sym=";"> <end>
<target>
integer <var_1>
</target>

Which will transpile a line like "int abc" into "integer abc". The "target" tag also accepts an argument for a specific language, so you can define multiple language transpilations from 1 generic syntax pattern, like such:

<sym="int "> <var="var_1"> <sym=" = "> <var="var_2"> <?sym=";"> <end>
<target="c">
int <var_1> = 0;
</target>
<target="js">
let <var_1>
</target>

### Optional tags.

Marble lets you mark any tag as optional, meaning the search can match a line even if some tag is missing. Like such:

``<sym="int "> <var="var_1"> <sym=" = "> <var="var_2"> <?sym=";">``

This will match any line of text that is similar to "int x = 1;", "int x = 1" etc. This is useful for generalizing across languages that have/have'nt line terminator symbols. But also for creating multiple transpile cases in 1 syntax definition.

Given the tools we've looked at so far, means that you can write 1 generic syntax pattern that can be used for multiple input languages to be transpiled to multiple other languages. Kinda cool, huh?

## Running Marble.

Marble is built with Node.js so it is required to launch the transpiler simply through a CLI. Download Marble source and run in terminal:

``node marble syntax.mrb script.c output.js``

``node marble [.mrb] [input] [output]``

This will launch marble to read the syntax definition script that is full of the lines seen above for generic syntax patterns, then looks for these patterns in the script.c text file and transpiles them to whatever target language script, here - output.js. 