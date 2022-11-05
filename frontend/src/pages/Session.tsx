import { Flex, Button, useDisclosure, Grid, Box } from "@chakra-ui/react";
import * as Y from "yjs";
import { useNavigate } from "react-router-dom";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { WebsocketProvider } from "y-websocket-peerprep";
import { DownloadIcon } from "@chakra-ui/icons";
import CodeExecution from "../components/editor/CodeExecution";
import EditorLanguage from "../components/editor/EditorLanguage";
import LeaveModal from "../components/modal/LeaveModal";
import DisconnectModal from "../components/modal/DisconnectModal";
import InvalidSession from "./InvalidSession";
import { RootState } from "../app/store";
import EditorTabs from "../components/editor/EditorTabs";
import { leaveRoom } from "../feature/matching/matchingSlice";
import SessionNavbar from "../components/ui/navbar/SessionNavbar";
import Editor from "../components/editor/Editor";
import useFixedToast from "../utils/hooks/useFixedToast";
import { selectUser } from "../feature/user/userSlice";
import { Chat, Language } from "../types/types";
import { Question } from "../proto/types";
import saveFile from "../utils/fileDownloadUtil";
import {
  addMessage,
  changeEditorLocked,
  changeIsCompleted,
  changeLanguage,
  changeWSStatus,
  reset,
  setExecution,
  setQuestion,
} from "../feature/session/sessionSlice";
import FontSizeSelector from "../components/editor/FontSizeSelector";

type Status = { status: "disconnected" | "connecting" | "connected" };
type Nickname = { nickname: string };
type ErrorMessage = { errorMsg: string };
type QuestionMessage = { question: string; isCompleted: boolean };

