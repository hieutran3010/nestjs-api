declare interface String {
  format(...params): string;
}

declare module '*.json' {
  const value: any;
  export default value;
}
