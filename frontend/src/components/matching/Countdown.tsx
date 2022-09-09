import { Button, Stack, Text, useBoolean } from "@chakra-ui/react";
import { useDispatch } from "react-redux";
import React from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { leaveQueue } from "../../feature/matching/matchingSlice";
import CountdownText from "./CountdownText";

function Countdown() {
  const dispatch = useDispatch();
  const [isPlaying, setIsPlaying] = useBoolean(true);

  // Cleanup function for leaving the queue (may extend for specific scenarios: timeout, matched)
  const leaveQueueHandler = () => {
    // API call to leave queue, may require some information from the redux store
    console.log("Call API to leave the queue");
    setIsPlaying.off();
    dispatch(leaveQueue());
  };

  const completeTimeHandler = () => {
    console.log(`Times up. Leaving queue.`);
    leaveQueueHandler();
  };

  const updateTimeHandler = () => {
    console.log(`API update call made`);
    // Random number generator to simulate matching
    const r = Math.random() * 100;
    if (r > 85) {
      console.log("Found buddy");
      leaveQueueHandler();
      // This line will eventually be replaced by navigate().
      console.log("Move to room");
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
