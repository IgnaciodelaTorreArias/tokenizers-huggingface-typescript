import {
    createNewArgs,
    dylib,
    ForeignInstance,
    methodArgsResult,
} from "./foreign-functions.ts";
import {
    DecodeParams,
    DecodeResult,
    EncodeParams,
    EncodeResult,
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
export {
    PaddingDirection,
    PaddingParams,
    PaddingStrategy,
} from "./generated/tokenizer/padding.ts";

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
            dylib.tokenizer_from_file,
            TokenizerFromFile.create({ file: path }),
            TokenizerFromFile,
        ));
    }
    /**
     * Trains a Tokenizer and saves it as a JSON file
     * @param files A list of paths to local files to use as training data
     * @param savePath The path in which the JSON file should be saved
     * @param model Trained algorithm that defines how text is split into tokens
     * @param trainer A trainer has the responsibility to train a model. We feed it with lines/sentences and then it can train the given Model
     * @param pretty Whether the JSON file should be saved with a pretty more human readable format
     * @param normalizer Takes care of pre-processing strings
     * @param preTokenizer The pre tokenizer is in charge of doing the pre-segmentation step. It splits the given string in multiple substrings, keeping track of the offsets of said substrings
     * @param processors A post processor has the responsibility to post process an encoded output of the Tokenizer. It adds any special tokens that a language model would require
     * @param decoders A decoder changes the raw tokens into its more readable form
     * @param truncation Truncation shortens input sequences that exceed a specified max length. This is crucial because most models have a fixed maximum input size
     * @param padding If truncation takes care of cases when an input sequence exceeds a max length, padding takes care when the input sequence is shorter
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
        pretty: boolean = false,
        normalizer: Normalizer | null = null,
        preTokenizer: PreTokenizer | null = null,
        processors: PostProcessorWrapper[] | null = null,
        decoders: DecoderWrapper[] | null = null,
        truncation: TruncationParams | null = null,
        padding: PaddingParams | null = null,
    ): Tokenizer {
        const trainingParams = TokenizerFromTrain.create({
            files,
            savePath,
            pretty,
        });
        trainingParams.model = model;
        trainingParams.trainer = trainer;
        if (normalizer != null) {
            trainingParams.normalizer = super.getInstancePtr(normalizer);
        }
        if (preTokenizer != null) {
            trainingParams.preTokenizer = super.getInstancePtr(preTokenizer);
        }
        if (processors != null) {
            trainingParams.processor = ProcessorWrapperParams.create({
                params: processors,
            });
        }
        if (decoders != null) {
            trainingParams.decoder = DecoderWrapperParams.create({
                params: decoders,
            });
        }
        if (truncation != null) {
            trainingParams.truncation = truncation;
        }
        if (padding != null) {
            trainingParams.padding = padding;
        }
        return new Tokenizer(createNewArgs(
            dylib.tokenizer_from_train,
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
        if (this.instancePtr === 0n) {
            throw new ObjectDisposed();
        }
        return methodArgsResult(
            dylib.decode,
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
     * @param input2 An optional 2nd input for dual sequences
     * @param includeTypeIds
     * @param includeTokens
     * @param includeWords
     * @param includeOffsets
     * @param includeSpecialTokensMask
     * @param includeAttentionMask
     * @param includeOverflowing
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
        input2: string | null = null,
        includeTypeIds: boolean = false,
        includeTokens: boolean = false,
        includeWords: boolean = false,
        includeOffsets: boolean = false,
        includeSpecialTokensMask: boolean = false,
        includeAttentionMask: boolean = false,
        includeOverflowing: boolean = false,
    ): Encoding[] {
        if (this.instancePtr === 0n) {
            throw new ObjectDisposed();
        }
        const encodeParams = EncodeParams.create({
            input,
            addSpecialTokens,
            includeTypeIds,
            includeTokens,
            includeWords,
            includeOffsets,
            includeSpecialTokensMask,
            includeAttentionMask,
            includeOverflowing,
        });
        if (input2 != null) {
            encodeParams.input2 = input2;
        }
        return methodArgsResult(
            dylib.encode,
            this.instancePtr,
            encodeParams,
            EncodeParams,
            EncodeResult,
        ).encodings;
    }

    protected override freFunc(): (instancePtr: bigint) => void {
        return dylib.free_tokenizer;
    }
}
