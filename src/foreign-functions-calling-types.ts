
export type FreeBuffer = (ptr: bigint, len: bigint) => void;

export type FreeInstance = (ptr: bigint) => void;

export type CreateNewArgsResultCallback = (
    instancePtr: BigUint64Array,
    ptr: Uint8Array,
    len: bigint,
    outPtr: BigUint64Array,
    outLen: BigUint64Array,
) => number;

export type MethodArgsResultCallback = (
    instancePtr: bigint,
    ptr: Uint8Array,
    len: bigint,
    outPtr: BigUint64Array,
    outLen: BigUint64Array,
) => number;