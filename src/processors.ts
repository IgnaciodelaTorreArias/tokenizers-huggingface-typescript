import { RobertaProcessing } from "./generated/processors/roberta.ts";
import { BertProcessing } from "./generated/processors/bert.ts";
import { ByteLevel } from "./generated/pre_tokenizers/byte_level.ts";
import {
    SpecialToken,
    TemplateProcessing,
    Token,
    TokenPair,
    Tokens,
    TokensMap,
} from "./generated/processors/template.ts";

import { PostProcessorWrapper } from "./generated/processors/processor_public.ts";
const PostProcessors = {
    RobertaProcessing,
    BertProcessing,
    ByteLevel,
    SpecialToken,
    TokenPair,
    Token,
    TokensMap,
    Tokens,
    TemplateProcessing,
    PostProcessorWrapper,
} as const;
export default PostProcessors;
