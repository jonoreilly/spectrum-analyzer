import { useMemo, useRef, useState } from "react";
import { decodeAudioFile, setMicrophoneListener } from "@/src/utils/audio";
import { doFft } from "@/src/utils/fourierTransform";
import { Note, notes } from "@/src/utils/audio/notes";
import Settings, { Size } from "@/src/components/Settings";
import Piano from "@/src/components/Piano";
import Graph from "@/src/components/Graph";
import { nextFrame } from "@/src/utils/react";
import { Result } from "@/src/utils/utils";
import { ComplexNumber } from "@/src/utils/fourierTransform/complexNumbers";

export default function Home() {
  const [file, setFile] = useState<Result<File>>({ status: "initial" });

  const [audioBuffer, setAudioBuffer] = useState<
    Result<AudioBuffer, "unsupported-file-type" | "no-audio-context">
  >({ status: "initial" });

  const [fft, setFft] = useState<Result<ComplexNumber[][]>>({
    status: "initial",
  });

  const fileIdRef = useRef(0);

  async function onFileChange(newFile?: File) {
    if (!newFile) {
      setFile({ status: "initial" });

      setAudioBuffer({ status: "initial" });

      setFft({ status: "initial" });

      return;
    }

    setFile({ status: "pending" });

    setAudioBuffer({ status: "pending" });

    setFft({ status: "pending" });

    // File

    const fileId = ++fileIdRef.current;

    setFile({ status: "success", value: newFile });

    // Decode audio file

    await nextFrame();

    const newAudioBuffer = await decodeAudioFile(newFile);

    if (fileId !== fileIdRef.current) return;

    setAudioBuffer(newAudioBuffer);

    if (newAudioBuffer.status !== "success") {
      setFft({ status: "initial" });

      return;
    }

    // Do FFT

    await nextFrame();

    const samples = [...newAudioBuffer.value.getChannelData(0)];

    const newFft = doFft(samples);

    if (fileId !== fileIdRef.current) return;

    setFft(newFft);
  }

  const [samples, setSamples] = useState<number[]>([]);

  async function onUseMicrophone() {
    ++fileIdRef.current;

    setFile({ status: "initial" });

    setAudioBuffer({ status: "pending" });

    setFft({ status: "pending" });

    const allData: number[] = [];

    setMicrophoneListener((data) => {
      allData.push(...data);
      setSamples([...allData]);
    });
  }

  const [isWhiteBackground, setIsWhiteBackground] = useState(true);

  const [hasCompression, setHasCompression] = useState(true);

  const [compression, setCompression] = useState(10);

  const [cellSize, setCellSize] = useState<Size>("sm");

  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);

  const [showKeyLines, setShowKeyLines] = useState(false);

  const croppedFftRows = 250;

  const [hoveredCell, setHoveredCell] = useState<{
    column: number;
    frequencies: {
      low: number;
      high: number;
    };
    magnitude: number;
  }>();

  const hoveredNote = useMemo(() => {
    if (!hoveredCell) {
      return;
    }

    return notes.find((note) =>
      note.frequencies.some(
        (frequency) =>
          hoveredCell.frequencies.low <= frequency &&
          frequency <= hoveredCell.frequencies.high,
      ),
    );
  }, [hoveredCell]);

  return (
    <div>
      <div className="flex gap-2">
        <Settings
          file={file}
          audioBuffer={audioBuffer}
          fft={fft}
          croppedFftRows={croppedFftRows}
          isWhiteBackground={isWhiteBackground}
          hasCompression={hasCompression}
          compression={compression}
          cellSize={cellSize}
          onFileChange={onFileChange}
          onIsWhiteBackgroundChange={setIsWhiteBackground}
          onHasCompressionChange={setHasCompression}
          onCompressionChange={setCompression}
          onCellSizeChange={setCellSize}
          onUseMicrophone={onUseMicrophone}
        />

        <div>samples: {samples.length}</div>

        <Piano
          selectedNotes={selectedNotes}
          showKeyColors={showKeyLines}
          onSelectedNotesChange={setSelectedNotes}
          onShowKeyColorsChange={setShowKeyLines}
        />
      </div>

      {fft.status === "success" && audioBuffer.status === "success" && (
        <div className="flex">
          <Graph
            frequencies={fft.value}
            sampleRate={audioBuffer.value.sampleRate}
            croppedFftRows={croppedFftRows}
            cellSize={cellSize}
            isWhiteBackground={isWhiteBackground}
            hasCompression={hasCompression}
            compression={compression}
            showKeyLines={showKeyLines}
            selectedNotes={selectedNotes}
            onCellHover={setHoveredCell}
          />

          <div>
            <div>
              <div>Column: {hoveredCell?.column}</div>

              <div>
                Frequencies: {Math.floor(hoveredCell?.frequencies.low ?? 0)}Hz -{" "}
                {Math.floor(hoveredCell?.frequencies.high ?? 0)}Hz
              </div>

              <div>
                Magnitude: {(hoveredCell?.magnitude ?? 0 * 100).toFixed(2)} %
              </div>

              {hoveredNote && (
                <div className={"text-xl p-2 rounded-sm " + hoveredNote.color}>
                  {hoveredNote.name}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
