import { Box, Grid, Heading } from "@chakra-ui/react";
import React from "react";
import { useSelector } from "react-redux";
// import QueueForm from "../components/form/QueueForm";
import Navbar from "../components/ui/navbar/HomeNavbar";
import { RootState } from "../app/store";
import Countdown from "../components/matching/Countdown";
import TempQueueForm from "../components/form/TempQueueForm";

function Home() {
  const inQueue = useSelector((state: RootState) => state.matching.inQueue);

  return (
    <>
      <Navbar />
      {/* Expected Responsive problems to happen here */}
      <Grid
        templateColumns="2fr 1fr"
        gap={10}
        minW="65vw"
        maxW="80vw"
        mx="auto"
        my={16}
      >
        <Box>
          <Heading>Attempt History</Heading>
          <Box borderRadius="md" boxShadow="lg" p={8}>
            This space will be used for user history or a list of problems
          </Box>
        </Box>

        <Box>
          <Heading>Start Coding!</Heading>
          <Box borderRadius="md" boxShadow="lg" p={8}>
            {/* {inQueue ? <Countdown /> : <QueueForm />} */}
            {inQueue ? <Countdown /> : <TempQueueForm />}
          </Box>
        </Box>
      </Grid>
    </>
  );
}

export default Home;
