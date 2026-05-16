import {
    createNewArgs,
    dylib,
    ForeignInstance,
    methodArgsNoResult,
    methodArgsResult,
} from "./foreign-functions.ts";
import {
AddTokenParams,
    DecodeParams,
    DecodeResult,
    EncodeParams,
    EncodeResult,
    SetEncodeSpecialTokensParams,
    TokenizerFromFile,
    TokenizerFromTrain,
} from "./generated/tokenizer/tokenizer.ts";
import type { Encoding } from "./generated/tokenizer/encoding.ts";
import {
    InvalidArguments,
    InvalidPointer,
    InvalidProtocolBuffer,
    ObjectDisposed,
    TokenizerBuildError,
    TokenizerDecodingError,
    TokenizerEncodingError,
    TokenizerLoadFileError,
    TokenizerSaveError,
    TokenizerTrainingError,
    TokenizerAddedVocabError
} from "./errors.ts";

import type { ModelWrapper } from "./generated/models/model.ts";
import type { TrainerWrapper } from "./generated/trainers/trainer.ts";
import type { Normalizer } from "./normalizers.ts";
import type { PreTokenizer } from "./pre-tokenizers.ts";
import type { PostProcessorWrapper } from "./generated/processors/processor_public.ts";
import { ProcessorWrapperParams } from "./generated/processors/processor.ts";
import type { DecoderWrapper } from "./generated/decoders/decoder_public.ts";
import { DecoderWrapperParams } from "./generated/decoders/decoder.ts";
import type { TruncationParams } from "./generated/tokenizer/truncation.ts";
export {
    TruncationDirection,
    TruncationParams,
    TruncationStrategy,
} from "./generated/tokenizer/truncation.ts";
import type { PaddingParams } from "./generated/tokenizer/padding.ts";
import { AddedToken } from "./generated/trainers/added_token.ts";
export {
    PaddingDirection,
    PaddingParams,
    PaddingStrategy,
} from "./generated/tokenizer/padding.ts";

interface TokenizerTrainOptions {
    /** Takes care of pre-processing strings  */
    normalizer?: Normalizer;
    /** Pre-tokenizer that does the pre-segmentation step, splitting strings into substrings while tracking offsets */
    preTokenizer?: PreTokenizer;
    /** Post processors that add special tokens required by the language model */
    processors?: PostProcessorWrapper[];
    /** Decoders that convert raw tokens into readable form */
    decoders?: DecoderWrapper[];
    /** Truncation settings to shorten sequences exceeding max length */
    truncation?: TruncationParams;
    /** Padding settings for sequences shorter than max length */
    padding?: PaddingParams;
}

interface EncodeIncludeOptions {
    /** Whether to add special tokens (default: true) */
    addSpecialTokens?: boolean;
    /** Optional second input for dual sequences */
    input2?: string;
    /** Include type IDs in output (default: false) */
    includeTypeIds?: boolean;
    /** Include token strings in output (default: false) */
    includeTokens?: boolean;
    /** Include word indices in output (default: false) */
    includeWords?: boolean;
    /** Include character offsets in output (default: false) */
    includeOffsets?: boolean;
    /** Include special tokens mask in output (default: false) */
    includeSpecialTokensMask?: boolean;
    /** Include attention mask in output (default: false) */
    includeAttentionMask?: boolean;
    /** Include overflowing tokens in output (default: false) */
    includeOverflowing?: boolean;
}

/**
 * A class to manage a Tokenizer
 */
