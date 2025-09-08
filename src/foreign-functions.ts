import { Buffer } from "node:buffer";
import * as e from "./generated/error.ts";

import * as errors from "./errors.ts";

let ffi: typeof import("bun:ffi");
const isDeno = typeof Deno !== "undefined" &&
    typeof Deno.version !== "undefined";
const isBun = typeof Bun !== "undefined" && typeof Bun.version !== "undefined";
if (isBun) {
    ffi = await import("bun:ffi");
}

if (!(isDeno || isBun)) {
    throw new Error("Unsupported runtime");
}

const os = isDeno ? Deno.build.os : process.platform;
const arch = isDeno ? Deno.build.arch : process.arch;
if (!(os == "windows" || os == "win32" || os == "linux" || os == "darwin")) {
    throw new Error(`Unsupported platform: ${os}`);
}
if (
    !(arch == "x64" || arch == "x86_64" || arch == "arm64" || arch == "aarch64")
) {
    throw new Error(`Unsupported architecture: ${arch}`);
}
let path: string = "";
if (os == "windows" || os == "win32") {
    if (arch == "x64" || arch == "x86_64") {
        const win32_x64 = await import(
            "@lazy_engineer/tokenizers-huggingface-win32-x64"
        );
        path = win32_x64.path;
    } else {
        const win32_arm64 = await import(
            "@lazy_engineer/tokenizers-huggingface-win32-arm64"
        );
        path = win32_arm64.path;
    }
} else if (os == "linux") {
    if (arch == "x64" || arch == "x86_64") {
        const linux_x64 = await import(
            "@lazy_engineer/tokenizers-huggingface-linux-x64"
        );
        path = linux_x64.path;
    } else {
        const linux_arm64 = await import(
            "@lazy_engineer/tokenizers-huggingface-linux-arm64"
        );
        path = linux_arm64.path;
    }
} else {
    if (arch == "x64" || arch == "x86_64") {
        const darwin_x64 = await import(
            "@lazy_engineer/tokenizers-huggingface-darwin-x64"
        );
        path = darwin_x64.path;
    } else {
        const darwin_arm64 = await import(
            "@lazy_engineer/tokenizers-huggingface-darwin-arm64"
        );
        path = darwin_arm64.path;
    }
}

export const dylib = isDeno
    ? Deno.dlopen(
        path,
        {
            free_buffer: { parameters: ["u64", "u64"], result: "void" },

            new_pipeline_string: {
                parameters: ["buffer", "buffer", "u64", "buffer", "buffer"],
                result: "i32",
            },
            get_splits: {
                parameters: ["u64", "buffer", "u64", "buffer", "buffer"],
                result: "i32",
            },
            free_pipeline_string: { parameters: ["u64"], result: "void" },

            new_normalizer_wrapper: {
                parameters: ["buffer", "buffer", "u64", "buffer", "buffer"],
                result: "i32",
            },
            normalize: {
                parameters: ["u64", "buffer", "u64", "buffer", "buffer"],
                result: "i32",
            },
            free_normalizer_wrapper: { parameters: ["u64"], result: "void" },

            new_pre_tokenizer_wrapper: {
                parameters: ["buffer", "buffer", "u64", "buffer", "buffer"],
                result: "i32",
            },
            pre_tokenize: {
                parameters: ["u64", "buffer", "u64", "buffer", "buffer"],
                result: "i32",
            },
            free_pre_tokenizer_wrapper: { parameters: ["u64"], result: "void" },

            tokenizer_from_file: {
                parameters: ["buffer", "buffer", "u64", "buffer", "buffer"],
                result: "i32",
            },
            tokenizer_from_train: {
                parameters: ["buffer", "buffer", "u64", "buffer", "buffer"],
                result: "i32",
            },
            encode: {
                parameters: ["u64", "buffer", "u64", "buffer", "buffer"],
                result: "i32",
            },
            decode: {
                parameters: ["u64", "buffer", "u64", "buffer", "buffer"],
                result: "i32",
            },
            free_tokenizer_wrapper: { parameters: ["u64"], result: "void" },
        } as const,
    )
    : ffi.dlopen(
        path,
        {
            free_buffer: {
                parameters: ["u64", "u64"],
                result: ffi.FFIType.void,
            },

            new_pipeline_string: {
                args: ["buffer", "buffer", "u64", "buffer", "buffer"],
                returns: "i32",
            },
            get_splits: {
                args: ["u64", "buffer", "u64", "buffer", "buffer"],
                returns: "i32",
            },
            free_pipeline_string: { args: ["u64"], returns: ffi.FFIType.void },

            new_normalizer_wrapper: {
                args: ["buffer", "buffer", "u64", "buffer", "buffer"],
                returns: "i32",
            },
            normalize: {
                args: ["u64", "buffer", "u64", "buffer", "buffer"],
                returns: "i32",
            },
            free_normalizer_wrapper: {
                args: ["u64"],
                returns: ffi.FFIType.void,
            },

            new_pre_tokenizer_wrapper: {
                args: ["buffer", "buffer", "u64", "buffer", "buffer"],
                returns: "i32",
            },
            pre_tokenize: {
                args: ["u64", "buffer", "u64", "buffer", "buffer"],
                returns: "i32",
            },
            free_pre_tokenizer_wrapper: {
                args: ["u64"],
                returns: ffi.FFIType.void,
            },

            tokenizer_from_file: {
                args: ["buffer", "buffer", "u64", "buffer", "buffer"],
                returns: "i32",
            },
            tokenizer_from_train: {
                args: ["buffer", "buffer", "u64", "buffer", "buffer"],
                returns: "i32",
            },
            encode: {
                args: ["u64", "buffer", "u64", "buffer", "buffer"],
                returns: "i32",
            },
            decode: {
                args: ["u64", "buffer", "u64", "buffer", "buffer"],
                returns: "i32",
            },
            free_tokenizer_wrapper: {
                args: ["u64"],
                returns: ffi.FFIType.void,
            },
        } as const,
    );

