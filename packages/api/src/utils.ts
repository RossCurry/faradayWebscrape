export function parseContext(context:string){
  try {
    return JSON.parse(context)
  } catch (error) {
    console.log('not json', context)
  }
}