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
    return text.replace(/[\n\r]+/gm, '\n')
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

export const AllPreProcSteps = [RemoveComments, RemoveNewLines, RemoveTabs, Strip]

/**
 * @param {string} text
 */
export function SliceSection(text, index){
    return text.split(/\/\/-+/gmi)[index]
}

/**
 * @param {Function[]} steps
 * @param {string} text
 */
export function Preprocess(steps, text) {
    let out = text
    steps.forEach(f => {
        out = f(out)
    })
    return out
}