let isInit = false;
function Session() {
  const roomToken = useSelector((state: RootState) => state.matching.roomToken);
  const nickname = useSelector(selectUser)?.nickname;
  const { wsStatus, selectedLang } = useSelector(
    (state: RootState) => state.session
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const leaveModalDisclosure = useDisclosure();
  const disconnectModalDisclosure = useDisclosure();
  const toast = useFixedToast();

  // YJS Settings
  const [yDoc, setYDoc] = useState<Y.Doc>();
  const [provider, setProvider] = useState<WebsocketProvider>();
  const [yText, setYText] = useState<Y.Text>();
  const [undoManager, setundoManager] = useState<Y.UndoManager>();

  const [code, setCode] = useState("");

  useEffect(() => {
    /** Helper function to configure websocket with yDoc and custom events. */
    const buildWSProvider = (yd: Y.Doc, params: { [x: string]: string }) => {
      // First 2 params builds the room session: ws://localhost:5001/ + ws
      const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
      const ws = new WebsocketProvider(
        `${wsProtocol}://${window.location.host}/api/`,
        "roomws",
        yd,
        {
          params,
          disableBc: true,
        }
      );

      ws.on("status", (joinStatus: Status) => {
        const { status } = joinStatus;
        switch (status) {
          case "connected":
            dispatch(changeWSStatus({ status: "Connected" }));
            break;
          case "connecting":
            if (wsStatus !== "Disconnected") {
              return;
            }
            dispatch(changeWSStatus({ status: "Connecting" }));
            break;
          default:
            dispatch(changeWSStatus({ status: "Disconnected" }));
            disconnectModalDisclosure.onOpen();
            break;
        }
      });

      // eslint-disable-next-line
      ws.on("terminate_with_error", (error: ErrorMessage) => {
        dispatch(changeWSStatus({ status: "Disconnected" }));
        disconnectModalDisclosure.onOpen();
      });

      ws.on("user_join", (joinedNickname: Nickname) => {
        toast.sendSuccessMessage("", {
          title: `${joinedNickname.nickname} has joined the room!`,
        });
      });

      ws.on("user_leave", (leftNickname: Nickname) => {
        toast.sendAlertMessage("", {
          title: `${leftNickname.nickname} has left the room.`,
        });
      });

      ws.on("lang_change", (languageChange: { language: Language }) => {
        const { language } = languageChange;
        dispatch(changeLanguage({ lang: language }));
      });

      ws.on("question_get", (q: QuestionMessage) => {
        const { question: qStr, isCompleted: ic } = q;
        const questionObj: Question = Question.fromJsonString(qStr);
        dispatch(setQuestion({ question: questionObj }));
        dispatch(changeIsCompleted({ isComplete: ic }));
        toast.sendInfoMessage("Question loaded");
      });

      ws.on("savecode_send", () => {
        toast.sendInfoMessage("Your partner is saving this attempt");
        dispatch(changeEditorLocked({ editorLocked: true }));
      });

      ws.on("savecode_ack", (e: ErrorMessage) => {
        const { errorMsg } = e;
        if (errorMsg === "") {
          toast.sendInfoMessage("Code saved");
        } else {
          toast.sendErrorMessage(errorMsg);
        }
        dispatch(changeEditorLocked({ editorLocked: false }));
      });

      ws.on("message_receive", (e: Chat) => {
        dispatch(addMessage(e));
      });

      ws.on("execute_pending", () => {
        dispatch(setExecution({ executing: true }));
      });

      ws.on("execute_complete", (o: { output: string }) => {
        const { output } = o;
        dispatch(setExecution({ executing: false, output }));
      });

      return ws;
    };

    if (!isInit) {
      // Yjs initialisation
      const tempyDoc = new Y.Doc();
      const params: { [x: string]: string } = {
        room: roomToken === undefined ? "" : roomToken,
      };

      const tempprovider = buildWSProvider(tempyDoc, params);
      const tempyText = tempyDoc.getText("codemirror");
      const tempundoManager = new Y.UndoManager(tempyText);

      // Sets the initialised values to the react state
      setYDoc(tempyDoc);
      setProvider(tempprovider);
      setYText(tempyText);
      setundoManager(tempundoManager);
      isInit = true;
    }

    return () => {};
  }, []);

  const changeLangHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    provider?.sendLanguageChange(newLang);
    dispatch(changeLanguage({ lang: newLang as Language }));
  };

  const leaveSessionHandler = () => {
    provider?.destroy();
    yDoc?.destroy();
    // Clears the room session token
    dispatch(leaveRoom());
    dispatch(reset());

    // Just in case when use joins a brand new session
    isInit = false;
    navigate("/");
  };

  const updateCodeHandler = (value: string) => {
    setCode(value);
  };

  const downloadCodeHandler = () => {
    toast.sendInfoMessage("Downloading file...");
    saveFile(code, selectedLang);
  };

  const getQuestionHandler = () => {
    if (!provider) {
      return;
    }

    provider.sendQuestionRequest();
  };

  const sendCodeSnapshotHandler = () => {
    if (!provider) {
      return;
    }

    toast.sendInfoMessage("Saving code");
    dispatch(changeEditorLocked({ editorLocked: true }));
    provider.sendCodeSnapshot(code, selectedLang);
  };

  const executeCodeHandler = () => {
    if (!provider) {
      return;
    }

    provider.sendExecutionRequest(code, selectedLang);
    dispatch(setExecution({ executing: true }));
  };

  if (!roomToken || !nickname) {
    return <InvalidSession leaveSessionHandler={leaveSessionHandler} />;
  }

  const sendTextMessageHandler = (content: string) => {
    if (!provider) {
      return;
    }

    provider.sendTextMessage(nickname, content);
  };

  // Ensures that the yDoc components are ready before passing to Editor
  const collabDefined = yText && provider && undoManager;

  return (
    <>
      {/* Navbar for session */}
      <SessionNavbar onOpen={leaveModalDisclosure.onOpen} status={wsStatus} />

      <Grid templateColumns="1fr 2fr" mx="auto">
        <EditorTabs
          getQuestion={getQuestionHandler}
          sendTextMessage={sendTextMessageHandler}
        />
        {/* Code Editor */}
        <Grid templateRows="10% 7fr 30%" h="91vh">
          {/* Code Editor Settings */}
          <Box bg="gray.100" px={12} py={2} w="100%">
            <Flex
              direction="row"
              justifyContent="center"
              alignItems="center"
              w="75%"
              mx="auto"
            >
              <EditorLanguage changeLangHandler={changeLangHandler} />
              <FontSizeSelector />

              {/* Other Quality of life options */}
              <Button
                leftIcon={<DownloadIcon />}
                onClick={downloadCodeHandler}
                w="40%"
              >
                Download code
              </Button>
            </Flex>
          </Box>

          {/* Editor */}
          {collabDefined && (
            <Editor
              yText={yText}
              provider={provider}
              undoManager={undoManager}
              nickname={nickname}
              onCodeUpdate={updateCodeHandler}
            />
          )}

          {/* Code Execution window */}
          <CodeExecution
            executeCodeHandler={executeCodeHandler}
            sendCodeSnapshotHandler={sendCodeSnapshotHandler}
          />
        </Grid>
      </Grid>

      {/* Modals */}
      <LeaveModal
        isOpen={leaveModalDisclosure.isOpen}
        onClose={leaveModalDisclosure.onClose}
        leaveSessionHandler={leaveSessionHandler}
      />
      <DisconnectModal
        isOpen={disconnectModalDisclosure.isOpen}
        onClose={disconnectModalDisclosure.onClose}
        leaveSessionHandler={leaveSessionHandler}
      />
    </>
  );
}

export default Session;
