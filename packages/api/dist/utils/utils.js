export function parseContext(context) {
    try {
        return JSON.parse(context);
    }
    catch (error) {
        console.log('not json', context);
    }
}
/**
 * Return batches of 50
 */
export function getBatches(array, batchNum) {
    const batches = [];
    function recurse(arr) {
        if (!arr.length)
            return;
        const fiftyOrLess = arr.slice(0, batchNum);
        const rest = arr.slice(batchNum);
        batches.push(fiftyOrLess);
        recurse(rest);
    }
    recurse(array);
    return batches;
}
