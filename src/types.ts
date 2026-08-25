export type Entry = {
  id: string;
  name: string;
  calories: number;
  createdAt: string;
};

export type AppData = {
  target: number;
  entries: Entry[];
};

export type Screen = 'home' | 'history' | 'settings';
