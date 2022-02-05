//node grammer_tests.js
import { LinkPat, pat_grams as p, CastPatToRegex, ResolveFromContext, LinkTar, tar_grams as t } from "../linker.js";

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
        console.log(`❌\t${name} FAIL - GOT\n${[generated[0].name, ...generated.slice(1)]}\nBUT EXPECTED\n${[expected[0].name, ...expected.slice(1)]}\n`)
}

/**
 * Testing function
 * @param {string} name
 * @param {Array} generated
 * @param {Array} expected
 */
function jtest(name, generated, expected) {
    if (JSON.stringify(generated) == JSON.stringify(expected))
        console.log(`✔️\t${name} PASS`)
    else
        console.log(`❌\t${name} FAIL - GOT\n${JSON.stringify(generated)}\nBUT EXPECTED\n${JSON.stringify(expected)}\n`)
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
        console.log(`❌\t${name} FAIL - GOT\n${generated}\nBUT EXPECTED\n${expected}\n`)
}

const test_cases = ['if'] //'symbol', 'variable', 'ending', 'pre_tags', 'recursive', 'if'

if (test_cases.includes('symbol')) {
    console.log('📝 Testing symbol tags...')
    test('symbol full tag', LinkPat('sym "smth"'), [p['sym'], 'smth'])
    test('symbol short tag', LinkPat('"smth"'), [p[''], 'smth'])
}

if (test_cases.includes('variable')) {
    console.log('📝 Testing variable tags...')
    test('variable full tag', LinkPat('var "x"'), [p['var'], 'x'])
    test('variable tag no label', LinkPat('var'), [p['var']])

    console.log('📝 Testing variable resolving from context...')
    var match = "let x y".match(CastPatToRegex(['"let "', 'var "x"', '" "', 'var'].map(tag => LinkPat(tag))))
    test_singles('variable tag resolve to literal', ResolveFromContext(match, 1), 1)
    test_singles('variable tag resolve to literal', ResolveFromContext(match, '1'), 1)
    test_singles('variable tag resolve by index', ResolveFromContext(match, '[1]'), 'x')
    test_singles('variable tag resolve by index 2nd var', ResolveFromContext(match, '[2]'), 'y')
    test_singles('variable tag resolve by label', ResolveFromContext(match, 'x'), 'x')
}

if (test_cases.includes('ending')) {
    console.log('📝 Testing ending tags...')
    test('end full tag', LinkPat('end "smth"'), [p['end'], 'smth'])
    test('end tag no label', LinkPat('end'), [p['end']])
}

if (test_cases.includes('pre_tags')) {
    console.log('📝 Testing pre-tags...')
    test('new line capture tag', LinkPat('n'), [p['n']])
    test('indent capture tag', LinkPat('i'), [p['i']])
}

if (test_cases.includes('recursive')){
    console.log('📝 Testing recursive tags...')
    test('rec start tag', LinkPat('rec'), [p['rec']])
    test('rec end tag', LinkPat('/rec'), [p['/rec']])
}

if (test_cases.includes('if')) {
    console.log('📝 Testing IF tags...')
    // console.log(JSON.stringify())

    jtest('single IF block', LinkTar(['before block', '1[if [1]>2]', 'inside', '1[/if]', 'after block']), ['before block', [t['if'],'[1]>2', ['inside']], 'after block'])
    jtest('single nested IF block', LinkTar(['1[if [1]>2]', ' var ', '2[if [1]>2]', ' something ', '2[/if]', '1[/if]']), [[t['if'], "[1]>2", [" var ", [t['if'], "[1]>2", [" something "]]]]])

    jtest('double IF block', LinkTar(['1[if [1]>2]', ' var ', '1[/if]', '2[if [1]>2]', ' something ', '2[/if]']), [[t['if'], "[1]>2", [" var "]], [t['if'],"[1]>2",[" something "]]])
    jtest('double nested IF block', LinkTar(['1[if [1]>2]', ' var ', '2[if [1]>2]', ' something ', '2[/if]', '3[if [1]>2]', ' something else ', '3[/if]', '1[/if]']), [[t['if'], "[1]>2", [" var ", [t['if'], "[1]>2", [" something "]], [t['if'],"[1]>2",[" something else "]]]]])
}

