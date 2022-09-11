import { Button, Stack, Text, useBoolean } from "@chakra-ui/react";
import { useDispatch } from "react-redux";
import React from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useNavigate } from "react-router-dom";
import { leaveQueue } from "../../feature/matching/matchingSlice";
import CountdownText from "./CountdownText";

// ! console.log() s ar e intentionally left here for backend implementation
function Countdown() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isPlaying, setIsPlaying] = useBoolean(true);

  // Cleanup function for leaving the queue (may be extended for specific scenarios: timeout, matched)
  const leaveQueueHandler = () => {
    // TODO API call to leave queue, may require some information from the redux store
    console.log("Call API to leave the queue");
    setIsPlaying.off();
    dispatch(leaveQueue());
  };

  const completeTimeHandler = () => {
    console.log(`Times up. Leaving queue.`);
    leaveQueueHandler();
  };

  const updateTimeHandler = (remainingTime: number) => {
    // Prevents t=0 redirect.
    if (remainingTime === 30) {
      return;
    }

    console.log(`API update call made`);
    // Random number generator to simulate matching
    const r = Math.random() * 100;
    if (r > 85) {
      console.log("Found buddy");
      leaveQueueHandler();
      // TODO Integration with the backend
      navigate("/session/df22c77e-312b-4edf-8b52-b78425572506");
    }
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
      <Button colorScheme="red" onClick={leaveQueueHandler}>
        Leave Queue
      </Button>
    </Stack>
  );
}

export default Countdown;
