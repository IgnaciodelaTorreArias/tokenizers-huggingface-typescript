import { dlopen, toArrayBuffer, type Pointer } from "bun:ffi";

import { path } from "./target.ts";

const dl = dlopen(
    path,
    {
        lib_tokenizers_free_buffer: {
            args: ["u64", "u64"],
            returns: "void",
        },

        lib_tokenizers_new_pipeline_string: {
            args: ["buffer", "buffer", "u64", "buffer", "buffer"],
            returns: "i32",
        },
        lib_tokenizers_get_splits: {
            args: ["u64", "buffer", "u64", "buffer", "buffer"],
            returns: "i32",
        },
        lib_tokenizers_free_pipeline_string: { args: ["u64"], returns: "void" },

        lib_tokenizers_new_normalizer_wrapper: {
            args: ["buffer", "buffer", "u64", "buffer", "buffer"],
            returns: "i32",
        },
        lib_tokenizers_normalize: {
            args: ["u64", "buffer", "u64", "buffer", "buffer"],
            returns: "i32",
        },
        lib_tokenizers_free_normalizer_wrapper: {
            args: ["u64"],
            returns: "void",
        },

        lib_tokenizers_new_pre_tokenizer_wrapper: {
            args: ["buffer", "buffer", "u64", "buffer", "buffer"],
            returns: "i32",
        },
        lib_tokenizers_pre_tokenize: {
            args: ["u64", "buffer", "u64", "buffer", "buffer"],
            returns: "i32",
        },
        lib_tokenizers_free_pre_tokenizer_wrapper: {
            args: ["u64"],
            returns: "void",
        },

        lib_tokenizers_tokenizer_from_file: {
            args: ["buffer", "buffer", "u64", "buffer", "buffer"],
            returns: "i32",
        },
        lib_tokenizers_tokenizer_from_train: {
            args: ["buffer", "buffer", "u64", "buffer", "buffer"],
            returns: "i32",
        },
        lib_tokenizers_encode: {
            args: ["u64", "buffer", "u64", "buffer", "buffer"],
            returns: "i32",
        },
        lib_tokenizers_decode: {
            args: ["u64", "buffer", "u64", "buffer", "buffer"],
            returns: "i32",
        },
        lib_tokenizers_set_encode_special_tokens: {
            args: ["u64", "buffer", "u64", "buffer", "buffer"],
            returns: "i32",
        },
        lib_tokenizers_add_tokens: {
            args: ["u64", "buffer", "u64", "buffer", "buffer"],
            returns: "i32",
        },
        lib_tokenizers_free_tokenizer: {
            args: ["u64"],
            returns: "void",
        },
    } as const
);

export const dylib = dl.symbols;
export const close = () => {dl.close()};

export function toArrayBufferUnsafe(ptr: bigint, _len: bigint): ArrayBuffer {
    return toArrayBuffer(
        Number(ptr) as Pointer,
    );
}