function throwErrors(status: number, buf: Uint8Array): void {
    let details = "";
    if (status > 0) {
        details = e.Error.decode(buf).details;
    }
    switch (e.callStatusFromJSON(status)) {
        case e.CallStatus.DECODE_ERROR:
            throw new errors.InvalidProtocolBuffer(
                "DECODE_ERROR. InvalidProtocolBuffer",
            );
        case e.CallStatus.INVALID_ARGUMENTS_DETAILS:
            throw new errors.InvalidArguments(
                `INVALID_ARGUMENTS_DETAILS: ${details}`,
            );
        case e.CallStatus.INVALID_ARGUMENTS:
            throw new errors.InvalidArguments();
        case e.CallStatus.UNKNOWN_ENUM_VALUE:
            throw new RangeError("Unknown enum value");
        case e.CallStatus.EMPTY_PARAMS:
            throw new errors.EmptyParams(
                "EMPTY_PARAMS. A required field is not present",
            );
        case e.CallStatus.INVALID_POINTER_DETAILS:
            throw new errors.InvalidPointer(details);

        case e.CallStatus.NORMALIZATION_ERROR_DETAILS:
            throw new errors.NormalizationError(details);
        case e.CallStatus.PRE_TOKENIZATION_ERROR_DETAILS:
            throw new errors.PreTokenizationError(details);
        case e.CallStatus.TOKENIZER_BUILD_ERROR_DETAILS:
            throw new errors.TokenizerBuildError(details);
        case e.CallStatus.TOKENIZER_TRAINING_ERROR_DETAILS:
            throw new errors.TokenizerTrainingError(details);
        case e.CallStatus.TOKENIZER_SAVE_ERROR_DETAILS:
            throw new errors.TokenizerSaveError(details);
        case e.CallStatus.TOKENIZER_LOAD_FILE_ERROR_DETAILS:
            throw new errors.TokenizerLoadFileError(details);
        case e.CallStatus.TOKENIZER_ENCODING_ERROR_DETAILS:
            throw new errors.TokenizerEncodingError(details);
        case e.CallStatus.TOKENIZER_DECODING_ERROR_DETAILS:
            throw new errors.TokenizerDecodingError(details);
    }
    if (status > 0) {
        throw new Error(
            `Unknown error occurred, code: ${status}, details: ${details}`,
        );
    } else {
        throw new Error(`Unknown error occurred, code: ${status}`);
    }
}

