import {
    createNewArgs,
    dylib,
    ForeignInstance,
    methodArgsResult,
} from "./foreign-functions.ts";
import {
    PipelineStringParams,
    SplitParams,
    SplitResult,
} from "./generated/pipeline_string/pipeline_string.ts";
import type { Offsets } from "./generated/tokenizer/encoding.ts";
import {
    OffsetReferential,
    OffsetType,
} from "./generated/pipeline_string/pipeline_string_public.ts";

import type { Normalizer } from "./normalizers.ts";
import type { PreTokenizer } from "./pre-tokenizers.ts";


export {OffsetReferential, OffsetType};

/**
 * A class used to represent the transformations applied to a string by: {@link Normalizer} and {@link PreTokenizer}
 */
export class PipelineString extends ForeignInstance {
    /**
     * @inheritdoc
     * @param original The string you want to transform
     */
    constructor(original: string) {
        super();
        this.instancePtr = createNewArgs(
            dylib.lib_tokenizers_new_pipeline_string,
            PipelineStringParams.create({ content: original }),
            PipelineStringParams,
        );
    }
    /**
     * Use this method to see the current state of the string after transformations
     * @param offsetReferential 
     * @param offsetType 
     * @param includeOffsets 
     * @returns Splits of the original string
     */
    getSplits(
        offsetReferential: OffsetReferential,
        offsetType: OffsetType,
        includeOffsets: boolean,
    ): [string, [number, number] | null][] {
        const r = methodArgsResult(
            dylib.lib_tokenizers_get_splits,
            this.instancePtr,
            SplitParams.create({
                offsetReferential,
                offsetType,
                includeOffsets,
            }),
            SplitParams,
            SplitResult,
        );
        const result: [string, [number, number] | null][] = [];
        for (let i = 0; i < r.tokens.length; i++) {
            let offset: [number, number] | null = null;
            if (includeOffsets) {
                offset = [
                    (r.offsets[i] as Offsets).start,
                    (r.offsets[i] as Offsets).end,
                ];
            }
            result.push([r.tokens[i] as string, offset]);
        }
        return result;
    }
    protected override freFunc(): (instancePtr: bigint) => void {
        return dylib.lib_tokenizers_free_pipeline_string;
    }
}
