const DUMMY_QUESTION = {
  questionId: 1,
  name: "Number of Dice Rolls With Target Sum",
  difficulty: 2,
  content:
    '{"question":"You have n dice and each die has k faces numbered from 1 to k.\nGiven three integers n, k, and target, return the number of possible ways (out of the kn total ways) to roll the dice so the sum of the face-up numbers equals target. Since the answer may be too large, return it modulo 109 + 7.\n","example":["Input: n = 1, k = 6, target = 3\nOutput: 1\nExplanation: You throw one die with 6 faces.\nThere is only one way to get a sum of 3.\n","Input: n = 2, k = 6, target = 7\nOutput: 6\nExplanation: You throw two dice, each with 6 faces.\nThere are 6 ways to get a sum of 7: 1+6, 2+5, 3+4, 4+3, 5+2, 6+1.\n","Input: n = 30, k = 30, target = 500\nOutput: 222616187\nExplanation: The answer must be returned modulo 109 + 7.\n"],"constrains":["1 <= n, k <= 30","1 <= target <= 1000"]}',
  solution: "ok",
};

const DUMMY_HISTORY = [
  {
    attemptId: 123,
    language: "python",
    timestamp: 123,
    question: DUMMY_QUESTION,
    users: ["user 1"],
    submission:
      "abcdabcdadabcdaccdabcdabcdabcdabccdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd",
  },
  {
    attemptId: 123,
    language: "abcd",
    timestamp: 123,
    question: DUMMY_QUESTION,
    users: ["user 1", "user 2"],
    submission: "abcd",
  },
];

export { DUMMY_HISTORY, DUMMY_QUESTION };
