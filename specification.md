#### VERSION 1.0

#### Fundamentals

### String literals

Tell marble to look for a string literal in the source

``[sym ""]`` shorthand: ``[""]``, see [Shorthands](#Shortcuts/shorthands)

``[sym "(",1,2]`` look for a "(" 1 to 2 times in a row.

### Syntax pattern bound

The end tag marks the end of the pattern to search for. The following tags should be opening and closing target tags. Every new syntax pattern begins on a new line, that isnt the target tag.

``... [end]``

### Defining the transpilation aka the Target

The target tag is used to tell marble, that the contents of the tag is the output of marble into the target language for a given piece of syntax. The output is literal and explicit. Special tags are used inside the target tag, to access tokens from the pattern or to generate and output string programatically.

```
[target]
...
[/target]
```
Marks a pattern in source to be transpiled to the contents of this tag into the output.

```
[target "c"]
...
[/target]
[target "js"]
...
[/target]
```
Marks a pattern to be transpiled differently for different target languages to one or multiple output files.

### Variables

Tell marble that a wildcard string is to be expected and save down its name in memory with a ref to it in the target tag.

Variables are assigned a label in the syntax to reference in the target however, if one is not supplied, then they are numbered in sequence with the 1-index scheme.

``[var]`` accesed in target with '[1]'

``[var] ... [var]`` accesed in target with '[1]' and '[2]' respectively. 

``[var "var_name"]`` accesed in target with '[var_name]'

This is THE variable tag, but other tags may be "varialbe tags", meaning that they are used the same as here, but have their own name and utility. Internally variable tags store their generated target output and copy paste it into the current pattern places via the label or numeration notation, i.e. [1].

### Labels

Any pattern tag can be given a label, with which to reference the tag and its value in the target, though sometimes that is not useful. Labels cannot be given inside taget tags, but the target tags accept a special case label, which informs Marble about the target language to transpile to, as seen in the [Targets](#Defining-the-transpilation-aka-the-Target) section. 
Labels are automatically escaped, see section [Escapes](#Escapes).
Labels are global, so overlaps or reassigns will cause problems with transpiling. However, there is an exception with the [rec] tag, see section [Slots and recursive patterns](#Slots-and-recursive-patterns).
A label is given after the tag name adding a space and in quotes the label name. E.g. previous example line.
Variables in the [target] tag are resolved in order: 
first as a string literal by label in the pattern, 
then as int literal by index in the pattern, 
then as just an int or string literal (in that order). 
Meaning '[1]', '[my_var]', '1', '"str_literal"' will all be resolved intuitively inside the target tag in that order of precedence and the last 2 only when used as arguments for other tags, like in the [if] tag.

### Types

Marble supports recognizing patterns of various kinds of symbols for strongly typed languages. These are the same as variables, but whereas the variable tag looks for any string, these specific variable tags look for specific type symbols. Some of these are just internal definitions of tags using existing primitve Marble syntax.

``[sym ""]`` shorthand: ``[""]``, see [Shorthands](#Shortcuts/shorthands) String literal

``[d "my_digit"]`` for digit/s.

``[d "my_digit",2,4]`` for 2 to 4 digits.

``[f "my_digit"]`` for float/s. Includes an optional appended 'f' as in the literal '0.1f'. Also supports handling integers and doubles.

``[f "my_digit",2,4]`` for 2 to 4 digits.

``[str "my_str"]`` for a matching literally - "abcd" including the double quotes.

``[str "my_str",2,9]`` a string pattern of 1 to 9 characters long (including the quotes).

``[str "my_str",all]``a string pattern of including all the quote characters, so strings by '' and "" and `` will match.

``[func "function"]`` will match the generic function call pattern in most languages e.g. Factorial(n) and My_func(p1, p2 "abc", p3 "123"[, ...]) for an infinite list of parameters.

### Operators

Under thought.

Sometimes you might want to perform some mathematical operations to convert the input to an output, i.e. to change the indexing numeration between languages. So Marble supports doing this in the target tag. But special tags must be used, since any normal characters are taken as a literal output to the target.

``[+]``

### Tag arguments

As seen in the above example, some tags take in a list of arguments. Indeed even the label assignment is internally just an argument passed to the tag object setup. Arguments are supplied after a space character after the tag name, then multiple args are delimited with a ",". E.g. previous section 2nd example.

#### Code flow

### Optionals/conditionals

Tell marble that a tag may or may not be present in the pattern. This is internally handled as a boolean variable and can be accessed as such.

``[?tag]``

``[? "opt1" tag]`` here the variable gets a label "opt1"

The ``[if 1][/if]`` tag in target is used for different cases of the transpilation. "1" refers to the 1st variable in the pattern. "?" marked tags are variables. 
If the [if] tag evaluates true, then the inside tokens and/or tags will be included (and inner tags evaluated) in the output. [if] tags can be nested.

```
[["let"],["var"]] [var] ... [end]
[target]
    [if [1]=let]
    ...
    [/if]
    [if [1]=var]
    ...
    [/if]
[/target]
```
The argument after "if " is evaluated. Here the [if] tag compares the first pattern element string with the literal string, to see which was matched.
This means that the [if] tag receives arguments like other tags, which means multiple evaluations can be done in 1 [if] tag by delimiting with ",". 

```
...
[if [1]=1,[3]>2]
...
[/if]
...
```

Any normal operator can be used. Both sides of the operator are a normal variable tag syntax or int and string literals.

### Loops

Marble supports looping in the target with the [loop] tag. It takes an integer argument of how many times the inner contents should be copied.

```
...
[target]
    [loop 2]
        something
    [/loop]
[/target]
``` 
will produce a result of "somethingsomething"

The argument can be a variable tag capture, if at that point durring transpiling the variable exists.

Optionally a 2nd argument can be given to mark the current loop iteration value into a variable with a label, that can then be used in the nested tags. To be consistent with most other languages, the loop indexing is 0-based.

```
...
[target]
    [loop 2,"count"]
        [count]
    [/loop]
[/target]
``` 
will produce a result of "01".

### Componenets and generalization

Since writing long syntax patterns for every case in a target languages syntax parse tree would be very long winded and lengthy, marble supports defining pattern components.
This is done by giving the end tag a label and referencing that pattern by its label in other patterns. To include a pattern use the [pat] tag, which is a variable tag. NB! Included pattern variables must all be labeled, if they are a component, they dont have a target. Pattern tags can be nested.

```
[c] [sym " "] [var "x"] [sym " = "] [d "number",1,10] [? "opt1" sym ";"] [end "var_tail"] // x = 0;
[target]
[x] = [number] [if [opt1]];[/if]
[/target]

[sym "let"] [pat "var_tail"] [end]
[sym "var"] [pat "var_tail"] [end]
[sym "const"] [pat "var_tail"] [end]
```

The targets for patterns arent nescesary, as is the case for the last 3 patterns for the sake of brevity. So the last 3 patterns wont transpile to anything in a real application. But this is intended to match js syntax of "let x = 0" or "let y = 12319283;" or "const num = 3472" by reusing a pattern as a component in another.
Pattern variables can be accessed by their labels.

But pattern components will also match and transpile on their own. To mitigate this, the [c] pre-tag is used. Check the [Component only pattern section](#Component-only-pattern) for more details.

### Multiples or arrays (tuples? arrays? lists? sets?)

The above example lists 3 patterns that all benefit from 1 common sub pattern reutilization. But its far too verbose to write out all the cases for a seemingly identical pattern. This can be replaced with tag multiples notated by the {} symbols, that will match any single in a list of tags in 1 place of the pattern. The above example can be simplified as:

``{[sym "let"],[sym "var"],[sym "const"]} [pat "var_tail"] [end]`` This 1 pattern is equivalent to the last 3 patterns in the above example. And can further be simplified as:
``{["let"],["var"],["const"]} [pat "var_tail"] [end]`` since [sym "let"] and ["let"] are identical tags.

However, since these 3 symbol string literals mean diffrent concepts in js, then we would like to know which one was actually matched. So using the sym tag list (aka a "multiple") makes it a variable tag. Its value can be accessed as '[1]'. Like such:

```
{["let"],["var"],["const"]} [pat "var_tail"] [end]
[target]
[1] [x] = [number] [if [opt1]];[/if]
[/target]
```
where '[1]' evaluates to e.g. "let" (excluding quotes)

Multiples arent for just different values of 1 tag, they are generic. Meaning you can tell Marble to expect any of the given tags with their values at a given spot in the pattern.

``[["string"],[var "my_var"]]`` variable tags should not be labeled, since their value will be accessible via '[1]' 

Multiples also are not restricted to a choice of just 1 tag per option.

``[["int"],["private "] ["int"]] ...``

Multiple options are matched by priority in the order that they are supplied left to right.

And since a multiple is not a tag itself, then the optional mark cannot be applied to it, likewise it would be illogical to add an optional mark to any tag within the multiple, if it is by itself. 

### Slots and recurring patterns

Under thought. THIS IS WRONG. THIS IS NOT RECURSION, BUT RATHER PATTERN SEGMENT REOCURRANCE. FIX THIS.

Marble supports pattern components for better generalization, but what if you want to reference the current pattern in itself? Recursion is tricky, but you can tell Marble that a pattern can be recurring with the [rec] tag.

``[rec] [" "] [var "x"] [" = "] [d "num",1,10] {["\,"],[";"]} [/rec] [end "var_tail"]`` the whole pattern inside [rec] can repeat any number of times. Meaning it could match " x = 0, y = 0;" for an infinite amount of times with this short pattern here.

This can be used in a component like such:

``["int"] [pat "var_tail"]`` meaning it could match "int x = 0;" and "int x = 0, y = 0;". This itself can be marked as recurring, the applications for which you can probably guess. 

Then in the [target] tag a [slot] tag must exist. This marks where the inner level output should be dumped in the outter level. This just recursively dumps the discovered output of inner patterns up a level; it is not transpiled output yet. The full transpilable output is only being constructed at this stage. 

```
... [rec] ... [/rec] ... [end]

[target]
outter something
[slot] //the inner somethings discovered output will be dumped here unprocessed.
[/target]
```

The [slot] tag can sit anywhere inside the [target], which means you can discover and handle code blocks - like multiple lines inside a function or multiple functions inside classes. You could define a 1 line of code pattern, which in most languages is usually just an assignment or function call line.

```
[target]
function {
    [slot]
}
[/target]
```

But note that all recursive pattern output targets are identical and Marble is just replacing the outter [slot] tag with the discovered inner target code, which may contain a [slot] as well. So the above example could potentially output:

```
function {
    function {
        ...
    }
}
```

Recursiveness is scoped, so you still need labels for all variables within a recursive pattern, but each recursive pattern match would have its own variables with those labels.

lvl 1:
```
... [rec] ... [/rec] ... [end]

[target]
[1] ... [2] ...
inner something
[slot]
[/target]
```

when it goes 1 level out, then it becomes

lvl 0: aka base pattern:
```
... [rec] ... [/rec] ... [end]

[target]
[1] ... [2] ...
outter something
[1] ... [2] ...
inner something
[slot]
[/target]
```

This is also quite useful for LISP languages, where you could define a generic list with multiple possibilities in the arguments and have it be recursive, such that a list argument could be another list just like it.

#### Pre-tags

Here are some useful tags for code flow of Marbles parser. Instruct Marble to treat some patterns differently.

## New line

Sometimes you may want to match a pattern in source only, if it is preceded by a new line character, i.e. a line of source code on its own line from the start of the line. You do this by prefixing a pattern with the [n] tag.

``[n] ["let"] ...``

## Component only pattern

Sometimes you want to define a component pattern, but dont want Marble to transpile lines that match it. For this you can use the [c] component tag.

``[c] ... [end "var_tail"]`` so you can use this pattern as a component in other patterns, but Marble will not transpile these lines, when Marble sees them.

## Indents

Source code is often indented, so marble supports keeping these indents in the output, if it is set up right. The indent tag can be used for this and other purposes. It captures a string of symbols into a variable, that can then be inserted back into the transpilation output text. The [i] tag is internally treated as a variable and can be accessed as such.

``[i] [sym "int"] ...`` will capture any length repeating "\t","\s" character strings into a variable. It may be accessed as '[1]', which would be a string of tabs and/or spaces here, so you can insert them back into the target. This is crutial for languages like python.

## Comments

The rest of a line after "//" is ignored by Marble.

``... //...``

#### Specials

### Pre-pend and Post-pend tags

Sometimes you may want to add extra code at the top or bottom of the transpiled script, so marble lets you do this with these 2 tags. These dont look for a pattern, but tell Marble to add this target code snippets to the top and/or bottom of the script once it is done.

```
[pre] [end]
[target]
#include <std.h>
...
[/target]
```

```
[post] [end]
[target]
...
exit(0)
[/target]
```

### Shortcuts/shorthands

The tag based syntax of Marble is nescesary to allow literal target outputs, but this often creates long winded patterns. To help mitigate this, some special tags have been reserved that literally get replaced with their full lengths before Marble starts transpiling. Here is a list of them (left side is the short form):

``[""]`` -> ``[sym ""]`` a literal symbol string in the source
``[s]`` -> ``[?" "]`` an optional space character
``[;]`` -> ``[?";"]`` an optional ;

### Regex

Marble internally uses a regex engine to look for these patterns. But marble is more than a renamed and limited regex. Marble contructs efficient regex patterns in a reductive paradigm.
But this also means that the user can just supply their own regex to be matched within the pattern. Note that this is not the intended use of Marble and can potentialy cause faults with the inner workings of Marble. This gives you powerful control, so it is your responsibility.

Since Marble is written in js, then standard js regex literals may be used. Other implementations may vary.

``[re "/[A-Z]{2,4}/gm"] ...`` will match an uppercase letter string of length 2 to 4 using the flags for global and multiline.

The regex flags are ignored by Marble, since that is nescesary for Marble to use regex itself internally.

### Custom tags

Under thought.

Marble allows you to define custom tags which is different from but similar to defining pattern components. You may also link to other marble syntax files to import them, thus maintaining a library of custom tags and pattern components to use in any marble syntax file for actual transpiling. Indeed the marble standard lib tags are defined this way and the lib is imported by default.

```
[def]

[/def]
```

### Escapes

Under thought.

Since Marble has a syntax of its own to define other language syntaxes, there is by nature some overlap of reserved special meaning characters. So to let symbols like "[" be usable in the various tags, they may be escaped with the "\" symbol inside the target. Outside the target, anything inside quotes "" is automatically escaped, except the different quote marks themselves, which then need to be escaped with the "\" symbol. But of course strings may end with a "\" symbol, so the "\" symbol may be itself escaped with a "\" symbol.

The nature of Marbles syntax means that common C like language array indexing or constructing patterns will need escaping in the target. E.g. "array[1]".

```
...
[target]
...
var\[index\]
...
[/target]
```

``["something \\"] ['a quote \" symbol and also \' this one']`` -> "something \" and "a quote " symbol and also ' this one"