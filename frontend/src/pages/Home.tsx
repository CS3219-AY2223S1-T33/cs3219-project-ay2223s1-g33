import { Box, Grid, Heading } from "@chakra-ui/react";
import React from "react";
import { useSelector } from "react-redux";
import Navbar from "../components/ui/navbar/HomeNavbar";
import { RootState } from "../app/store";
import Countdown from "../components/matching/Countdown";
import QueueForm from "../components/form/QueueForm";
import HistoryTable from "../components/history/HistoryTable";

function Home() {
  const inQueue = useSelector((state: RootState) => state.matching.inQueue);
  const hiddenColumns: string[] = ["attemptId", "users"];
  return (
    <>
      <Navbar />
      <Grid
        templateColumns="70% 30%"
        gap={10}
        minW="70vw"
        maxW="85vw"
        mx="auto"
        my={16}
      >
        <Box>
          <Heading>Attempt History</Heading>
          <Box borderRadius="md" boxShadow="lg" p={8}>
            <HistoryTable hiddenColumns={hiddenColumns} />
          </Box>
        </Box>

        <Box>
          <Heading>Start Coding!</Heading>
          <Box borderRadius="md" boxShadow="lg" p={8}>
            {inQueue ? <Countdown /> : <QueueForm />}
          </Box>
        </Box>
      </Grid>
    </>
  );
}

export default Home;