export class Tokenizer extends ForeignInstance {
    protected constructor(addr: bigint) {
        super();
        this.instancePtr = addr;
    }
    /**
     * Loads a tokenizer from a JSON file
     * @param path A path to a local JSON file representing a previously serialized Tokenizer
     * @returns The tokenizer
     * @throws {TokenizerLoadFileError}
     */
    static fromFile(path: string): Tokenizer {
        return new Tokenizer(createNewArgs(
            dylib.lib_tokenizers_tokenizer_from_file,
            TokenizerFromFile.create({ file: path }),
            TokenizerFromFile,
        ));
    }
    /**
     * Trains a Tokenizer and saves it as a JSON file
     *
     * @param files A list of paths to local files to use as training data
     * @param savePath The path in which the JSON file should be saved
     * @param model Trained algorithm that defines how text is split into tokens
     * @param trainer A trainer has the responsibility to train a model. We feed it with lines/sentences and then it can train the given Model
     * @param options Training configuration options
     * @param pretty Whether the JSON file should be saved with a pretty more human readable format
     * @returns The trained tokenizer
     * @throws {InvalidArguments}
     * @throws {TokenizerBuildError}
     * @throws {TokenizerTrainingError}
     * @throws {TokenizerSaveError}
     *
     * It's possible for this method to throw other types of exceptions like ({@link InvalidProtocolBuffer}, {@link InvalidPointer}, etc).
     *
     * This indicates an issue with the library, please open an issue at {@link https://github.com/IgnaciodelaTorreArias/tokenizers-huggingface-typescript|Github}
     */
    static fromTrain(
        files: string[],
        savePath: string,
        model: ModelWrapper,
        trainer: TrainerWrapper,
        options: TokenizerTrainOptions = {},
        pretty: boolean = false,
    ): Tokenizer {
        const trainingParams = TokenizerFromTrain.create({
            files,
            savePath,
            pretty,
            model,
            trainer,
            truncation: options.truncation,
            padding: options.padding,
        });
        if (options.normalizer != undefined) {
            trainingParams.normalizer = super.getInstancePtr(options.normalizer);
        }
        if (options.preTokenizer != undefined) {
            trainingParams.preTokenizer = super.getInstancePtr(options.preTokenizer);
        }
        if (options.processors != undefined) {
            trainingParams.processor = ProcessorWrapperParams.create({
                params: options.processors,
            });
        }
        if (options.decoders != undefined) {
            trainingParams.decoder = DecoderWrapperParams.create({
                params: options.decoders,
            });
        }
        return new Tokenizer(createNewArgs(
            dylib.lib_tokenizers_tokenizer_from_train,
            trainingParams,
            TokenizerFromTrain,
        ));
    }
    /**
     * Decodes a collection of tokens ids'
     * @param ids The tokens ids'
     * @param skipSpecialTokens
     * @returns The string result of the decoding
     * @throws {TokenizerDecodingError}
     *
     * It's possible for this method to throw other types of exceptions like ({@link InvalidProtocolBuffer}, {@link InvalidPointer}, etc).
     *
     * This indicates an issue with the library, please open an issue at {@link https://github.com/IgnaciodelaTorreArias/tokenizers-huggingface-typescript|Github}
     */
    decode(ids: number[], skipSpecialTokens: boolean): string {
        return methodArgsResult(
            dylib.lib_tokenizers_decode,
            this.instancePtr,
            DecodeParams.create({
                ids,
                skipSpecialTokens,
            }),
            DecodeParams,
            DecodeResult,
        ).decoded;
    }
    /**
     * Encodes a string into the corresponding tokens ids'
     *
     * When the parameters with the "include" prefix are false (default) this helps improve performance since unused data is not serialized/deserialized preventing over fetching
     * @param input The string to encode
     * @param addSpecialTokens Whether to add special tokens
     * @param encodeIncludeOptions Specify Which parts of the encoding you actually need, this helps improve performance since unused data is not serialized/deserialized preventing over fetching
     * @param input2 Optional second input for dual sequences
     * @returns The Encodings with the contents as specified by the parameters
     * @throws {TokenizerEncodingError}
     *
     * It's possible for this method to throw other types of exceptions like ({@link InvalidProtocolBuffer}, {@link InvalidPointer}, etc).
     *
     * This indicates an issue with the library, please open an issue at {@link https://github.com/IgnaciodelaTorreArias/tokenizers-huggingface-typescript|Github}
     */
    encode(
        input: string,
        addSpecialTokens: boolean,
        encodeIncludeOptions: EncodeIncludeOptions = {},
        input2?: string,
        charOffsets?: boolean,
    ): Encoding[] {
        const encodeParams = EncodeParams.create({
            input,
            addSpecialTokens,
            input2,
            charOffsets,
            includeTypeIds: encodeIncludeOptions.includeTypeIds,
            includeTokens: encodeIncludeOptions.includeTokens,
            includeWords: encodeIncludeOptions.includeWords,
            includeOffsets: encodeIncludeOptions.includeOffsets,
            includeSpecialTokensMask: encodeIncludeOptions.includeSpecialTokensMask,
            includeAttentionMask: encodeIncludeOptions.includeAttentionMask,
            includeOverflowing: encodeIncludeOptions.includeOverflowing,
        });
        return methodArgsResult(
            dylib.lib_tokenizers_encode,
            this.instancePtr,
            encodeParams,
            EncodeParams,
            EncodeResult,
        ).encodings;
    }
    /**
     * Set the added vocab’s splitting scheme
     * @param value 
     */
    setEncodeSpecialTokens(value: boolean): void {
        methodArgsNoResult(
            dylib.lib_tokenizers_set_encode_special_tokens,
            this.instancePtr,
            SetEncodeSpecialTokensParams.create({value}),
            SetEncodeSpecialTokensParams
        );
    }
    /**
     * Add the given tokens to the added vocabulary
     * @param tokens Tokens to be added to the vocabulary
     * @param special Whether the tokens should be added as special tokens
     * @throws { TokenizerAddedVocabError }
     */
    addTokens(tokens: AddedToken[], special: boolean): void {
        methodArgsNoResult(
            dylib.lib_tokenizers_add_tokens,
            this.instancePtr,
            AddTokenParams.create({tokens, special}),
            AddTokenParams
        );
    }

    protected override freFunc(): (instancePtr: bigint) => void {
        return dylib.lib_tokenizers_free_tokenizer;
    }
}
