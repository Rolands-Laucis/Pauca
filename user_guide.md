### User guide. Syntax set creation help. Roadmap.

It may be difficult getting started with Marble, if you've never worked with creating or parsing a programming language syntax. So this document exists to help getting started making your own transpiler.

* Look at examples of the source language and start from the top
    * Notice what are the first lines at the top of the document. These must ultimately be transpiled and are often the simplest.
    * As we read scripts top down, then usually the logic is simplest at the top.
* Start with the basics.
    * Most C like languages contain 3 types of lines of code 
        * assignment/declaration 
        * jump/function call/code flow management
        * code block wrapping of these 2 ^
* Use comments to mark blocks of syntax that are similar to each other
* Use comments to show the transpilation expected source and outcome code snippets