export function parseContext(context:string){
  try {
    return JSON.parse(context)
  } catch (error) {
    console.log('not json', context)
  }
}

/**
 * Return batches of 50
 */
export function getBatches<T extends any>(array: T[], batchNum: number) {
  const batches: T[][] = []
  function recurse(arr: T[]) {
    if (!arr.length) return
    const fiftyOrLess = arr.slice(0, batchNum)
    const rest = arr.slice(batchNum,)
    batches.push(fiftyOrLess)
    recurse(rest)
  }
  recurse(array)
  return batches
}

type ErrorResponse = { [K in keyof Error]: unknown }
export function getErrorResponse(error: Error){
  const errorRepsonse = Object.assign({}, error) as ErrorResponse
  const properties = Object.getOwnPropertyNames(error); 

  for (const key of properties) {
    errorRepsonse[key as keyof Error] = error[key as keyof Error];
  }

  return errorRepsonse;
}