import { Note, notes } from "@/src/utils/audio/notes";
import {
  ComplexNumber,
  getMagnitude,
} from "@/src/utils/fourierTransform/complexNumbers";
import { useMemo } from "react";
import { Size } from "./Settings";

export default function Graph({
  frequencies,
  sampleRate,
  croppedFftRows,
  cellSize,
  isWhiteBackground,
  hasCompression,
  compression,
  showKeyLines,
  selectedNotes,
}: {
  frequencies: ComplexNumber[][];
  sampleRate: number;
  croppedFftRows: number;
  cellSize: Size;
  isWhiteBackground: boolean;
  hasCompression: boolean;
  compression: number;
  showKeyLines: boolean;
  selectedNotes: Note[];
}) {
  const normalizedFftMagnitudes = useMemo(() => {
    const croppedFft = frequencies.map((block) =>
      block.slice(0, croppedFftRows),
    );

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
  }, [frequencies, croppedFftRows]);

  const columnsCount = useMemo(
    () => normalizedFftMagnitudes?.length,
    [normalizedFftMagnitudes],
  );

  const rowsCount = useMemo(
    () => normalizedFftMagnitudes?.[0]?.length,
    [normalizedFftMagnitudes],
  );

  const sizeClass = useMemo(() => {
    const sizeClasses: Record<Size, string> = {
      sm: "size-0.5",
      md: "size-1",
      lg: "size-2",
      xl: "size-4",
    };

    return sizeClasses[cellSize];
  }, [cellSize]);

  /** @param rowIndex Index of the row starting from the lowest frequency */
  function getFrequencies(rowIndex: number) {
    const maxFrequency = sampleRate;

    const containers = frequencies[0].length;

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

  function getColorClass(magnitude: number) {
    const colorsCount = colors.length;

    const compressedMagnitude = getMagnitudeCompressed(magnitude);

    const colorIndex = Math.floor(compressedMagnitude * colorsCount);

    return colors[colorIndex] ?? colors[colors.length - 1];
  }

  const _colors = [
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

  const colors = isWhiteBackground ? _colors : _colors.toReversed();

  function getMagnitudeCompressed(magnitude: number) {
    return hasCompression
      ? Math.log1p(compression * magnitude) / Math.log1p(compression)
      : magnitude;
  }

  function getFrequencyNote(rowIndex: number) {
    const frequencies = getFrequencies(rowIndex);

    if (!frequencies) {
      return;
    }

    return notes.find((note) =>
      note.frequencies.some(
        (frequency) =>
          frequencies.low <= frequency && frequency <= frequencies.high,
      ),
    );
  }

  function getFrequencyColorClass(rowIndex: number) {
    return getFrequencyNote(rowIndex)?.color;
  }

  function isSelectedNote(note?: Note) {
    return selectedNotes.some((k) => k.name === note?.name);
  }

  function getSelectedFrequencyColorClass(rowIndex: number) {
    const note = getFrequencyNote(rowIndex);

    if (isSelectedNote(note)) {
      return note?.color;
    }
  }

  function isSelectedFrequency(rowIndex: number) {
    const note = getFrequencyNote(rowIndex);

    return isSelectedNote(note);
  }

  return (
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
                  (getSelectedFrequencyColorClass(rowsCount - (1 + rowIndex)) ??
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
  );
}
