# Deno & Bun bindings for Hugging face's Tokenizers

Example:
import { close } from "./foreign-functions.ts";
import { PipelineString, OffsetReferential, OffsetType } from "./pipeline-string.ts";
import { Bert } from "./pre-tokenizers.ts";
import { Lowercase, Nfd, StripAccents, Sequence } from "./normalizers.ts";

const lowerCase = new Lowercase();
const normalizer = new Sequence([
    new Nfd(),
    lowerCase,
    new StripAccents()
]);
// Optionally dispose the normalizer if no longer needed
// If not disposed, it will be cleaned up by the finalizer
// Disposing this won't affect the sequence we created
lowerCase.dispose();
const bert = new Bert();
const testString = new PipelineString("H�llo,  W�rld!");
normalizer.normalize(testString);
bert.preTokenize(testString);
const splits = testString.getSplits(
    OffsetReferential.ORIGINAL,
    OffsetType.CHAR,
    true
);
console.log(`Tokens: [${splits.map(split => split[0]).join(",")}]`)
bert.dispose();
normalizer.dispose();
testString.dispose();

close()