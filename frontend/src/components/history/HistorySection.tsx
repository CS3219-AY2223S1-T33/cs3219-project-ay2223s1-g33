import { Divider, Heading, VStack } from "@chakra-ui/react";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import CodeMirror from "@uiw/react-codemirror";
import React from "react";
import { Language } from "../../types/types";
import LoadingSection from "../ui/LoadingSection";

type Props = {
  submission: string | undefined;
  language: Language;
};

function HistorySection({ submission, language }: Props) {
  const lang: any = loadLanguage(language);

  return (
    <VStack spacing={4} pt={10}>
      <Heading as="h4" size="md">
        Code Submitted
      </Heading>
      <Divider />
      {submission ? (
        <CodeMirror
          value={submission}
          extensions={[lang]}
          style={{ overflowY: "auto", width: "100%", height: "70vh" }}
          editable={false}
        />
      ) : (
        <LoadingSection message="Loading Submission..." />
      )}
    </VStack>
  );
}

export default HistorySection;
