import { Note, notes } from "@/src/utils/audio/notes";

export default function Piano({
  selectedNotes,
  showKeyColors,
  onSelectedNotesChange,
  onShowKeyColorsChange,
}: {
  selectedNotes: Note[];
  showKeyColors: boolean;
  onSelectedNotesChange: (newSelectedNotes: Note[]) => void;
  onShowKeyColorsChange: (showKeyColors: boolean) => void;
}) {
  function toggleNote(note: Note) {
    const isSelected = selectedNotes.some((k) => k.name === note.name);

    if (isSelected) {
      onSelectedNotesChange(selectedNotes.filter((k) => k.name !== note.name));
    } else {
      onSelectedNotesChange([...selectedNotes, note]);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="grid grid-rows-2 grid-cols-[repeat(14,1fr)] w-64 h-32">
        {notes.map((note) => (
          <button
            key={note.name}
            title={note.name + " " + note.frequencies.join(" ")}
            style={{ gridRow: note.row, gridColumnStart: note.colStart }}
            className={
              "col-span-2 border flex flex-col items-center justify-center cursor-pointer " +
              (selectedNotes.some((k) => k.name === note.name)
                ? note.color + " border-white"
                : note.row === 1
                  ? "border-white text-white bg-black hover:bg-neutral-700"
                  : "bg-white hover:bg-neutral-200")
            }
            onClick={() => toggleNote(note)}
          >
            <div>{note.name}</div>

            {showKeyColors && (
              <div className={"w-full h-2 mt-auto " + note.color}></div>
            )}
          </button>
        ))}
      </div>

      <button
        className="p-2 bg-blue-400 hover:bg-blue-600 cursor-pointer rounded-sm"
        onClick={() => onSelectedNotesChange([])}
      >
        Clear
      </button>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={showKeyColors}
          onChange={(e) => onShowKeyColorsChange(e.target.checked)}
        />

        <span>Show note lines</span>
      </label>

      <div>{selectedNotes.map((note) => note.name).join(", ")}</div>
    </div>
  );
}
