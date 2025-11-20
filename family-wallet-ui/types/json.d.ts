  declare module '*.json' {
    const value: {
      abi: unknown[];
      bytecode: string;
      [key: string]: unknown;
    };
    export default value;
  }