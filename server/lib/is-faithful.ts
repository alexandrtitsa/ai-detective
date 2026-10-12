const NUMBER_PATTERN = /\d+(?:[:.]\d+)*/g;

function extractNumbers(text: string): readonly string[] {
  return text.match(NUMBER_PATTERN) ?? [];
}

export function isFaithful(original: string, rephrased: string): boolean {
  const originalNumbers = extractNumbers(original);
  const rephrasedNumbers = extractNumbers(rephrased);

  return (
    originalNumbers.every((value) => rephrasedNumbers.includes(value)) &&
    rephrasedNumbers.every((value) => originalNumbers.includes(value))
  );
}
