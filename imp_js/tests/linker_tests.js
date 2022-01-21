//node grammer_tests.js
import { LinkPat, pat_grams as p, CastTagToRegex, CastPatToRegex, ResolveFromContext } from "../linker.js";

Array.prototype.equals = function (arr) {
    if (!arr)
        return false;
    if (this.length != arr.length)
        return false;

    //compare all elements side by side. This will exit early, if there is a mismatch
    return this.every((e, i) => e === arr[i])
}

/**
 * Testing function
 * @param {string} name
 * @param {Array} generated
 * @param {Array} expected
 */
function test(name, generated, expected) {
    if (generated.equals(expected))
        console.log(`✔️\t${name} PASS`)
    else
        console.log(`❌\t${name} FAIL - GOT [${[generated[0].name, ...generated.slice(1)]}] BUT EXPECTED [${[expected[0].name, ...expected.slice(1)]}]`)
}

/**
 * Testing function for single values
 * @param {string} name
 * @param generated
 * @param expected
 */
function test_singles(name, generated, expected) {
    if (generated === expected)
        console.log(`✔️\t${name} PASS`)
    else
        console.log(`❌\t${name} FAIL - GOT [${generated}] BUT EXPECTED [${expected}]`)
}

// process.exit(0)

//sym
console.log('📝 Testing symbol tags...')
test('symbol full tag', LinkPat('sym "smth"'), [p['sym'], 'smth'])
test('symbol short tag', LinkPat('"smth"'), [p[''], 'smth'])

//var
console.log('📝 Testing variable tags...')
test('variable full tag', LinkPat('var "x"'), [p['var'], 'x'])
test('variable tag no label', LinkPat('var'), [p['var']])

var match = "let x y".match(CastPatToRegex(['"let "', 'var "x"', '" "', 'var'].map(tag => LinkPat(tag))))
test_singles('variable tag resolve to literal', ResolveFromContext(match, 1), 1)
test_singles('variable tag resolve to literal', ResolveFromContext(match, '1'), 1)
test_singles('variable tag resolve by index', ResolveFromContext(match, '[1]'), 'x')
test_singles('variable tag resolve by index 2nd var', ResolveFromContext(match, '[2]'), 'y')
test_singles('variable tag resolve by label', ResolveFromContext(match, 'x'), 'x')

//end
console.log('📝 Testing ending tags...')
test('end full tag', LinkPat('end "smth"'), [p['end'], 'smth'])
test('end tag no label', LinkPat('end'), [p['end']])

//pretags
console.log('📝 Testing pre-tags...')
test('new line capture tag', LinkPat('n'), [p['n']])
test('indent capture tag', LinkPat('i'), [p['i']])

//recursive
console.log('📝 Testing recursive tags...')
test('rec start tag', LinkPat('rec'), [p['rec']])
test('rec end tag', LinkPat('/rec'), [p['/rec']])

//add
// console.log('📝 Testing operator tags...')
// test_singles('add tag literals', ResolveFromContext(match, 'x'), 'x')
