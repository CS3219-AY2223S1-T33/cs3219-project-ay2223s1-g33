import { Flex, Button, Text, useDisclosure, Box, Grid } from "@chakra-ui/react";
import * as Y from "yjs";
import { useNavigate } from "react-router-dom";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { WebsocketProvider } from "y-websocket-peerprep";
import { DownloadIcon } from "@chakra-ui/icons";
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
import { Language } from "../types";
import { Question } from "../proto/types";
import saveFile from "../utils/fileDownloadUtil";

type Status = { status: "disconnected" | "connecting" | "connected" };
type Nickname = { nickname: string };
type ErrorMessage = { errorMsg: string };

let isInit = false;
function Session() {
  const roomToken = useSelector((state: RootState) => state.matching.roomToken);
  const nickname = useSelector(selectUser)?.nickname;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    isOpen: isLeaveModalOpen,
    onOpen: onOpenLeaveModal,
    onClose: onCloseLeaveModal,
  } = useDisclosure();
  const {
    isOpen: isDisconnectModalOpen,
    onOpen: onOpenDisconnectModal,
    onClose: onCloseDisconnectModal,
  } = useDisclosure();
  const toast = useFixedToast();

  // YJS Settings
  const [yDoc, setYDoc] = useState<Y.Doc>();
  const [provider, setProvider] = useState<WebsocketProvider>();
  const [yText, setYText] = useState<Y.Text>();
  const [undoManager, setundoManager] = useState<Y.UndoManager>();

  const [wsStatus, setWsStatus] = useState("Not Connected");
  const [selectedLang, setSelectedLang] = useState<Language>("javascript");
  const [question, setQuestion] = useState<Question | undefined>();

  const [code, setCode] = useState("");

  useEffect(() => {
    /** Helper function to configure websocket with yDoc and custom events. */
    const buildWSProvider = (yd: Y.Doc, params: { [x: string]: string }) => {
      // First 2 params builds the room session: ws://localhost:5001/ + ws
      const ws = new WebsocketProvider(
        `ws://${window.location.host}/api/`,
        "roomws",
        yd,
        { params, disableBc: true }
      );

      ws.on("status", (joinStatus: Status) => {
        const { status } = joinStatus;
        switch (status) {
          case "connected":
            setWsStatus("Connected");
            break;
          case "connecting":
            if (wsStatus !== "Disconnected") {
              return;
            }
            setWsStatus("Connecting");
            break;
          default:
            setWsStatus("Disconnected");
            onOpenDisconnectModal();
            break;
        }
      });

      // eslint-disable-next-line
      ws.on("terminate_with_error", (error: ErrorMessage) => {
        setWsStatus("Disconnected");
        onOpenDisconnectModal();
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
        setSelectedLang(language);
      });

      ws.on("question_get", (q: { question: string }) => {
        const questionObj: Question = Question.fromJsonString(q.question);
        toast.sendInfoMessage("Question loaded");
        setQuestion(questionObj);
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
    setSelectedLang(newLang as Language);
  };

  const leaveSessionHandler = () => {
    provider?.destroy();
    yDoc?.destroy();
    // Clears the room session token
    dispatch(leaveRoom());

    // Just in case when use joins a brand new session
    isInit = false;
    navigate("/");
  };

  const updateCodeHandler = (value: string) => {
    setCode(value);
  };

  const downloadCodeHandler = () => {
    toast.sendInfoMessage("Downloading file...", { duration: 3000 });
    saveFile(code, selectedLang);
  };

  const getQuestionHandler = () => {
    if (!provider) {
      return;
    }

    provider.sendQuestionRequest();
  };

  if (!roomToken || !nickname) {
    return <InvalidSession leaveSessionHandler={leaveSessionHandler} />;
  }

  // Ensures that the yDoc components are ready before passing to Editor
  const collabDefined = yText && provider && undoManager;

  return (
    <>
      {/* Navbar for session */}
      <SessionNavbar onOpen={onOpenLeaveModal} status={wsStatus} />

      <Grid templateColumns="1fr 2fr" mx="auto">
        <EditorTabs question={question} getQuestion={getQuestionHandler} />
        {/* Code Editor */}
        <Grid templateRows="10% 7fr auto" h="91vh">
          {/* Code Editor Settings */}
          <Flex
            direction="row"
            alignItems="center"
            bg="gray.100"
            px={12}
            py={2}
          >
            <EditorLanguage
              selectedLang={selectedLang}
              isDisabled={wsStatus !== "Connected"}
              changeLangHandler={changeLangHandler}
            />
            {/* Other Quality of life options */}
            <Button leftIcon={<DownloadIcon />} onClick={downloadCodeHandler}>
              Save code
            </Button>
          </Flex>

          {/* Editor */}
          {collabDefined && (
            <Editor
              yText={yText}
              provider={provider}
              undoManager={undoManager}
              nickname={nickname}
              selectedLang={selectedLang}
              onCodeUpdate={updateCodeHandler}
            />
          )}
          {/* Test case window */}
          <Grid templateRows="1fr 3fr 1fr">
            <Text fontSize="lg">Testcases</Text>
            <Box>Content</Box>
            <Flex direction="row-reverse" px={12} pb={4}>
              <Button onClick={() => console.log("WIP")}>Submit code</Button>
            </Flex>
          </Grid>
        </Grid>
      </Grid>

      {/* Modals */}
      <LeaveModal
        isOpen={isLeaveModalOpen}
        onClose={onCloseLeaveModal}
        leaveSessionHandler={leaveSessionHandler}
      />
      <DisconnectModal
        isOpen={isDisconnectModalOpen}
        onClose={onCloseDisconnectModal}
        leaveSessionHandler={leaveSessionHandler}
      />
    </>
  );
}

export default Session;
