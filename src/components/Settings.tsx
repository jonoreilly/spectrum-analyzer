import { ComplexNumber } from "../utils/fourierTransform/complexNumbers";
import { Result } from "../utils/utils";

const sizes = ["sm", "md", "lg", "xl"];

export type Size = (typeof sizes)[number];

export default function Settings({
  file,
  audioBuffer,
  fft,
  croppedFftRows,
  isWhiteBackground,
  hasCompression,
  compression,
  cellSize,
  onFileChange,
  onIsWhiteBackgroundChange,
  onHasCompressionChange,
  onCompressionChange,
  onCellSizeChange,
}: {
  file?: File;
  audioBuffer: Result<
    AudioBuffer,
    "unsupported-file-type" | "no-audio-context"
  >;
  fft: Result<ComplexNumber[][]>;
  croppedFftRows: number;
  isWhiteBackground: boolean;
  hasCompression: boolean;
  compression: number;
  cellSize: Size;
  onFileChange: (file?: File) => void;
  onIsWhiteBackgroundChange: (isWhiteBackground: boolean) => void;
  onHasCompressionChange: (hasCompression: boolean) => void;
  onCompressionChange: (compression: number) => void;
  onCellSizeChange: (cellSize: Size) => void;
}) {
  function onFileChangeEvent(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    onFileChange(file);
  }

  return (
    <div className="p-2 border">
      <input
        type="file"
        onChange={onFileChangeEvent}
        className="bg-blue-400 hover:bg-blue-600 cursor-pointer rounded-sm border border-amber-500 p-2"
      />

      <p>
        AudioBuffer: {audioBuffer?.status} {audioBuffer?.error}
      </p>

      <p>
        FFT: {fft?.status} {fft?.error}
      </p>

      {fft.status === "success" && (
        <div>
          <p>
            FFT size:
            {fft.value[0]?.length} x {fft.value.length}
          </p>

          <p>
            Cropped FFT size: {croppedFftRows} x {fft.value.length}
          </p>

          <p>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isWhiteBackground}
                onChange={(e) => onIsWhiteBackgroundChange(e.target.checked)}
              />

              <span>White background</span>
            </label>
          </p>

          <p>
            <label className="flex items-center gap-2">
              <span>Compression</span>

              <input
                type="checkbox"
                checked={hasCompression}
                onChange={(e) => onHasCompressionChange(e.target.checked)}
              />

              <input
                type="number"
                value={compression}
                onChange={(e) => onCompressionChange(Number(e.target.value))}
                min="0"
                max="30"
              />
            </label>
          </p>

          <p>
            <label className="flex items-center gap-2">
              <span>Cell size</span>

              <select
                value={cellSize}
                onChange={(e) => onCellSizeChange(e.target.value)}
              >
                {sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </p>
        </div>
      )}
    </div>
  );
}
