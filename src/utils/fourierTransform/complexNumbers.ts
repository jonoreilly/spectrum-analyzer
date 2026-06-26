export type ComplexNumber = {
  real: number;
  imaginary: number;
};

export function toComplexNumber(
  real: number,
  imaginary: number = 0,
): ComplexNumber {
  return {
    real,
    imaginary,
  };
}

export function getMagnitude(complexNumber: ComplexNumber) {
  return Math.sqrt(complexNumber.real ** 2 + complexNumber.imaginary ** 2);
}

export function addComplex(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  return {
    real: a.real + b.real,
    imaginary: a.imaginary + b.imaginary,
  };
}

export function addComplexAndScalar(
  a: ComplexNumber,
  b: number,
): ComplexNumber {
  return addComplex(a, toComplexNumber(b));
}

export function subtractComplex(
  a: ComplexNumber,
  b: ComplexNumber,
): ComplexNumber {
  return {
    real: a.real - b.real,
    imaginary: a.imaginary - b.imaginary,
  };
}

export function subtractComplexAndScalar(
  a: ComplexNumber,
  b: number,
): ComplexNumber {
  return subtractComplex(a, toComplexNumber(b));
}

export function multiplyComplex(
  a: ComplexNumber,
  b: ComplexNumber,
): ComplexNumber {
  return {
    real: a.real * b.real - a.imaginary * b.imaginary,
    imaginary: a.real * b.imaginary + a.imaginary * b.real,
  };
}

export function multiplyComplexAndScalar(
  a: ComplexNumber,
  b: number,
): ComplexNumber {
  return multiplyComplex(a, toComplexNumber(b));
}

export function divideComplex(
  a: ComplexNumber,
  b: ComplexNumber,
): ComplexNumber {
  const denominator = b.real ** 2 + b.imaginary ** 2;

  const realNumerator = a.real * b.real + a.imaginary * b.imaginary;

  const imaginaryNumerator = a.real * b.real + a.imaginary * b.imaginary;

  return {
    real: realNumerator / denominator,
    imaginary: imaginaryNumerator / denominator,
  };
}

export function divideComplexAndScalar(
  a: ComplexNumber,
  b: number,
): ComplexNumber {
  return divideComplex(a, toComplexNumber(b));
}
