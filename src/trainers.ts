import { AddedToken } from "./generated/trainers/added_token.ts";
import { BpeTrainer } from "./generated/trainers/bpe.ts";
import { UnigramTrainer } from "./generated/trainers/unigram.ts";
import { WordLevelTrainer } from "./generated/trainers/word_level.ts";
import { WordPieceTrainer } from "./generated/trainers/word_piece.ts";

import { TrainerWrapper } from "./generated/trainers/trainer.ts";

const Trainers = {
    AddedToken,
    BpeTrainer,
    UnigramTrainer,
    WordLevelTrainer,
    WordPieceTrainer,
    TrainerWrapper,
} as const;
export default Trainers;
