# tokenizers-huggingFace

Deno & Bun bindings for [huggingface/tokenizers](https://github.com/huggingface/tokenizers) using protobufs for communication and C-ABI.

## Supported platforms

- linux-arm64
- linux-x64
- darwin-arm64
- darwin-x64
- win32-x64
- win32-arm64

## Usage

Cases:

- Normalization
- PreTokenization
- Tokenizer (Encode, Decode, Load From File, Train)

### Examples

#### Basic Tokenization from file

```typescript
import { close, Tokenizer } from "@lazy-engineer/tokenizers-huggingface";

const tk = Tokenizer.fromFile("./tokenizer.json");
const encodings = tk.encode("Hello, World!", true)[0];
console.log(`${encodings.ids.join(",")}`)
tk.dispose()
close()
```

#### Test Pipeline with normalization and pretokenization

```typescript
import { close, Normalizers, PreTokenizers, PipelineString } from "@lazy-engineer/tokenizers-huggingface";

const lowerCase = new Normalizers.Lowercase();
const normalizer = new Normalizers.Sequence([
    new Normalizers.Nfd(),
    lowerCase,
    new Normalizers.StripAccents()
]);
// Optionally dispose the normalizer if no longer needed
// Disposing this won't affect the sequence we created
// You also can use the "using" keyword
lowerCase.dispose();
const bert = new PreTokenizers.Bert();
const testString = new PipelineString.PipelineString("H�llo,  W�rld!");
normalizer.normalize(testString);
bert.preTokenize(testString);
console.log("GETTING SPLITS")
const splits = testString.getSplits(
    PipelineString.OffsetReferential.ORIGINAL,
    PipelineString.OffsetType.CHAR,
    true
);
console.log(`Tokens: ['${splits.map(split => split[0]).join("','")}']`)
console.log(
  `Offsets: [${splits
    .map(split => {
      const [a, b] = split[1] ?? [null, null];
      return `(${a ?? "?"}, ${b ?? "?"})`;
    })
    .join(",")}]`
);
bert.dispose();
normalizer.dispose();
testString.dispose();

close()
```

#### Train a [all-together-a-bert-tokenizer-from-scratch](https://huggingface.co/docs/tokenizers/pipeline#all-together-a-bert-tokenizer-from-scratch)

```typescript
import { close, Normalizers, PreTokenizers, Processors, Trainers, Tokenizer, Models } from "@lazy-engineer/tokenizers-huggingface";

const normalizer = new Normalizers.Sequence([
    new Normalizers.Nfd(),
    new Normalizers.Lowercase(),
    new Normalizers.StripAccents(),
]);
const preTokenizer = new PreTokenizers.Whitespace();
const tokensProcessor = [
    Processors.Token.create({ tokenPair: Processors.TokenPair.create({ token: "[CLS]", tokenId: 1 })}),
    Processors.Token.create({ tokenPair: Processors.TokenPair.create({ token: "[SEP]", tokenId: 2 })}),
];
const processor = Processors.TemplateProcessing.create({
    single: "[CLS] $A [SEP]",
    pair: "[CLS] $A [SEP] $B:1 [SEP]:1",
    tokens: Processors.Tokens.create({tokens: tokensProcessor})
});
const tokensTrainer = [
    Trainers.AddedToken.create({ content: "[UNK]", special: true }),
    Trainers.AddedToken.create({ content: "[CLS]", special: true }),
    Trainers.AddedToken.create({ content: "[SEP]", special: true }),
    Trainers.AddedToken.create({ content: "[PAD]", special: true }),
    Trainers.AddedToken.create({ content: "[MASK]", special: true }),
];
using tk = Tokenizer.fromTrain(
    ["corpus.txt"],
    "my_tokenizer.json",
    Models.ModelWrapper.create({
        wordPiece: Models.WordPieceModel.create()
    }),
    Trainers.TrainerWrapper.create({
        wordPiece: Trainers.WordPieceTrainer.create({ vocabSize: 30522, specialTokens: tokensTrainer })
    }),
    {
        normalizer: normalizer,
        preTokenizer: preTokenizer,
        processors: [Processors.PostProcessorWrapper.create({templateProcessing: processor})]
    },
    true
);
close()
```
