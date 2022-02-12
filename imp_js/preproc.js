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
    return text.replace(/[\n\r]/gm, ' ')
}

/**
 * @param {string} text
 */
function CollapseNewLines(text) {
    return text.replace(/[\n\r]+/gm, '\n')
}

/**
 * @param {string} text
 */
function CollapseSpaces(text) {
    return text.replace(/[\s]+/gm, ' ')
}

/**
 * @param {string} text
 */
function RemoveTabs(text) {
    return text.replace(/\t+/gm, '')
}

/**
 * @param {string} text
 */
function Strip(text){
    return text.trim()
}

/**
 * @param {string} text
 * @param {number} index - 0 based array index
 */
export function ExtractSection(text, index){
    return text.split(/\/\/-+/gm)[index]
}

/**
 * @param {Function[]} steps
 * @param {string} text
 * @returns {string} text
 */
export function Preprocess(text, steps = [RemoveComments, CollapseSpaces, Strip]) {
    steps.unshift(text) //insert the text as the first element, so that we can just use the reduce function to apply all steps
    return steps.reduce((text, f) => f(text))
}