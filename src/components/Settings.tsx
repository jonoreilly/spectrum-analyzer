import { useState } from "react";
import { ComplexNumber } from "@/src/utils/fourierTransform/complexNumbers";
import { Result } from "@/src/utils/utils";
import { statusColor } from "@/src/utils/colors";
import SettingsSection from "./SettingsSection";

const sizes = ["sm", "md", "lg", "xl"];

export type Size = (typeof sizes)[number];

export type Mode = "file" | "live";

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
  onUseMicrophone,
}: {
  file: Result<File>;
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
  onUseMicrophone: () => void;
}) {
  const [mode, setMode] = useState<Mode>("file");

  function onFileChangeEvent(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    onFileChange(file);
  }

  function formatFileSize(bytes: number) {
    const units = [
      { label: "B", bytes: 1 },
      { label: "KB", bytes: 1024 },
      { label: "MB", bytes: 1048576 },
      { label: "GB", bytes: 1073741824 },
    ];

    const unit = units.filter((unit) => unit.bytes <= bytes).pop() ?? units[0];

    const sizeInUnit = bytes / unit.bytes;

    return `${sizeInUnit.toFixed(sizeInUnit < 10 ? 1 : 0)} ${unit.label}`;
  }

  function formatFileDuration(totalSeconds: number) {
    const milliseconds = (totalSeconds % 1) * 1_000;

    const seconds = Math.floor(totalSeconds) % 60;

    const minutes = Math.floor(totalSeconds / 60) % 60;

    const hours = Math.floor(totalSeconds / 60 / 60);

    const padDigits = (value: number, digits = 2) =>
      String(value.toFixed(0)).padStart(digits, "0");

    return `${hours}:${padDigits(minutes)}:${padDigits(seconds)}.${padDigits(milliseconds, 3)}`;
  }

  return (
    <div className="p-2 border flex flex-col gap-2 w-sm">
      <div className="flex gap-2">
        <button
          className={`w-full border p-2 rounded-sm cursor-pointer ${mode === "file" ? "bg-neutral-300 hover:bg-neutral-400" : "bg-white hover:bg-neutral-100"}`}
          onClick={() => setMode("file")}
        >
          Upload file
        </button>

        <button
          className={`w-full border p-2 rounded-sm cursor-pointer ${mode === "live" ? "bg-neutral-300 hover:bg-neutral-400" : "bg-white hover:bg-neutral-100"}`}
          onClick={() => setMode("live")}
        >
          Live analysis
        </button>
      </div>

      {/* File mode */}
      {mode === "file" && (
        <div className="p-2 flex flex-col gap-2">
          {/* File upload */}
          <label className="border bg-white hover:bg-neutral-100 rounded-sm p-2 w-full text-center cursor-pointer">
            <div>Upload {file.value && "new"} file</div>

            <input
              type="file"
              onChange={onFileChangeEvent}
              className="hidden"
            />
          </label>

          {file.value && (
            <div className="flex flex-col gap-2">
              {/* File info */}
              <SettingsSection title="File">
                <div> Name: {file.value?.name}</div>

                <div> Size: {formatFileSize(file.value?.size)}</div>

                <div>
                  Duration:{" "}
                  {audioBuffer.value ? (
                    formatFileDuration(audioBuffer.value?.duration)
                  ) : (
                    <span className={statusColor.pending}>pending</span>
                  )}
                </div>
              </SettingsSection>

              {/* FFT status */}
              <SettingsSection title="Status">
                <div>
                  AudioBuffer:{" "}
                  <span className={statusColor[audioBuffer?.status]}>
                    {audioBuffer?.status} {audioBuffer?.error}
                  </span>
                </div>

                <div>
                  FFT:{" "}
                  <span className={statusColor[fft?.status]}>
                    {fft?.status} {fft?.error}
                  </span>
                </div>
              </SettingsSection>

              {/* FFT info */}
              {fft.status === "success" && (
                <SettingsSection title="FFT">
                  <div>
                    Full size: {fft.value[0]?.length} x {fft.value.length}
                  </div>

                  <div>
                    Cropped size: {croppedFftRows} x {fft.value.length}
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <span>White background</span>

                      <input
                        type="checkbox"
                        checked={isWhiteBackground}
                        onChange={(e) =>
                          onIsWhiteBackgroundChange(e.target.checked)
                        }
                      />
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <span>Compression</span>

                      <input
                        type="checkbox"
                        checked={hasCompression}
                        onChange={(e) =>
                          onHasCompressionChange(e.target.checked)
                        }
                      />

                      <input
                        type="number"
                        value={compression}
                        onChange={(e) =>
                          onCompressionChange(Number(e.target.value))
                        }
                        min="0"
                        max="30"
                      />
                    </label>
                  </div>

                  <div>
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
                  </div>
                </SettingsSection>
              )}
            </div>
          )}
        </div>
      )}

      {/* Live mode */}
      {mode === "live" && (
        <div>
          <div>
            <button
              className="hover:bg-neutral-300 cursor-pointer rounded-sm border p-2"
              onClick={() => onUseMicrophone()}
            >
              Use microphone
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
