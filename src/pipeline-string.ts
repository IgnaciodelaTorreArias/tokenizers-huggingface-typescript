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
import type {
    OffsetReferential,
    OffsetType,
} from "./generated/pipeline_string/pipeline_string_public.ts";

export class PipelineString extends ForeignInstance {
    constructor(original: string) {
        super();
        this.instancePtr = createNewArgs(
            dylib.new_pipeline_string,
            PipelineStringParams.create({ content: original }),
            PipelineStringParams,
        );
    }
    getSplits(
        offsetReferential: OffsetReferential,
        offsetType: OffsetType,
        includeOffsets: boolean,
    ): [string, [number, number] | null][] {
        const r = methodArgsResult(
            dylib.get_splits,
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
        return dylib.free_pipeline_string;
    }
}
