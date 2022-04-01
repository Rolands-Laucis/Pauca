//This script is for utilitie functions used to do node.js specific things that would not work on the web. Usually for debugging.

import fs from 'fs'

/**
 * Save a parse tree structure to a local file
 * @param {object[]} parse_tree
 */
export function ExportParsed(parse_tree, {path='../gen/parse_tree.json'} = {}){
    fs.writeFileSync(path, JSON.stringify(parse_tree, null, 2))
}