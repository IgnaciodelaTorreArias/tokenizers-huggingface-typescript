import { BpeModel, Merge } from "./generated/models/bpe.ts";
import { UnigramModel, VocabItem } from "./generated/models/unigram.ts";
import { WordLevelModel } from "./generated/models/word_level.ts";
import { WordPieceModel } from "./generated/models/word_piece.ts";

import { ModelWrapper } from "./generated/models/model.ts";

const Models = {
    Merge,
    BpeModel,
    VocabItem,
    UnigramModel,
    WordLevelModel,
    WordPieceModel,
    ModelWrapper,
} as const;
export default Models;
