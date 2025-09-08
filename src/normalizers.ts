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
    NormalizationError,
} from "./errors.ts";

import { NormalizerWrapper } from "./generated/normalizers/normalizer.ts";
import { BertNormalizer } from "./generated/normalizers/bert.ts";
import * as unicode from "./generated/normalizers/unicode.ts";
import * as utils from "./generated/normalizers/utils.ts";
import { Sequence as Seq } from "./generated/utils.ts";
import { Replace as Rep } from "./generated/normalizers/replace.ts";
import { Precompiled as Pre } from "./generated/normalizers/precompiled.ts";
import { ByteLevel as ByteL } from "./generated/normalizers/byte_level.ts";

import { NormalizeParams } from "./generated/pipeline_string/normalize.ts";

/**
 * Represents a normalizer, this is the base class for all normalizers
 *
 * A Normalizer standardizes an input string before it is tokenized
 */
export abstract class Normalizer extends ForeignInstance {
    constructor(param: NormalizerWrapper) {
        super();
        this.instancePtr = createNewArgs(
            dylib.new_normalizer_wrapper,
            param,
            NormalizerWrapper,
        );
    }
    /**
     * Affects a {@link PipelineString} by applying the normalization
     * @param pipelineString The {@link PipelineString} to normalize
     * @throws {NormalizationError}
     *
     * It's possible for this method to throw other types of exceptions like ({@link InvalidProtocolBuffer}, {@link InvalidPointer}, etc).
     *
     * This indicates an issue with the library, please open an issue at {@link https://github.com/IgnaciodelaTorreArias/tokenizers-huggingface-typescript|Github}
     */
    normalize(pipelineString: PipelineString): void {
        if (this.instancePtr === 0n) {
            throw new ObjectDisposed();
        }
        methodArgsNoResult(
            dylib.normalize,
            this.instancePtr,
            NormalizeParams.create({
                pipelineString: ForeignInstance.getInstancePtr(pipelineString),
            }),
            NormalizeParams,
        );
    }
    protected override freFunc(): (instancePtr: bigint) => void {
        return dylib.free_normalizer_wrapper;
    }
}

/**
 * Takes care of normalizing raw text before giving it to a Bert model
 *
 * This includes cleaning the text, handling accents, chinese chars and lowercasing
 */
export class Bert extends Normalizer {
    /**
     * @inheritdoc
     * @param cleanText Whether to do the bert basic cleaning:
     *
     * 1. Remove any control
     * 2. Replace all sorts of whitespace by classic one
     *
     * @param handleChineseChars Whether to put spaces around chinese characters so they get split
     * @param stripAccents
     * @param lowercase
     */
    constructor(
        public readonly cleanText: boolean = true,
        public readonly handleChineseChars: boolean = true,
        public readonly stripAccents: boolean = true,
        public readonly lowercase: boolean = true,
    ) {
        super(NormalizerWrapper.create({
            bertNormalizer: BertNormalizer.create({
                cleanText,
                handleChineseChars,
                stripAccents,
                lowercase,
            }),
        }));
    }
}

/**
 * Unicode Normalizer
 */
export class Nfd extends Normalizer {
    constructor() {
        super(NormalizerWrapper.create({ nfd: unicode.Nfd.create() }));
    }
}

/**
 * Unicode Normalizer
 */
export class Nfkd extends Normalizer {
    constructor() {
        super(NormalizerWrapper.create({ nfkd: unicode.Nfkd.create() }));
    }
}

/**
 * Unicode Normalizer
 */
export class Nfc extends Normalizer {
    constructor() {
        super(NormalizerWrapper.create({ nfc: unicode.Nfc.create() }));
    }
}

/**
 * Unicode Normalizer
 */
export class Nfkc extends Normalizer {
    constructor() {
        super(NormalizerWrapper.create({ nfkc: unicode.Nfkc.create() }));
    }
}

/**
 * Unicode Normalizer
 */
export class Nmt extends Normalizer {
    constructor() {
        super(NormalizerWrapper.create({ nmt: unicode.Nmt.create() }));
    }
}

/**
 * Strip whitespaces from the left and/or right of the string
 *
 * Whitespaces defined by {@link https://www.unicode.org/reports/tr44/|Unicode Character Database} {@link https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt|PropList.txt}
 */
export class StripNormalizer extends Normalizer {
    constructor(
        public readonly stripLeft: boolean,
        public readonly stripRight: boolean,
    ) {
        super(NormalizerWrapper.create({
            stripNormalizer: utils.StripNormalizer.create({
                stripLeft,
                stripRight,
            }),
        }));
    }
}

/**
 * This normalizer removes combining marks from a normalized string
 *
 * Different from unicode as it does not attempt to modify non ascii languages
 */
export class StripAccents extends Normalizer {
    constructor() {
        super(
            NormalizerWrapper.create({
                stripAccents: utils.StripAccents.create(),
            }),
        );
    }
}

/**
 * Allows concatenating multiple other {@link Normalizer} as a Sequence. All the normalizers are run in sequence in the given order
 */
export class Sequence extends Normalizer {
    /**
     * @inheritdoc
     * @param normalizers Valid Normalizers (not disposed)
     */
    constructor(public readonly normalizers: readonly Normalizer[]) {
        const addresses: number[] = [];
        for (let i = 0; i < normalizers.length; i++) {
            const address = ForeignInstance.getInstancePtr(
                normalizers[i] as Normalizer,
            );
            if (address === 0) {
                throw new ObjectDisposed(
                    `The normalizer at index [${i}] is disposed`,
                );
            }
            addresses.push(address);
        }
        super(NormalizerWrapper.create({
            sequence: Seq.create({
                addresses,
            }),
        }));
    }
    protected override _dispose() {
        this.normalizers.forEach((n) => {
            n.dispose();
        });
        super._dispose();
    }
}

/**
 * Lowercases the input string
 */
export class Lowercase extends Normalizer {
    constructor() {
        super(NormalizerWrapper.create({
            lowercase: utils.Lowercase.create(),
        }));
    }
}

/**
 * Prepends a string to the {@link PipelineString} we want to normalize
 */
export class Prepend extends Normalizer {
    constructor(public readonly prepend: string) {
        super(NormalizerWrapper.create({
            prepend: utils.Prepend.create({
                prepend,
            }),
        }));
    }
}

/**
 * Takes every occurrence of a regex pattern and replaces it by the given content
 */
export class Replace extends Normalizer {
    /**
     * @inheritdoc
     * @param pattern Pattern to look for, can be a string or a regex
     * @param content Content to replace the parts that match the pattern
     * @param isRegex If false the pattern will be escaped
     */
    constructor(
        public readonly pattern: string,
        public readonly content: string,
        isRegex: boolean,
    ) {
        const replace = isRegex
            ? Rep.create({
                regexReplacement: pattern,
                content,
            })
            : Rep.create({
                stringReplacement: pattern,
                content,
            });
        super(NormalizerWrapper.create({
            replace,
        }));
    }
}

/**
 * Aimed to emulate {@link https://github.com/google/sentencepiece}
 * You probably shouldn't use this
 */
export class Precompiled extends Normalizer {
    constructor(public readonly precompiledCharsmap: Uint8Array) {
        super(NormalizerWrapper.create({
            precompiled: Pre.create({
                precompiledCharsmap,
            }),
        }));
    }
}

export class ByteLevel extends Normalizer {
    constructor() {
        super(NormalizerWrapper.create({ byteLevel: ByteL.create() }));
    }
}
