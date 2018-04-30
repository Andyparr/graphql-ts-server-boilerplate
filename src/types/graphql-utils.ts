export interface ResolverMap {
  [key: string]: {
    [key: string]: (parent: any, args: any, contest: {}, info: any) => any
  }
}
