
#### String literals

Tell marble to look for a string literal in the text

``<sym="">``

shorthand:

``<"">``

#### Syntax pattern bound

The end tag marks the end of the pattern to search for. The following tags should be opening and closing target tags. Every new syntax pattern begins on a new line, that isnt the target tag.

``<end>``

#### Defining the transpilation

The target tag is used to tell marble, that the contents of the tag is the output of marble into the target language for a given piece of syntax. The output is literal and explicit. Special tags are used inside the target tag, to access tokens from the pattern or to generate and output string programatically.

```
<target>
...
</target>
```

#### Variables

Tell marble that a wildcard string is to be expected and save down its name in memory with a ref to it in the target tag.

Variables are assigned a label in the syntax to reference by in the target however, if one is not supplied, then they are numbered in sequence with the 1-index scheme.

``<var>`` accesed in target with '<1>'

``<var> ... <var>`` accesed in target with '<1>' and '<2>' respectively. 

``<var="var_name">`` accesed in target with '<var_name>'

#### Types

Marble supports recognizing patterns of various kinds of symbols for strongly typed languages. These are the same as variables, but whereas the variable tag looks for any string, these specific variable tags look for specific type symbols.

``<d="my_digit">`` for digit/s 

``<d="my_digit",2,4>`` for 2 to 4 digits

``<str="my_str">`` for a matching literally - "abcd" including the double quotes.

``<str="my_str",2,9>`` a string pattern of 1 to 9 characters long (including the quotes)

``<str="my_str",all>``a string pattern of including all the quote characters, so strings by '' and "" will match

#### Optionals/conditionals

Tell marble that a tag may or may not be present in the pattern. This is internally handled as a boolean variable and can be accessed as such.

``<?tag>``

``<?="opt1" tag>`` here the variable gets a label "opt1"

The ``<if=1></if>`` tag in target is used for different cases of the transpilation. "1" refers to the 1st variable in the pattern. "?" marked tags are variables. 
If the <if> tag evaluates true, then the inside tokens and/or tags will be included or evaluated in the output. <if> tags can be nested.

#### Loops



#### Comments

``//...``

#### Componenets and generalization

Since writing long syntax patterns for every case in a target languages syntax parse tree would be very long winded and lengthy, marble supports defining pattern components.
This is done by giving the end tag a label and referencing that pattern by its label in other patterns. To include a pattern use the pat tag. NB! Included pattern variables must all be labeled. Pattern tags can be nested.

```
<sym=" "> <var="x"> <sym=" = "> <d="number",1,10> <?=opt1 sym=";"> <end="var_tail">
<target>
<x> = <number> <if=opt1>;</if>
</target>

<sym="let"> <pat="var_tail"> <end>
<sym="var"> <pat="var_tail"> <end>
<sym="const"> <pat="var_tail"> <end>
```

The targets for patterns arent nescesary, as is the case for the last 3 patterns for the sake of brevity. But this is intended to match js syntax of "let x = 0" or "let y = 12319283;" or "const num = 3472" by reusing a pattern as a component in another.
Pattern variables can be accessed by their labels.

#### Multiples

The above example lists 3 patterns that all benefit from 1 common sub pattern componentilization. But it far too verbose to write out all the cases for a seemingly identical pattern. This can be replaced with symbol tag multiples, that will match a list of literal strings in 1 place of the pattern. The above example can be simplified:

``<sym=["let","var","const"]> <pat="var_tail"> <end>`` This is equivalent to the last 3 patterns in the above example.

However, since these 3 symbol string literals mean diffrent concepts in js, then we would like to know which one was actually matched. So using the sym tag with a list (aka a "multiple") makes it a variable tag. Its value can be accessed as '<1>'. Like such:

```
<sym=["let","var","const"]> <pat="var_tail"> <end>
<target>
<1> <x> = <number> <if=opt1>;</if>
</target>
```