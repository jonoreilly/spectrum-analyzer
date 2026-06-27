import { Result } from "../utils";
import { toBlocks } from "./blocks";
import { ComplexNumber } from "./complexNumbers";
import { fft } from "./fft";

export function doFft(samples: number[]): Result<ComplexNumber[][]> {
  try {
    const newFft = toBlocks(samples).map((block) => fft(block));

    return { status: "success", value: newFft };
  } catch (error) {
    console.log(error);

    return { status: "error" };
  }
}
