#### VERSION 1.0


### String literals

Tell marble to look for a string literal in the source

``[sym ""]``

shorthand:

``[""]``

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

### Labels

Any pattern tag can be given a label, with which to reference the tag and its value in the target, though sometimes that is not useful. Labels cannot be given inside taget tags, but the target tags accept a special case label, which informs Marble about the target language to transpile to, as seen in the [Targets](#Defining-the-transpilation-aka-the-Target) section. 
Labels are automatically escaped, see section [Escapes](#Escapes).
Labels are global, so overlaps or reassigns will cause problems with transpiling. However, there is an exception with the [rec] tag, see section [Slots and recursive patterns](#Slots-and-recursive-patterns).
A label is given after the tag name adding a space and in quotes the label name. E.g. previous example line.

### Types

Marble supports recognizing patterns of various kinds of symbols for strongly typed languages. These are the same as variables, but whereas the variable tag looks for any string, these specific variable tags look for specific type symbols. Some of these are just internal definitions of tags using existing primitve Marble syntax.

``[d "my_digit"]`` for digit/s.

``[d "my_digit",2,4]`` for 2 to 4 digits.

``[str "my_str"]`` for a matching literally - "abcd" including the double quotes.

``[str "my_str",2,9]`` a string pattern of 1 to 9 characters long (including the quotes).

``[str "my_str",all]``a string pattern of including all the quote characters, so strings by '' and "" and `` will match.

``[func "function"]`` will match the generic function call pattern in most languages e.g. Factorial(n) and My_func(p1, p2 "abc", p3 "123"[, ...]) for an infinite list of parameters.

### Tag arguments

As seen in the above example, some tags take in a list of arguments. Indeed even the label assignment is internally just an argument passed to the tag object setup. Arguments are supplied after a space character after the tag name, then multiple args are delimited with a ",". E.g. previous section 2nd example.

### Optionals/conditionals

Tell marble that a tag may or may not be present in the pattern. This is internally handled as a boolean variable and can be accessed as such.

``[?tag]``

``[? "opt1" tag]`` here the variable gets a label "opt1"

The ``[if 1][/if]`` tag in target is used for different cases of the transpilation. "1" refers to the 1st variable in the pattern. "?" marked tags are variables. 
If the [if] tag evaluates true, then the inside tokens and/or tags will be included (and inner tags evaluated) in the output. [if] tags can be nested.

```
[["let"],["var"]] [var] ... [end]
[target]
    [if 1=let]
    ...
    [/if]
    [if 1=var]
    ...
    [/if]
[/target]
```
The argument after "if " is evaluated. Here the [if] tag compares the first pattern element string with the literal string, to see which was matched.
This means that the [if] tag receives arguments like other tags, which means multiple evaluations can be done in 1 [if] tag by delimiting with ",". 

```
...
[if 1=1,3>2]
...
[/if]
...
```

Any normal operator can be used. Left side of the operator is a variable number or variable label in the pattern. Right side is either a number, or if cant be parsed as one, then it is treated as a string literal.

### Comments

The rest of a line after "//" is ignored by Marble.

``... //...``

### Componenets and generalization

Since writing long syntax patterns for every case in a target languages syntax parse tree would be very long winded and lengthy, marble supports defining pattern components.
This is done by giving the end tag a label and referencing that pattern by its label in other patterns. To include a pattern use the pat tag. NB! Included pattern variables must all be labeled. Pattern tags can be nested.

```
[sym " "] [var "x"] [sym "   "] [d "number",1,10] [? opt1 sym ";"] [end "var_tail"] // x   0;
[target]
[x]   [number] [if opt1];[/if]
[/target]

[sym "let"] [pat "var_tail"] [end]
[sym "var"] [pat "var_tail"] [end]
[sym "const"] [pat "var_tail"] [end]
```

The targets for patterns arent nescesary, as is the case for the last 3 patterns for the sake of brevity. So the last 3 patterns wont transpile to anything in a real application. But this is intended to match js syntax of "let x   0" or "let y   12319283;" or "const num   3472" by reusing a pattern as a component in another.
Pattern variables can be accessed by their labels.

### Multiples or arrays (tuples? arrays? lists? sets?)

The above example lists 3 patterns that all benefit from 1 common sub pattern reutilization. But its far too verbose to write out all the cases for a seemingly identical pattern. This can be replaced with tag multiples notated by the {} symbols, that will match any single in a list of tags in 1 place of the pattern. The above example can be simplified as:

``{[sym "let"],[sym "var"],[sym "const"]} [pat "var_tail"] [end]`` This 1 pattern is equivalent to the last 3 patterns in the above example. And can further be simplified as:
``{["let"],["var"],["const"]} [pat "var_tail"] [end]`` since [sym "let"] and ["let"] are identical tags.

However, since these 3 symbol string literals mean diffrent concepts in js, then we would like to know which one was actually matched. So using the sym tag list (aka a "multiple") makes it a variable tag. Its value can be accessed as '[1]'. Like such:

```
{[sym "let"],[sym "var"],[sym "const"]} [pat "var_tail"] [end]
[target]
[1] [x]   [number] [if opt1];[/if]
[/target]
```
where '[1]' evaluates to e.g. "let" (excluding quotes)

Multiples arent for just different values of 1 tag, they are generic. Meaning you can tell Marble to expect any of the given tags with their values at a given spot in the pattern.

``[["string"],[var "my_var"]]`` variable tags should not be labeled, since their value will be accessible via '[1]' 

Multiples also are not restricted to a choice of just 1 tag per option.

``[["int"],["private "] ["int"]] ...``

Multiple options are matched by priority in the order that they are supplied left to right.

And since a multiple is not a tag itself, then the optional mark cannot be applied to it, likewise it would be illogical to add an optional mark to any tag within the multiple, if it is by itself. 

### Loops

Marble supports looping in the target. Yes.

### Slots and recursive patterns

so wrap a part of the pattern in the rec, so that means the rec will automatically have the ? mark, so make sure finite loops, but then also have to use the [slot] tag in the target, to mark where the lower level constructed targed code should be copy pasted to in the current target tag. 
It is recursive, cuz we go down like a funnel into the pattern and then go bottom up back out of it, constructing the target.

Marble supports pattern components for better generalization, but what if you want to reference the current pattern in itself? Recursion is tricky, but you can tell Marble that a pattern can be recursive with the [rec] tag.

``[rec] [" "] [var "x"] ["   "] [d "num",1,10] {["\,"],[";"]} [/rec] [end "var_tail"]`` the whole pattern before rec can repeat any number of times. Meaning it could match " x   0, y   0;"

This can be used in a component like such:

``["int"] [pat "var_tail"]`` meaning it could match "int x   0;" and "int x   0, y   0;". This itself can be marked as recursive, the applications for which you can probably guess. 

Recursiveness is scoped, so you still need labels for all variables within a recursive pattern, but each recursive pattern match would have its own variables with those labels.

This is very useful for LISP languages, where you could define a generic list with multiple possibilities in the arguments and have it be recursive, such that a list argument could be another list just like it.


```
lvl 1:
[target]
[1] ... [2]
something
[slot]
[/target]
```

when it goes 1 level out, then it becomes

```
lvl 0: aka base pattern:
[target]
[1] ... [2]
other line
[1] ... [2]
something
[slot]
[/target]
```

### Indents

Source code is often indented, so marble supports keeping these indents in the output, if it is set up right. The indent tag can be used for this and other purposes. It captures a string of symbols into a variable, that can then be inserted back into the transpilation output text. The ind tag is internally treated as a variable and can be accessed as such.

``[ind] [sym "int"] ...`` will capture any length repeating "\t","\s" character strings into a variable. It may be accessed as '[1]', which would be a string of tabs and/or spaces here, so you can insert them back into the target. This is crutial for languages like python.

Internally this tag is defined as just a multiple of the 2 symbol literal tags.

### Regex

Marble internally uses a regex engine to look for these patterns. But marble is more than a renamed and limited regex. Marble contructs efficient regex patterns in a reductive paradigm.
But this also means that the user can just supply their own regex to be matched within the pattern. Note that this is not the intended use of Marble and can potentialy cause faults with the inner workings of Marble. This gives you powerful control, so it is your responsibility.

Since Marble is written in js, then standard js regex literals may be used.

``[re "/[A-Z]{2,4}/gm"] ...`` will match an uppercase letter string of length 2 to 4 using the flags for global and multiline.

### Custom tags

Marble allows you to define custom tags which is different from but similar to defining pattern components. You may also link to other marble syntax files to import them, thus maintaining a library of custom tags and pattern components to use in any marble syntax file for actual transpiling. Indeed the marble standard lib tags are defined this way and the lib is imported by default.

```
[def]

[/def]
```
idk man

### Escapes

Since Marble has a syntax of its own to define other language syntaxes, there is by nature some overlap of reserved special meaning characters. So to let symbols like "[" be usable in the various tags, they may be escaped with the "\" symbol inside the target. Outside the target, anything inside quotes "" is automatically escaped, except the different quote marks themselves, which then need to be escaped with the "\" symbol. But of course strings may end with a "\" symbol, so the "\" symbol may be itself escaped with a "\" symbol.

```
...
[target]
...
var\[index\]
...
[/target]
```

``["something \\"] ['a quote \" symbol and also \' this one']`` -> "something \" and "a quote " symbol and also ' this one"