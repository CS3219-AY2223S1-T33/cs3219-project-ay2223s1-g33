import { Button, Stack, Text, useBoolean } from "@chakra-ui/react";
import { useDispatch } from "react-redux";
import React from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useNavigate } from "react-router-dom";
import { enterRoom, leaveQueue } from "../../feature/matching/matchingSlice";
import CountdownText from "./CountdownText";
import { QueueStatus } from "../../proto/matching-service";
import useFixedToast from "../../utils/hooks/useFixedToast";
import MatchingAPI from "../../api/matching";

function Countdown() {
  const toast = useFixedToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isPlaying, setIsPlaying] = useBoolean(true);

  // Cleanup function for leaving the queue (may be extended for specific scenarios: timeout, matched)
  const leaveQueueHandler = () => {
    setIsPlaying.off();
    dispatch(leaveQueue());
  };

  const requestLeaveQueue = () => {
    MatchingAPI.leaveQueue()
      .catch((err) => {
        toast.sendErrorMessage(err.message);
      })
      .finally(() => {
        leaveQueueHandler();
      });
  };

  const completeTimeHandler = () => {
    leaveQueueHandler();
  };

  const updateTimeHandler = (remainingTime: number) => {
    // Prevents t=0 redirect.
    if (remainingTime === 30) {
      return;
    }

    MatchingAPI.checkQueueStatus()
      .then((res) => {
        const { queueStatus, roomToken } = res;

        switch (queueStatus) {
          case QueueStatus.PENDING:
            break;
          case QueueStatus.MATCHED:
            // Leave the queue and transit to session
            dispatch(enterRoom({ roomToken }));
            leaveQueueHandler();
            navigate("/session", { replace: true });
            break;
          case QueueStatus.EXPIRED:
            completeTimeHandler();
            break;
          default:
            throw new Error("Invalid queue status.");
        }
      })
      .catch((err) => {
        toast.sendErrorMessage(err.message);
      });
  };

  return (
    <Stack spacing={6} align="center">
      <Text fontWeight={600} fontSize="2xl">
        Finding a buddy....
      </Text>
      <CountdownCircleTimer
        isPlaying={isPlaying}
        duration={30}
        colors="#004777"
        onUpdate={updateTimeHandler}
        onComplete={completeTimeHandler}
      >
        {({ remainingTime }) => <CountdownText remainingTime={remainingTime} />}
      </CountdownCircleTimer>
      <Button colorScheme="red" onClick={requestLeaveQueue}>
        Leave Queue
      </Button>
    </Stack>
  );
}

export default Countdown;
