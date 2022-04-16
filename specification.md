#### VERSION 1.0

## Foreword

This specification document is most likely out of date, but the language internals are never. [Full grammar of Pauca](./imp_js/grammar.js) ; [Example Pauca algorithms](./examples/) ; [Grammar unit tests](./imp_js/tests/gram_tests.js)

#### Fundamentals

In a .pau file define pattern blocks. For patterns define an associated target block. Patterns are what to look for in the input.txt (source), targets are what to generate into the output.txt. 

### Blocks

A few lists act as blocks instead of regular LISP lists, meaning they are double lists - begging list that acts as a normal list, an ending list that does nothing and a body between them.

I.e. ``[p] ... [/p]`` ; ``[if [> 1 2]] ... [/if]``. blocks end with an empty list of the same name, but with a preceding slash. The body of a block can be literal text, lists and other blocks.

### Pattern lists

Pattern block lists (their functions) have a different meaning than the lists allowed in the target block. But they are internally parsed the same. Still you shouldnt use functions where they are not intended. These are the lists you can use in the pattern block.

## String literals

Tell Pauca to look for a string literal in the source

``[sym "public int "]`` shorthand: ``[""]``, see [Shorthands](#Shortcuts/shorthands)

## Variables

Tell Pauca that a wildcard string (\w+) is to be captured and save it by label in memory. These can then be accesed in the target block by that label in brackets or index in the pattern, making labels optional but encouraged.

* ``[var "var_name"]`` accesed in target with '[var_name]'

* ``[var] ... [var]`` accesed in target with '[1]' and '[2]' respectively. 

This is THE variable list, but other lists may be "varialbe lists", meaning that they are used the same as here, but have their own name and utility. This is to keep in mind when accessing variables via index, as you might retreive the wrong variable.

## Types

Pauca supports recognizing patterns of various kinds of symbols. These are the same as variable lists, but whereas the variable list looks for any \w+ string, these specific variable tags look for other specific symbols.

* ``[sym ""]`` shorthand: ``[""]``, see [Shorthands](#Shortcuts/shorthands) String literal

* N/A ``[d "my_digit"]`` for digit/s. same as \d+

* N/A ``[f "my_digit"]`` for float/s. Includes an optional appended 'f' as in the literal '0.1f'. Also supports handling integers and doubles.

* N/A ``[str "my_str"]`` for a matching literally - "abcd" including the double quotes.

* N/A ``[func "function"]`` will match the generic function call pattern in most languages e.g. Factorial(n) and My_func(p1, p2 "abc", p3 "123"[, ...]) for an infinite list of parameters.

## Multiples or arrays (tuples? arrays? lists? sets?)

Under thought. N/A.
```
[p] [or ["public"] [var "scope"]] ... [/p]
```

## Componenets and generalization

Under thought. N/A.
```
[c] [c "var_tail"] 
```

## Pre-lists

Under thought. N/A.
``[p] [n] ... [/p]`` [n] - new line
``[p] [i] ... [/p]`` [n] - indent like tabs and spaces

### Comments

The rest of a line after "//" is ignored by Pauca.
``... //...``

### Target lists

The target block is used to tell Pauca, that the processed contents of the block is the output of this pattern. The output is literal utf-8 text, except for the symbols `[` and `]`, which begin and end a list. These currently cannot be escaped.

```
(pattern)
[target]
...
[/target]
[target "js"]
...
[/target]
```
The target block accepts 1 argument - a target output file to write to, since you will be able to generate multiple outputs from a single input.

NB! ALL lists resolve to strings at the end, but in intermediate stages can be numbers or other js datatypes. This means that all lists inside of the target will print to the output. There is a special list that executes, but doesnt print.

## Variable lists

Variables from the pattern can be fetched (referenced) inside the target, which is the main powerful aspect of the Pauca engine.

```
[p] [var "x"] [/p]
[target]
    [x] [0]
[/target]
```
When the pattern matches against something in the input.txt, a variable string will be captured with a label of "x", which can be written to the output by referecing it either by its label or index in the pattern. If the captured string can be parsed as a number, then it will be.

Pauca also lets you define more variables durring runtime.
```
[p] [var "x"] [/p]
[target]
    [def [y] 1]
    [= [z] 2]
[/target]
```
"def" and "=" are identical and both set the first argument equal to the second and save that down into memory, overwriting existing definitions, aka reasigning. Both will also return the created value.

## Operator lists

Sometimes you might want to perform some mathematical operations to convert the input to an output. There are arithmatic operators (AOP) and logical operators (LOP).

[See full list of operators](./imp_js/grammar.js) under Grams.OP

AOP (+, -, /, *, ^, %, !):
* ``[+ 1 2]`` returns the sum of operands = 1 + 2
* ``[+ 1 2 3]`` supports infinite operands = 1 + 2 + 3
* ``[+ 1 [- 2 1]]`` operands can be other lists
* ``[+ [x] 2]`` operands can be variables, and if the first arg is a variable then it will be asigned the result of the operation = if x was 1, now it will be 3, and the list returns 3 as well

LOP (==, >, <, >=, <=, |, &):
* ``[> 1 2]`` supports only 2 operands = 1 > 2 ?
* ``[> [x] 2]`` supports variable operands = x > 2 ?
* N/A ``[== [> [x] 2] true]`` nested 

## Special lists

* ``[\ ...]`` takes infinite lists and executes them, if they can be, and returns an empty string. This is like suppressing writting to output. "dont print".
* ``[print ...]`` takes infinite lists, executes them and prints their return value to the console. Returns empty string.

### Code flow

## Conditionals

```
(pattern)
[target]
    [if [x]]
        ...
    [/if]

    [if [> [x] 2]]
        ...
    [/if]
[/target]
```

## Loops

```
(pattern)
[target]
    [loop 2]
        ...
    [/loop]
[/target]
``` 

## Functions

Under thought. N/A.
```
[defn [args]]
    [lists] ...
[/defn]
```

#### Specials

### Pre-pend and Post-pend lists

Sometimes you may want to add extra code at the top or bottom of the transpiled script, so Pauca lets you do this with these 2 tags. These dont look for a pattern, but tell Pauca to add this target code snippets to the top and/or bottom of the script once it is done.

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

The tag based syntax of Pauca is nescesary to allow literal target outputs, but this often creates long winded patterns. To help mitigate this, some special tags have been reserved that literally get replaced with their full lengths before Pauca starts transpiling. Here is a list of them (left side is the short form):

``[""]`` -> ``[sym ""]`` a literal symbol string in the source

``[s]`` -> ``[?" "]`` an optional space character

``[;]`` -> ``[?";"]`` an optional ;


### Regex

Under thought. N/A.

Since Pauca is written in js, then standard js regex literals may be used. Other implementations may vary.

``[re "/[A-Z]{2,4}/gm"] ...``

### Escapes

Under thought. N/A.

Since Pauca has a syntax of its own to define other language syntaxes, there is by nature some overlap of reserved special meaning characters. So to let symbols like "[" be usable in the various tags, they may be escaped with the "\" symbol inside the target. Any text outside a list is literal output. Lists resolve to strings which will appear in the same spot in the text.

```
(pattern)
[target]
    ...array\[index\]
[/target]
```