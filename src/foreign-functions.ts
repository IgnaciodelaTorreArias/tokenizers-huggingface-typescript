import { Buffer } from "node:buffer";

import { isDeno, isBun } from "./target.ts";
import type * as callingTypes from "./foreign-functions-calling-types.ts";
import type * as e from "./generated/error.ts";
import { ObjectDisposed, throwErrors } from "./errors.ts";

export let dylib: {
    lib_tokenizers_free_buffer: callingTypes.FreeBuffer,
    
    lib_tokenizers_new_pipeline_string: callingTypes.CreateNewArgsResultCallback,
    lib_tokenizers_get_splits: callingTypes.MethodArgsResultCallback,
    lib_tokenizers_free_pipeline_string: callingTypes.FreeInstance,

    lib_tokenizers_new_normalizer_wrapper: callingTypes.CreateNewArgsResultCallback,
    lib_tokenizers_normalize: callingTypes.MethodArgsResultCallback,
    lib_tokenizers_free_normalizer_wrapper: callingTypes.FreeInstance,

    lib_tokenizers_new_pre_tokenizer_wrapper: callingTypes.CreateNewArgsResultCallback,
    lib_tokenizers_pre_tokenize: callingTypes.MethodArgsResultCallback,
    lib_tokenizers_free_pre_tokenizer_wrapper: callingTypes.FreeInstance,

    lib_tokenizers_tokenizer_from_file: callingTypes.CreateNewArgsResultCallback,
    lib_tokenizers_tokenizer_from_train: callingTypes.CreateNewArgsResultCallback,
    lib_tokenizers_encode: callingTypes.MethodArgsResultCallback,
    lib_tokenizers_decode: callingTypes.MethodArgsResultCallback,
    lib_tokenizers_set_encode_special_tokens: callingTypes.MethodArgsResultCallback,
    lib_tokenizers_add_tokens: callingTypes.MethodArgsResultCallback,
    lib_tokenizers_free_tokenizer: callingTypes.FreeInstance,
};
let toArrayBufferUnsafe: (ptr: bigint, len: bigint) => ArrayBuffer;

export let close: () => void;

if (isDeno) {
    const mod = await import("./foreign-functions.deno.ts");
    // @ts-ignore: An example in the official documentation uses Uint8Array to pass a buffer. https://docs.deno.com/runtime/fundamentals/ffi/#basic-usage:~:text=Deno%20FFI%20examples%20repository https://github.com/denoffi/denoffi_examples/blob/main/buf/test.ts
    dylib = mod.dylib;
    close = mod.close;
    toArrayBufferUnsafe = mod.toArrayBufferUnsafe;
}
if (isBun) {
    const mod = await import("./foreign-functions.bun.ts");
    dylib = mod.dylib as unknown as typeof dylib;
    close = mod.close;
    toArrayBufferUnsafe = mod.toArrayBufferUnsafe;
}

export function createNewArgs<I>(
    func: callingTypes.CreateNewArgsResultCallback,
    input: I,
    inputParser: e.MessageFns<I>,
): bigint {
    const buf = inputParser.encode(input).finish();
    const instancePtr = new BigUint64Array(1);
    const outPtr = new BigUint64Array(1);
    const outLen = new BigUint64Array(1);
    const status = func(instancePtr, buf, BigInt(buf.length), outPtr, outLen);
    if (status == 0)
        return instancePtr[0];
    let outBuf = new Uint8Array(0);
    if (status > 0) {
        const outBufArray = toArrayBufferUnsafe(
            outPtr[0],
            outLen[0]
        );
        outBuf = new Uint8Array(
            Buffer.from(outBufArray, 0, Number(outLen[0])),
        );
        dylib.lib_tokenizers_free_buffer(outPtr[0], outLen[0]);
    }
    throwErrors(status, outBuf);
    // Never reach this return
    return 0n;
}

export function methodArgsResult<I, R>(
    func: callingTypes.MethodArgsResultCallback,
    instancePtr: bigint,
    input: I,
    inputParser: e.MessageFns<I>,
    resultParser: e.MessageFns<R>,
): R {
    if (instancePtr === 0n) {
        throw new ObjectDisposed();
    }
    const buf = inputParser.encode(input).finish();
    const outPtr = new BigUint64Array(1);
    const outLen = new BigUint64Array(1);
    const status = func(instancePtr, buf, BigInt(buf.length), outPtr, outLen);
    let outBuf = new Uint8Array(0);
    if (status >= 0) {
        const outBufArray = toArrayBufferUnsafe(
            outPtr[0],
            outLen[0]
        );
        outBuf = new Uint8Array(Buffer.from(outBufArray, 0, Number(outLen[0])));
        dylib.lib_tokenizers_free_buffer(outPtr[0], outLen[0]);
    }
    if (status != 0)
        throwErrors(status, outBuf);
    return resultParser.decode(outBuf);
}

export function methodArgsNoResult<I>(
    func: callingTypes.MethodArgsResultCallback,
    instancePtr: bigint,
    input: I,
    inputParser: e.MessageFns<I>,
): void {
    if (instancePtr === 0n) {
        throw new ObjectDisposed();
    }
    const buf = inputParser.encode(input).finish();
    const outPtr = new BigUint64Array(1);
    const outLen = new BigUint64Array(1);
    const status = func(instancePtr, buf, BigInt(buf.length), outPtr, outLen);
    if (status == 0)
        return
    let outBuf = new Uint8Array(0);
    if (status > 0) {
        const outBufArray = toArrayBufferUnsafe(
            outPtr[0],
            outLen[0]
        );
        outBuf = new Uint8Array(
            Buffer.from(outBufArray, 0, Number(outLen[0])),
        );
        dylib.lib_tokenizers_free_buffer(outPtr[0], outLen[0]);
    }
    throwErrors(status, outBuf);
}

/**
 * The base class for "managed instances". Which internally are managed by our rust dynamic library
 *
 * Current managed instances are:
 * - Normalizer
 * - PreTokenizer
 * - PipelineString
 * - Tokenizer
 * @implements {Disposable}
 */
export abstract class ForeignInstance implements Disposable {
    protected instancePtr: bigint;
    protected constructor() {
        this.instancePtr = 0n;
    }
    protected static getInstancePtr(instance: ForeignInstance): number {
        return Number(instance.instancePtr);
    }
    protected abstract freFunc(): (instancePtr: bigint) => void;
    protected _dispose(): void {
        if (this.instancePtr == 0n) {
            return;
        }
        this.freFunc()(this.instancePtr);
        this.instancePtr = 0n;
    }
    [Symbol.dispose](): void {
        this._dispose();
    }
    public dispose(): void {
        this._dispose();
    }
}
