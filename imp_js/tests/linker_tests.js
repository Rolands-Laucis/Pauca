//node grammer_tests.js
import { LinkPatToken, pat_grams as p, CastPatToRegex, ResolveFromContext, LinkTar, tar_grams as t } from "../linker.js";

Array.prototype.equals = function (arr) {
    if (!arr || this.length != arr.length)
        return false

    //compare all aligned elements (same order in place) recursively. This will exit early, if there is a mismatch.
    return this.every((e, i) => typeof (e) == 'array' ? (typeof (arr[i]) == 'array' ? e.equals(arr[i]) : false) : e === arr[i])
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
        console.log(`❌\t${name} FAIL - GOT\n${generated}\nBUT EXPECTED\n${expected}\n`)
        // console.log(`❌\t${name} FAIL - GOT\n${[generated[0].name, ...generated.slice(1)]}\nBUT EXPECTED\n${[expected[0].name, ...expected.slice(1)]}\n`)
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
const all = false

if (test_cases.includes('symbol') || all) {
    console.log('📝 Testing symbol tags...')
    test('symbol full tag', LinkPatToken('sym "smth"'), [p['sym'], 'smth'])
    test('symbol short tag', LinkPatToken('"smth"'), [p[''], 'smth'])
}

if (test_cases.includes('variable') || all) {
    console.log('📝 Testing variable tags...')
    test('variable full tag', LinkPatToken('var "x"'), [p['var'], 'x'])
    test('variable tag no label', LinkPatToken('var'), [p['var']])

    console.log('📝 Testing variable resolving from context...')
    var match = "let x y".match(CastPatToRegex(['"let "', 'var "x"', '" "', 'var'].map(tag => LinkPatToken(tag))))
    test_singles('variable tag resolve to literal', ResolveFromContext(match, 1), 1)
    test_singles('variable tag resolve to literal', ResolveFromContext(match, '1'), 1)
    test_singles('variable tag resolve by index', ResolveFromContext(match, '[1]'), 'x')
    test_singles('variable tag resolve by index 2nd var', ResolveFromContext(match, '[2]'), 'y')
    test_singles('variable tag resolve by label', ResolveFromContext(match, 'x'), 'x')

    console.log('📝 Testing variable linking in target...')
    jtest('variable by number', LinkTar(['[1]']), [[t.ctx, '[1]']])
    jtest('variable by label', LinkTar(['[my_var]']), [[t.ctx, '[my_var]']])
}

if (test_cases.includes('ending') || all) {
    console.log('📝 Testing ending tags...')
    test('end full tag', LinkPatToken('end "smth"'), [p['end'], 'smth'])
    test('end tag no label', LinkPatToken('end'), [p['end']])
}

if (test_cases.includes('pre_tags') || all) {
    console.log('📝 Testing pre-tags...')
    test('new line capture tag', LinkPatToken('n'), [p['n']])
    test('indent capture tag', LinkPatToken('i'), [p['i']])
}

if (test_cases.includes('recursive') || all){
    console.log('📝 Testing recursive tags...')
    test('rec start tag', LinkPatToken('rec'), [p['rec']])
    test('rec end tag', LinkPatToken('/rec'), [p['/rec']])
}

if (test_cases.includes('if') || all) {
    console.log('📝 Testing IF tags...')
    // console.log(JSON.stringify())

    jtest('single IF block', LinkTar(['before block', '1[if [1]>2]', 'inside', '1[/if]', 'after block']), ['before block', [t.if,[t.cond, '[1]', "2"], ['inside']], 'after block'])
    jtest('single nested IF block', LinkTar(['1[if [1]>2]', ' var ', '2[if [1]>2]', ' something ', '2[/if]', '1[/if]']), [[t.if, [t.cond, '[1]', "2"], [" var ", [t.if, [t.cond, '[1]', "2"], [" something "]]]]])

    jtest('double IF block', LinkTar(['1[if [1]>2]', ' var ', '1[/if]', '2[if [1]>2]', ' something ', '2[/if]']), [[t.if, [t.cond, '[1]', "2"], [" var "]], [t.if,[t.cond, '[1]', "2"],[" something "]]])
    jtest('double nested IF block', LinkTar(['1[if [1]>2]', ' var ', '2[if [1]>2]', ' something ', '2[/if]', '3[if [1]>2]', ' something else ', '3[/if]', '1[/if]']), [[t.if, [t.cond, '[1]', "2"], [" var ", [t.if, [t.cond, '[1]', "2"], [" something "]], [t.if,[t.cond, '[1]', "2"],[" something else "]]]]])
}

