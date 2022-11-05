import FileSaver from "file-saver";
import { Language } from "../types/types";

const getFileExtension = (lang: Language) => {
  switch (lang) {
    case "go":
    case "java":
      return lang;
    case "python":
      return "py";
    case "javascript":
      return "js";
    // Convert to a text file
    default:
      return "txt";
  }
};

const saveFile = (code: string, lang: Language) => {
  const ext = getFileExtension(lang);
  const fileName = `peerPrep.${ext}`;
  const blob = new Blob([code]);
  FileSaver.saveAs(blob, fileName);
};

export default saveFile;
