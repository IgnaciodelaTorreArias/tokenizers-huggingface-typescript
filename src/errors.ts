import * as e from "./generated/error.ts";

export class ObjectDisposed extends Error {}

export class InvalidProtocolBuffer extends Error {}
export class InvalidPointer extends Error {}
export class InvalidArguments extends Error {}
export class EmptyParams extends Error {}

export class NormalizationError extends Error {}
export class PreTokenizationError extends Error {}
export class TokenizerBuildError extends Error {}
export class TokenizerTrainingError extends Error {}
export class TokenizerSaveError extends Error {}
export class TokenizerLoadFileError extends Error {}
export class TokenizerEncodingError extends Error {}
export class TokenizerDecodingError extends Error {}
export class TokenizerAddedVocabError extends Error {}

export function throwErrors(status: number, buf: Uint8Array): void {
    let details = "";
    if (status > 0) {
        details = e.Error.decode(buf).details!;
    }
    switch (e.callStatusFromJSON(status)) {
        case e.CallStatus.DECODE_ERROR:
            throw new InvalidProtocolBuffer(
                "DECODE_ERROR. InvalidProtocolBuffer",
            );
        case e.CallStatus.INVALID_ARGUMENTS_DETAILS:
            throw new InvalidArguments(
                `INVALID_ARGUMENTS_DETAILS: ${details}`,
            );
        case e.CallStatus.INVALID_ARGUMENTS:
            throw new InvalidArguments();
        case e.CallStatus.UNKNOWN_ENUM_VALUE:
            throw new RangeError("Unknown enum value");
        case e.CallStatus.EMPTY_PARAMS:
            throw new EmptyParams(
                "EMPTY_PARAMS. A required field is not present",
            );
        case e.CallStatus.INVALID_POINTER_DETAILS:
            throw new InvalidPointer(details);

        case e.CallStatus.NORMALIZATION_ERROR_DETAILS:
            throw new NormalizationError(details);
        case e.CallStatus.PRE_TOKENIZATION_ERROR_DETAILS:
            throw new PreTokenizationError(details);
        case e.CallStatus.TOKENIZER_BUILD_ERROR_DETAILS:
            throw new TokenizerBuildError(details);
        case e.CallStatus.TOKENIZER_TRAINING_ERROR_DETAILS:
            throw new TokenizerTrainingError(details);
        case e.CallStatus.TOKENIZER_SAVE_ERROR_DETAILS:
            throw new TokenizerSaveError(details);
        case e.CallStatus.TOKENIZER_LOAD_FILE_ERROR_DETAILS:
            throw new TokenizerLoadFileError(details);
        case e.CallStatus.TOKENIZER_ENCODING_ERROR_DETAILS:
            throw new TokenizerEncodingError(details);
        case e.CallStatus.TOKENIZER_DECODING_ERROR_DETAILS:
            throw new TokenizerDecodingError(details);
        case e.CallStatus.TOKENIZER_ADDED_VOCAB_ERROR_DETAILS:
            throw new TokenizerAddedVocabError(details);
    }
    if (status > 0) {
        throw new Error(
            `Unknown error occurred, code: ${status}, details: ${details}`,
        );
    } else {
        throw new Error(`Unknown error occurred, code: ${status}`);
    }
}