export type PinMedia = {
  url: string;
  type: string;
  name: string;
};

export type Pin = {
  coords: [number, number];
  placeName: string;
  media: PinMedia[];
  travels: number[]; // list of indexes of pins this pin has traveled to
};
