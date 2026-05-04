import { path } from "./target.ts";

const dl = Deno.dlopen(
    path,
    {
        lib_tokenizers_free_buffer: { parameters: ["u64", "u64"], result: "void" },

        lib_tokenizers_new_pipeline_string: {
            parameters: ["buffer", "buffer", "u64", "buffer", "buffer"],
            result: "i32",
        },
        lib_tokenizers_get_splits: {
            parameters: ["u64", "buffer", "u64", "buffer", "buffer"],
            result: "i32",
        },
        lib_tokenizers_free_pipeline_string: { parameters: ["u64"], result: "void" },

        lib_tokenizers_new_normalizer_wrapper: {
            parameters: ["buffer", "buffer", "u64", "buffer", "buffer"],
            result: "i32",
        },
        lib_tokenizers_normalize: {
            parameters: ["u64", "buffer", "u64", "buffer", "buffer"],
            result: "i32",
        },
        lib_tokenizers_free_normalizer_wrapper: { parameters: ["u64"], result: "void" },

        lib_tokenizers_new_pre_tokenizer_wrapper: {
            parameters: ["buffer", "buffer", "u64", "buffer", "buffer"],
            result: "i32",
        },
        lib_tokenizers_pre_tokenize: {
            parameters: ["u64", "buffer", "u64", "buffer", "buffer"],
            result: "i32",
        },
        lib_tokenizers_free_pre_tokenizer_wrapper: { parameters: ["u64"], result: "void" },

        lib_tokenizers_tokenizer_from_file: {
            parameters: ["buffer", "buffer", "u64", "buffer", "buffer"],
            result: "i32",
        },
        lib_tokenizers_tokenizer_from_train: {
            parameters: ["buffer", "buffer", "u64", "buffer", "buffer"],
            result: "i32",
        },
        lib_tokenizers_encode: {
            parameters: ["u64", "buffer", "u64", "buffer", "buffer"],
            result: "i32",
        },
        lib_tokenizers_decode: {
            parameters: ["u64", "buffer", "u64", "buffer", "buffer"],
            result: "i32",
        },
        lib_tokenizers_free_tokenizer: { parameters: ["u64"], result: "void" },
    } as const
);

export const dylib = dl.symbols;
export const close = () => {dl.close()};

export function toArrayBufferUnsafe(ptr: bigint, len: bigint): ArrayBuffer {
    return Deno.UnsafePointerView.getArrayBuffer(
        Deno.UnsafePointer.create(ptr) as Deno.PointerObject,
        Number(len),
    );
}
