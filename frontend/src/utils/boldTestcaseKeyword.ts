const testcaseKeyword = ["Input:", "Output:", "Explanation"];

function boldTestcaseKeyword(input: string) {
  let keyword = "";
  let lnContent = "";
  for (let i = 0; i < testcaseKeyword.length; i += 1) {
    if (input.includes(testcaseKeyword[i])) {
      keyword = testcaseKeyword[i];
      lnContent = input.replace(testcaseKeyword[i], "");
    }
  }
  return {
    keyword,
    lnContent: lnContent === "" ? input : lnContent,
  };
}

export default boldTestcaseKeyword;
