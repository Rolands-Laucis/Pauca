/**
 * @param {string} text
 */
function RemoveComments(text) {
    return text.replace(/\/\/.*/gm, '')
}

/**
 * @param {string} text
 */
function RemoveNewLines(text) {
    return text.replace(/[\n\r]/gm, '\s')
}

/**
 * @param {string} text
 */
function ShrinkNewLines(text) {
    return text.replace(/[\n\r]+/gm, '')
}

/**
 * @param {string} text
 */
function RemoveTabs(text) {
    return text.replace(/\t/gm, '')
}

/**
 * @param {string} text
 */
function Strip(text){
    return text.trim()
}

export const AllPreProcSteps = [RemoveComments, ShrinkNewLines, RemoveTabs, Strip]

/**
 * @param {string} text
 */
export function ExtractSection(text, index){
    return text.split(/\/\/-+/gmi)[index]
}

/**
 * @param {Function[]} steps
 * @param {string} text
 */
export function Preprocess(steps, text) {
    steps.unshift(text) //insert the text as the first element, so that we can just use the reduce function to apply all steps
    return steps.reduce((text, f) => f(text))
}