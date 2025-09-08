import { ObjectDisposed } from "./errors.ts";
import {
    createNewArgs,
    dylib,
    ForeignInstance,
    methodArgsNoResult,
} from "./foreign-functions.ts";
import type { PipelineString } from "./pipeline-string.ts";
import type {
    InvalidPointer,
    InvalidProtocolBuffer,
    PreTokenizationError,
} from "./errors.ts";

import { PreTokenizerWrapper } from "./generated/pre_tokenizers/pre_tokenizer.ts";
import { BertPreTokenizer } from "./generated/pre_tokenizers/bert.ts";
import { ByteLevel as ByteL } from "./generated/pre_tokenizers/byte_level.ts";
import * as meta from "./generated/pre_tokenizers/metaspace.ts";
export { PrependScheme } from "./generated/pre_tokenizers/metaspace.ts";
import * as utils from "./generated/pre_tokenizers/utils.ts";
import { Sequence as Seq } from "./generated/utils.ts";
import { SplitDelimiterBehavior } from "./generated/pre_tokenizers/split_delimiter_behavior.ts";
export { SplitDelimiterBehavior } from "./generated/pre_tokenizers/split_delimiter_behavior.ts";
import { UnicodeScripts as Unicode } from "./generated/pre_tokenizers/unicode_scripts.ts";

import { PreTokenizeParams } from "./generated/pipeline_string/pre_tokenize.ts";

/**
 * Represents a pre-tokenizer, which is used to split text into smaller pieces
 * For example the most common pre-tokenizer is the Whitespace, which splits text on 'whitespace characters' like spaces
 */
export abstract class PreTokenizer extends ForeignInstance {
    constructor(param: PreTokenizerWrapper) {
        super();
        this.instancePtr = createNewArgs(
            dylib.new_pre_tokenizer_wrapper,
            param,
            PreTokenizerWrapper,
        );
    }
    /**
     * Splits the given {@link PipelineString} in multiple substrings, keeping track of the offsets of said substrings
     * @param pipelineString
     * @throws {PreTokenizationError}
     *
     * It's possible for this method to throw other types of exceptions like ({@link InvalidProtocolBuffer}, {@link InvalidPointer}, etc).
     *
     * This indicates an issue with the library, please open an issue at {@link https://github.com/IgnaciodelaTorreArias/tokenizers-huggingface-typescript|Github}
     */
    preTokenize(pipelineString: PipelineString): void {
        if (this.instancePtr === 0n) {
            throw new ObjectDisposed();
        }
        methodArgsNoResult(
            dylib.pre_tokenize,
            this.instancePtr,
            PreTokenizeParams.create({
                pipelineString: ForeignInstance.getInstancePtr(pipelineString),
            }),
            PreTokenizeParams,
        );
    }
    protected override freFunc(): (instancePtr: bigint) => void {
        return dylib.free_pre_tokenizer_wrapper;
    }
}

/**
 * Splits on whitespaces and punctuation
 */
export class Bert extends PreTokenizer {
    constructor() {
        super(
            PreTokenizerWrapper.create({
                bertPreTokenizer: BertPreTokenizer.create(),
            }),
        );
    }
}

/**
 * Provides all the necessary steps to handle the BPE tokenization at the byte-level
 *
 * Takes care of all the required processing steps to transform a UTF-8 string as needed before and after the BPE model does its job
 */
export class ByteLevel extends PreTokenizer {
    /**
     * @inheritdoc
     * @param addPrefixSpace
     * @param trimOffsets Whether the post processing step should trim offsets to avoid including whitespaces
     * @param useRegex Whether to use the standard GPT2 regex for whitespace splitting Set it to False if you want to use your own splitting
     */
    constructor(
        public readonly addPrefixSpace: boolean = true,
        public readonly trimOffsets: boolean = true,
        public readonly useRegex: boolean = true,
    ) {
        super(PreTokenizerWrapper.create({
            byteLevel: ByteL.create({
                addPrefixSpace,
                trimOffsets,
                useRegex,
            }),
        }));
    }
}

/**
 * Replaces all the spaces with the provided meta character and then splits on this character
 */
export class Metaspace extends PreTokenizer {
    /**
     * @inheritdoc
     * @param replacementChar
     * @param prependScheme
     * @param split Whether to split at the end of the replacement
     */
    constructor(
        public readonly replacementChar: string,
        public readonly prependScheme: meta.PrependScheme,
        public readonly split: boolean,
    ) {
        if (replacementChar.length == 0) {
            throw new Error("replacementChar must have a length of 1");
        }
        replacementChar = replacementChar[0] as string;
        super(PreTokenizerWrapper.create({
            metaspace: meta.Metaspace.create({
                replacementChar,
                prependScheme,
                split,
            }),
        }));
    }
}

