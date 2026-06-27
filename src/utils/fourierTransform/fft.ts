import {
  addComplex,
  ComplexNumber,
  multiplyComplex,
  subtractComplex,
  toComplexNumber,
} from "./complexNumbers";

function isPower2(n: number) {
  return n > 0 && (n & (n - 1)) === 0;
}

export function fft(samples: number[]): ComplexNumber[] {
  const N = samples.length;

  if (N === 1) {
    return samples.map(toComplexNumber);
  }

  if (!isPower2(N)) {
    const nextPower2 = 2 ** Math.ceil(Math.log2(N));

    const samplesPower2 = [...samples, ...new Array(nextPower2 - N).fill(0)];

    return fft(samplesPower2);
  }

  const odd = samples.filter((_, i) => i % 2);
  const even = samples.filter((_, i) => !(i % 2));

  const fftOdd = fft(odd);
  const fftEven = fft(even);

  const twiddleFactors = new Array(Math.floor(N / 2)).fill(0).map(
    (_, i): ComplexNumber => ({
      real: Math.cos((2 * Math.PI * i) / N),
      imaginary: -Math.sin((2 * Math.PI * i) / N),
    }),
  );

  const fftOddProcessed = twiddleFactors.map((_, i) =>
    multiplyComplex(twiddleFactors[i], fftOdd[i]),
  );

  const result = [
    ...fftEven.map((_, i) => addComplex(fftEven[i], fftOddProcessed[i])),
    ...fftEven.map((_, i) => subtractComplex(fftEven[i], fftOddProcessed[i])),
  ];

  return result;
}
