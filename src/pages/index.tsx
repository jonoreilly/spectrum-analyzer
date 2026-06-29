import { useRef, useState } from "react";
import { decodeAudioFile } from "@/src/utils/audio";
import { doFft } from "@/src/utils/fourierTransform";
import { Note } from "@/src/utils/audio/notes";
import Settings, { Size } from "@/src/components/Settings";
import Piano from "@/src/components/Piano";
import Graph from "@/src/components/Graph";

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

  async function onFileChange(newFile?: File) {
    const fileId = ++fileIdRef.current;

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

  const [cellSize, setCellSize] = useState<Size>("sm");

  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);

  const [showKeyLines, setShowKeyLines] = useState(false);

  const croppedFftRows = 250;

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
        />

        <Piano
          selectedNotes={selectedNotes}
          showKeyColors={showKeyLines}
          onSelectedNotesChange={setSelectedNotes}
          onShowKeyColorsChange={setShowKeyLines}
        />
      </div>

      {fft.status === "success" && audioBuffer.status === "success" && (
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
        />
      )}
    </div>
  );
}
