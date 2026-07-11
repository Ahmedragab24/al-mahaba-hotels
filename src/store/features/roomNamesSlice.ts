import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RoomNamesState {
  namesAr: string[];
  namesEn: string[];
}

const DEFAULT_NAMES_AR = [
  "غرفة مفردة",
  "غرفة مزدوجة",
  "غرفة ثلاثية",
  "غرفة رباعية",
  "جناح جونيور",
  "جناح تنفيذي",
  "جناح عائلي",
  "غرفة قياسية",
  "غرفة ديلوكس",
  "غرفة سوبيريور",
];

const DEFAULT_NAMES_EN = [
  "Single Room",
  "Double Room",
  "Triple Room",
  "Quadruple Room",
  "Junior Suite",
  "Executive Suite",
  "Family Suite",
  "Standard Room",
  "Deluxe Room",
  "Superior Room",
];

const loadFromLocalStorage = (key: string, defaults: string[]): string[] => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load room names from localStorage:", e);
  }
  return defaults;
};

const initialState: RoomNamesState = {
  namesAr: loadFromLocalStorage("room_names_ar", DEFAULT_NAMES_AR),
  namesEn: loadFromLocalStorage("room_names_en", DEFAULT_NAMES_EN),
};

export const roomNamesSlice = createSlice({
  name: "roomNames",
  initialState,
  reducers: {
    addRoomNameAr(state, action: PayloadAction<string>) {
      const name = action.payload.trim();
      if (name && !state.namesAr.includes(name)) {
        state.namesAr.push(name);
        try {
          localStorage.setItem("room_names_ar", JSON.stringify(state.namesAr));
        } catch (e) {
          console.error(e);
        }
      }
    },
    addRoomNameEn(state, action: PayloadAction<string>) {
      const name = action.payload.trim();
      if (name && !state.namesEn.includes(name)) {
        state.namesEn.push(name);
        try {
          localStorage.setItem("room_names_en", JSON.stringify(state.namesEn));
        } catch (e) {
          console.error(e);
        }
      }
    },
  },
});

export const { addRoomNameAr, addRoomNameEn } = roomNamesSlice.actions;
export default roomNamesSlice.reducer;
