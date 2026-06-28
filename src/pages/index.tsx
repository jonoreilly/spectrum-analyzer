import { useMemo, useRef, useState } from "react";
import Graph from "../components/graph/Graph";
import { decodeAudioFile } from "../utils/audio";
import { doFft } from "../utils/fourierTransform";
import classNames from "classnames";
import { getMagnitude } from "../utils/fourierTransform/complexNumbers";

export default function Home() {
  const [file, setFile] = useState<File>();

  const [audioBuffer, setAudioBuffer] = useState<
    Awaited<ReturnType<typeof decodeAudioFile>>
  >({
    status: "initial",
  });

  const [fft, setFft] = useState<ReturnType<typeof doFft>>({
    status: "initial",
  });

  const fileIdRef = useRef(0);

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const fileId = ++fileIdRef.current;

    const newFile = event.target.files?.[0];

    setFile(newFile);

    setAudioBuffer({ status: "pending" });

    setFft({ status: "pending" });

    // Decode audio file
    setTimeout(async () => {
      const newAudioBuffer = await decodeAudioFile(newFile);

      if (fileId !== fileIdRef.current) return;

      setAudioBuffer(newAudioBuffer);

      if (newAudioBuffer.status !== "success") {
        setFft({ status: "initial" });

        return;
      }

      setTimeout(() => {
        // Do FFT

        const samples = [...newAudioBuffer.value.getChannelData(0)];

        const newFft = doFft(samples);

        if (fileId !== fileIdRef.current) return;

        setFft(newFft);
      }, 100);
    }, 100);
  }

  const [isWhiteBackground, setIsWhiteBackground] = useState(true);

  const [hasCompression, setHasCompression] = useState(true);

  const [compression, setCompression] = useState(10);

  const sizes = ["sm", "md", "lg", "xl"];

  type Size = (typeof sizes)[number];

  const [cellSize, setCellSize] = useState<Size>("sm");

  const sizeClass = useMemo(() => {
    const sizeClasses: Record<Size, string> = {
      sm: "size-0.5",
      md: "size-1",
      lg: "size-2",
      xl: "size-4",
    };

    return sizeClasses[cellSize];
  }, [cellSize]);

  const colors = useMemo(() => {
    const colors = [
      "bg-neutral-0",
      "bg-neutral-100",
      "bg-neutral-200",
      "bg-neutral-300",
      "bg-neutral-400",
      "bg-neutral-500",
      "bg-neutral-600",
      "bg-neutral-700",
      "bg-neutral-800",
      "bg-neutral-900",
    ];

    return isWhiteBackground ? colors : colors.toReversed();
  }, [isWhiteBackground]);

  function getMagnitudeCompressed(magnitude: number) {
    return hasCompression
      ? Math.log1p(compression * magnitude) / Math.log1p(compression)
      : magnitude;
  }

  function getColorClass(magnitude: number) {
    const colorsCount = colors.length;

    const compressedMagnitude = getMagnitudeCompressed(magnitude);

    const colorIndex = Math.floor(compressedMagnitude * colorsCount);

    return colors[colorIndex] ?? colors[colors.length - 1];
  }

  const normalizedFftMagnitudes = useMemo(() => {
    if (fft.status !== "success") {
      return;
    }

    const croppedFft = fft.value.map((block) => block.slice(0, 250));

    const magnitudes = croppedFft.map((block) =>
      block.map((complexNumber) => getMagnitude(complexNumber)),
    );

    const maxMagnitude = Math.max(
      ...magnitudes.map((block) => Math.max(...block)),
    );

    const normalizedMagnitudes = magnitudes.map((block) =>
      block.map((magnitude) => magnitude / maxMagnitude),
    );

    return normalizedMagnitudes;
  }, [fft]);

  const columnsCount = useMemo(
    () => normalizedFftMagnitudes?.length,
    [normalizedFftMagnitudes],
  );

  const rowsCount = useMemo(
    () => normalizedFftMagnitudes?.[0]?.length,
    [normalizedFftMagnitudes],
  );

  /** @param rowIndex Index of the row starting from the lowest frequency */
  function getFrequencies(rowIndex: number) {
    if (audioBuffer.status !== "success" || fft.status !== "success") {
      return;
    }

    const maxFrequency = audioBuffer.value.sampleRate;

    const containers = fft.value[0]?.length;

    const hzPerContainer = maxFrequency / containers;

    return {
      low: hzPerContainer * rowIndex,
      high: hzPerContainer * (rowIndex + 1),
    };
  }

  function getTitle(value: number, rowIndex: number) {
    const frequencies = getFrequencies(rowIndex);

    if (!frequencies) {
      return;
    }

    return `${(frequencies.low / 1_000).toFixed(2)}-${(frequencies.high / 1_000).toFixed(2)}kHz ~ ${value.toFixed(2)}`;
  }

  type Key = {
    row: number;
    colStart: number;
    name: string;
    frequencies: number[];
    color: string;
  };

  const keys: Key[] = [
    {
      row: 2,
      colStart: 1,
      name: "C",
      frequencies: [130.81, 261.63, 523.25, 1046.5],
      color: "bg-lime-500",
    },
    {
      row: 1,
      colStart: 2,
      name: "C#",
      frequencies: [138.59, 277.18, 554.37, 1174.66],
      color: "bg-green-500",
    },
    {
      row: 2,
      colStart: 3,
      name: "D",
      frequencies: [146.83, 293.66, 587.33],
      color: "bg-emerald-500",
    },
    {
      row: 1,
      colStart: 4,
      name: "D#",
      frequencies: [155.56, 311.13, 622.25],
      color: "bg-teal-500",
    },
    {
      row: 2,
      colStart: 5,
      name: "E",
      frequencies: [164.81, 329.63, 659.26],
      color: "bg-cyan-500",
    },
    {
      row: 2,
      colStart: 7,
      name: "F",
      frequencies: [174.61, 349.23, 698.46],
      color: "bg-sky-500",
    },
    {
      row: 1,
      colStart: 8,
      name: "F#",
      frequencies: [185.0, 369.99, 739.99],
      color: "bg-blue-500",
    },
    {
      row: 2,
      colStart: 9,
      name: "G",
      frequencies: [196.0, 392.0, 783.99],
      color: "bg-indigo-500",
    },
    {
      row: 1,
      colStart: 10,
      name: "G#",
      frequencies: [207.65, 415.3, 830.61],
      color: "bg-violet-500",
    },
    {
      row: 2,
      colStart: 11,
      name: "A",
      frequencies: [110.0, 220.0, 440.0, 880.0],
      color: "bg-purple-500",
    },
    {
      row: 1,
      colStart: 12,
      name: "A#",
      frequencies: [116.54, 233.08, 466.16, 932.33],
      color: "bg-fuchsia-500",
    },
    {
      row: 2,
      colStart: 13,
      name: "B",
      frequencies: [123.47, 246.94, 493.88, 987.77],
      color: "bg-pink-500",
    },
  ];

  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);

  function toggleKey(key: Key) {
    const isSelected = selectedKeys.some((k) => k.name === key.name);

    if (isSelected) {
      setSelectedKeys(selectedKeys.filter((k) => k.name !== key.name));
    } else {
      setSelectedKeys([...selectedKeys, key]);
    }
  }

  function getFrequencyKey(rowIndex: number) {
    const frequencies = getFrequencies(rowIndex);

    if (!frequencies) {
      return;
    }

    return keys.find((key) =>
      key.frequencies.some(
        (frequency) =>
          frequencies.low <= frequency && frequency <= frequencies.high,
      ),
    );
  }

  function getFrequencyColorClass(rowIndex: number) {
    return getFrequencyKey(rowIndex)?.color;
  }

  function isSelectedKey(key?: Key) {
    return selectedKeys.some((k) => k.name === key?.name);
  }

  function getSelectedFrequencyColorClass(rowIndex: number) {
    const key = getFrequencyKey(rowIndex);

    if (isSelectedKey(key)) {
      return key?.color;
    }
  }

  function isSelectedFrequency(rowIndex: number) {
    const key = getFrequencyKey(rowIndex);

    return isSelectedKey(key);
  }

  const [showKeyLines, setShowKeyLines] = useState(false);

  return (
    <div>
      <div className="flex gap-2">
        {/* Settings */}
        <div className="p-2 border">
          <input
            type="file"
            onChange={onFileChange}
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
                Cropped FFT size: {rowsCount} x {columnsCount}
              </p>

              <p>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isWhiteBackground}
                    onChange={(e) => setIsWhiteBackground(e.target.checked)}
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
                    onChange={(e) => setHasCompression(e.target.checked)}
                  />

                  <input
                    type="number"
                    value={compression}
                    onChange={(e) => setCompression(Number(e.target.value))}
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
                    onChange={(e) => setCellSize(e.target.value)}
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

        {/* Piano */}
        <div className="flex items-center gap-2">
          <div className="grid grid-rows-2 grid-cols-[repeat(14,1fr)] w-64 h-32">
            {keys.map((key) => (
              <button
                key={key.name}
                title={key.name + " " + key.frequencies.join(" ")}
                style={{ gridRow: key.row, gridColumnStart: key.colStart }}
                className={
                  "col-span-2 border flex flex-col items-center justify-center cursor-pointer " +
                  (selectedKeys.some((k) => k.name === key.name)
                    ? key.color + " border-white"
                    : key.row === 1
                      ? "border-white text-white bg-black hover:bg-neutral-700"
                      : "bg-white hover:bg-neutral-200")
                }
                onClick={() => toggleKey(key)}
              >
                <div>{key.name}</div>

                {showKeyLines && (
                  <div className={"w-full h-2 mt-auto " + key.color}></div>
                )}
              </button>
            ))}
          </div>

          <button
            className="p-2 bg-blue-400 hover:bg-blue-600 cursor-pointer rounded-sm"
            onClick={() => setSelectedKeys([])}
          >
            Clear
          </button>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showKeyLines}
              onChange={(e) => setShowKeyLines(e.target.checked)}
            />

            <span>Show key lines</span>
          </label>

          <div>{selectedKeys.map((key) => key.name).join(", ")}</div>
        </div>
      </div>

      {normalizedFftMagnitudes && rowsCount && columnsCount && (
        <div className="flex">
          <div
            className={
              "flex flex-col border " +
              (isWhiteBackground ? "bg-white" : "bg-black")
            }
          >
            {new Array(rowsCount).fill(0).map((_, rowIndex) => (
              <div key={rowIndex} className="flex">
                {new Array(columnsCount).fill(0).map((_, columnIndex) => (
                  <div
                    key={columnIndex}
                    className={
                      " hover:outline " +
                      sizeClass +
                      " " +
                      (getSelectedFrequencyColorClass(
                        rowsCount - (1 + rowIndex),
                      ) ??
                        ((showKeyLines &&
                          getFrequencyColorClass(rowsCount - (1 + rowIndex))) ||
                          (isWhiteBackground ? "bg-black" : "bg-white")))
                      // getColorClass(
                      //   normalizedFftMagnitudes[columnIndex][
                      //     rowsCount - (1 + rowIndex)
                      //   ],
                      // )
                    }
                    style={{
                      opacity: isSelectedFrequency(rowsCount - (1 + rowIndex))
                        ? 1
                        : getMagnitudeCompressed(
                            normalizedFftMagnitudes[columnIndex][
                              rowsCount - (1 + rowIndex)
                            ],
                          ),
                    }}
                    title={getTitle(
                      normalizedFftMagnitudes[columnIndex][
                        rowsCount - (1 + rowIndex)
                      ],
                      rowsCount - (1 + rowIndex),
                    )}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* <Graph /> */}
    </div>
  );
}
