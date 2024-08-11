export function parseContext(context) {
    try {
        return JSON.parse(context);
    }
    catch (error) {
        console.log('not json', context);
    }
}