type CreateNewArgsResultCallback = (
    instancePtr: BigUint64Array,
    ptr: Uint8Array,
    len: bigint,
    outPtr: BigUint64Array,
    outLen: BigUint64Array,
) => number;
export function createNewArgs<I>(
    func: CreateNewArgsResultCallback,
    input: I,
    inputParser: e.MessageFns<I>,
): bigint {
    const buf = inputParser.encode(input).finish();
    const instancePtr = new BigUint64Array(1);
    const outPtr = new BigUint64Array(1);
    const outLen = new BigUint64Array(1);
    const status = func(instancePtr, buf, BigInt(buf.length), outPtr, outLen);
    const outBufArray = isDeno
        ? Deno.UnsafePointerView.getArrayBuffer(
            Deno.UnsafePointer.create(outPtr[0]) as Deno.PointerObject,
            Number(outLen[0]),
        )
        : ffi.toArrayBuffer(
            Number(outPtr[0]) as ffi.Pointer,
        );
    if (status != 0) {
        let outBuf = new Uint8Array(0);
        if (status > 0) {
            outBuf = new Uint8Array(
                Buffer.from(outBufArray, 0, Number(outLen[0])),
            );
            dylib.symbols.free_buffer(outPtr[0] as bigint, outLen[0] as bigint);
        }
        throwErrors(status, outBuf);
    }
    return instancePtr[0] as bigint;
}

type MethodArgsResultCallback = (
    instancePtr: bigint,
    ptr: Uint8Array,
    len: bigint,
    outPtr: BigUint64Array,
    outLen: BigUint64Array,
) => number;
export function methodArgsResult<I, R>(
    func: MethodArgsResultCallback,
    instancePtr: bigint,
    input: I,
    inputParser: e.MessageFns<I>,
    resultParser: e.MessageFns<R>,
): R {
    const buf = inputParser.encode(input).finish();
    const outPtr = new BigUint64Array(1);
    const outLen = new BigUint64Array(1);
    const status = func(instancePtr, buf, BigInt(buf.length), outPtr, outLen);
    const outBufArray = isDeno
        ? Deno.UnsafePointerView.getArrayBuffer(
            Deno.UnsafePointer.create(outPtr[0]) as Deno.PointerObject,
            Number(outLen[0]),
        )
        : ffi.toArrayBuffer(
            Number(outPtr[0]) as ffi.Pointer,
        );
    let outBuf = new Uint8Array(0);
    if (status >= 0) {
        outBuf = new Uint8Array(Buffer.from(outBufArray, 0, Number(outLen[0])));
        dylib.symbols.free_buffer(outPtr[0] as bigint, outLen[0] as bigint);
    }
    throwErrors(status, outBuf);
    return resultParser.decode(outBuf);
}

export function methodArgsNoResult<I>(
    func: MethodArgsResultCallback,
    instancePtr: bigint,
    input: I,
    inputParser: e.MessageFns<I>,
): void {
    const buf = inputParser.encode(input).finish();
    const outPtr = new BigUint64Array(1);
    const outLen = new BigUint64Array(1);
    const status = func(instancePtr, buf, BigInt(buf.length), outPtr, outLen);
    const outBufArray = isDeno
        ? Deno.UnsafePointerView.getArrayBuffer(
            Deno.UnsafePointer.create(outPtr[0]) as Deno.PointerObject,
            Number(outLen[0]),
        )
        : ffi.toArrayBuffer(
            Number(outPtr[0]) as ffi.Pointer,
        );
    if (status != 0) {
        let outBuf = new Uint8Array(0);
        if (status > 0) {
            outBuf = new Uint8Array(
                Buffer.from(outBufArray, 0, Number(outLen[0])),
            );
            dylib.symbols.free_buffer(outPtr[0] as bigint, outLen[0] as bigint);
        }
        throwErrors(status, outBuf);
    }
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

/**
 * Closes the ffi connection (only needed in Deno)
 */
export function close(): void {
    if (isDeno) {
        dylib.close();
    }
}
