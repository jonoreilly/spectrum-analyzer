export type Note = {
  row: number;
  colStart: number;
  name: string;
  frequencies: number[];
  color: string;
};

export const notes: Note[] = [
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
