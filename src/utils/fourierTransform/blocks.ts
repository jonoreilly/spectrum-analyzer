export function getHannWindow(N: number) {
  return new Array(N)
    .fill(0)
    .map((_, i) => 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1))));
}

export const BlockSize = 2 ** 12;

export const Overlap = 0.75;

export function toBlocks(
  samples: number[],
  blockSize: number = BlockSize,
  overlap: number = Overlap,
) {
  const samplesWithPadding = [
    ...new Array(blockSize).fill(0),
    ...samples,
    ...new Array(blockSize).fill(0),
  ];

  const stepSize = Math.floor(blockSize * (1 - overlap));

  const blockQuantity =
    (samplesWithPadding.length - (blockSize - stepSize)) / stepSize;

  const blocks = new Array(blockQuantity)
    .fill(0)
    .map((_, i) =>
      samplesWithPadding.slice(i * stepSize, i * stepSize + blockSize),
    );

  const hannWindow = getHannWindow(blockSize);

  const smoothedBlocks = blocks.map((bloque) =>
    bloque.map((_, i) => bloque[i] * hannWindow[i]),
  );

  const blocksWithPadding = smoothedBlocks.map((bloque) => [
    ...bloque,
    ...new Array(bloque.length).fill(0),
  ]);

  return blocksWithPadding;
}

export function parseBlocks(
  blocks: number[][],
  blockSize: number = BlockSize,
  overlap: number = Overlap,
) {
  const blockQuantity = blocks.length;

  const originalLength = Math.round(
    blockSize * overlap + blockQuantity * (blockSize * (1 - overlap)),
  );

  const hannWindow = getHannWindow(blockSize);

  const hannWindowSquared = hannWindow.map((v) => v ** 2);

  const sums = new Array(originalLength).fill(0);
  const weights = new Array(originalLength).fill(0);

  for (const blockIndex of new Array(blockQuantity)
    .fill(0)
    .map((_, i) => i + 1)) {
    const start = Math.round(
      (blockIndex - 1) * (blockSize * (1 - overlap)) + 1,
    );

    for (let i = 0; i < blockSize; i++) {
      sums[start + i] = blocks[blockIndex][i];
      weights[start + i] = hannWindowSquared[i];
    }
  }

  const reconstructedSamples = sums.map((_, i) => sums[i] / weights[i]);

  const samplesWithoutPadding = reconstructedSamples.slice(
    blockSize,
    -blockSize,
  );

  return samplesWithoutPadding;
}
