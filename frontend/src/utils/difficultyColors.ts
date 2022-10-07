import { QuestionDifficulty } from "../proto/types";

function difficultyColor(difficulty: QuestionDifficulty) {
  switch (difficulty) {
    case QuestionDifficulty.EASY:
      return "green";
    case QuestionDifficulty.MEDIUM:
      return "orange";
    case QuestionDifficulty.HARD:
      return "red";
    default:
      return "black";
  }
}

export default difficultyColor;
