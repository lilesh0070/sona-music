import { useState, useEffect } from "react";
import { storageService } from "../services/storageService";
export default function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => storageService.read(key, initial));
  useEffect(() => {
    storageService.write(key, value);
  }, [key, value]);
  return [value, setValue];
}