/**
 * Uses the inverted regex expression: "\w+|[^\w\s]+" for distinguishing whitespaces
 */
export class Whitespace extends PreTokenizer {
    constructor() {
        super(
            PreTokenizerWrapper.create({
                whitespace: utils.Whitespace.create(),
            }),
        );
    }
}

/**
 * Whitespaces defined by {@link https://www.unicode.org/reports/tr44/|Unicode Character Database} {@link https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt|PropList.txt}
 */
export class WhitespaceSplit extends PreTokenizer {
    /// <inheritdoc cref="WhitespaceSplit"/>
    constructor() {
        super(
            PreTokenizerWrapper.create({
                whitespaceSplit: utils.WhitespaceSplit.create(),
            }),
        );
    }
}

/**
 * splits on a delimiter character
 */
export class Delimiter extends PreTokenizer {
    constructor(public readonly delimiterChar: string) {
        if (delimiterChar.length == 0) {
            throw new Error("delimiterChar must have a length of 1");
        }
        delimiterChar = delimiterChar[0] as string;
        super(
            PreTokenizerWrapper.create({
                delimiter: utils.Delimiter.create({ char: delimiterChar }),
            }),
        );
    }
}

/**
 * Allows concatenating multiple other {@link PreTokenizer} as a Sequence. All the pre-tokenizers are run in sequence in the given order
 */
export class Sequence extends PreTokenizer {
    /**
     * @inheritdoc
     * @param preTokenizers Valid PreTokenizers (not disposed)
     */
    constructor(public readonly preTokenizers: readonly PreTokenizer[]) {
        const addresses: number[] = [];
        for (let i = 0; i < preTokenizers.length; i++) {
            const address = ForeignInstance.getInstancePtr(
                preTokenizers[i] as PreTokenizer,
            );
            if (address === 0) {
                throw new ObjectDisposed(
                    `The preTokenizers at index [${i}] is disposed`,
                );
            }
            addresses.push(address);
        }
        super(PreTokenizerWrapper.create({
            sequence: Seq.create({
                addresses,
            }),
        }));
    }
    protected override _dispose() {
        this.preTokenizers.forEach((pt) => {
            pt.dispose();
        });
        super._dispose();
    }
}

/**
 * Gives control on splitting behavior by using regex to determine the splitting points
 */
export class Split extends PreTokenizer {
    /**
     * @inheritdoc
     * @param pattern Even though here is a string, internally is managed as regex pattern
     * @param behavior
     * @param invert Whether to invert the pattern. Useful when isRegex is true
     * @param isRegex If false the pattern will be escaped
     */
    constructor(
        public readonly pattern: string,
        public readonly behavior: SplitDelimiterBehavior,
        public readonly invert: boolean,
        isRegex: boolean,
    ) {
        const split = isRegex
            ? utils.Split.create({
                stringSplit: pattern,
                behavior,
                invert,
            })
            : utils.Split.create({
                regexSplit: pattern,
                behavior,
                invert,
            });
        super(PreTokenizerWrapper.create({
            split,
        }));
    }
}

/**
 * Splits on ASCII punctuation characters and (Pc, Pd, Pe, Pf, Pi, Po, or Ps) Unicode categories
 */
export class Punctuation extends PreTokenizer {
    constructor(
        public readonly behavior: SplitDelimiterBehavior =
            SplitDelimiterBehavior.ISOLATED,
    ) {
        super(PreTokenizerWrapper.create({
            punctuation: utils.Punctuation.create({ behavior }),
        }));
    }
}

/**
 * Pre tokenizes the numbers into single tokens
 */
export class Digits extends PreTokenizer {
    /**
     * @inheritdoc
     * @param individualDigits If set to true all digits are splitted into individual tokens
     */
    constructor(public readonly individualDigits: boolean) {
        super(PreTokenizerWrapper.create({
            digits: utils.Digits.create({
                individualDigits,
            }),
        }));
        this.individualDigits = individualDigits;
    }
}

/**
 * This pre-tokenizer splits on characters that belong to different language family.
 *
 * It roughly follows {@link https://github.com/google/sentencepiece/blob/master/data/Scripts.txt|Scripts.txt}
 *
 * Actually Hiragana and Katakana are fused with Han, and 0x30FC is Han too. This mimics SentencePiece Unigram implementation.
 */
export class UnicodeScripts extends PreTokenizer {
    constructor() {
        super(PreTokenizerWrapper.create({ unicodeScripts: Unicode.create() }));
    }
}

/**
 * Creates fixed length splits
 */
export class FixedLength extends PreTokenizer {
    constructor(public readonly length: number = 5) {
        super(PreTokenizerWrapper.create({
            fixedLength: utils.FixedLength.create({ length }),
        }));
        this.length = length;
    }
}
