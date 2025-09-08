import { BpeDecoder } from "./generated/decoders/bpe.ts";
import { ByteLevel } from "./generated/pre_tokenizers/byte_level.ts";
import { WordPiece } from "./generated/decoders/word_piece.ts";
import {
    Metaspace,
    PrependScheme,
} from "./generated/pre_tokenizers/metaspace.ts";
import { Ctc } from "./generated/decoders/ctc.ts";
import { Replace } from "./generated/normalizers/replace.ts";
import { Fuse } from "./generated/decoders/fuse.ts";
import { Strip } from "./generated/decoders/strip.ts";
import { ByteFallback } from "./generated/decoders/byte_fallback.ts";

import { DecoderWrapper } from "./generated/decoders/decoder_public.ts";

const Decoders = {
    BpeDecoder,
    ByteLevel,
    WordPiece,
    PrependScheme,
    Metaspace,
    Ctc,
    Replace,
    Fuse,
    Strip,
    ByteFallback,
    DecoderWrapper,
} as const;
export default Decoders;
