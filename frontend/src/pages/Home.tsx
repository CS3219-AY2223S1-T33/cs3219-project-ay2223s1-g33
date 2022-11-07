import { Box, Grid, GridItem, Heading } from "@chakra-ui/react";
import React from "react";
import { useSelector } from "react-redux";
import Navbar from "../components/ui/navbar/HomeNavbar";
import { RootState } from "../app/store";
import Countdown from "../components/matching/Countdown";
import QueueForm from "../components/form/QueueForm";
import HistoryTable from "../components/history/HistoryTable";

const SMALL_AREA = `"queue" "question"`;
const DEFAULT_AREA = `"question queue"`;

function Home() {
  const inQueue = useSelector((state: RootState) => state.matching.inQueue);
  const hiddenColumns: string[] = ["attemptId", "users"];
  return (
    <>
      <Navbar />
      <Grid
        templateAreas={{ base: SMALL_AREA, lg: DEFAULT_AREA }}
        templateRows={{ lg: "100%" }}
        templateColumns={{ base: "1fr", lg: "75% 25%" }}
        gap={10}
        w={{ base: "95vw", lg: "90vw" }}
        mx="auto"
        my={16}
      >
        <GridItem area="question">
          <Heading>Attempt History</Heading>
          <Box borderRadius="md" boxShadow="lg" p={8}>
            <HistoryTable hiddenColumns={hiddenColumns} />
          </Box>
        </GridItem>

        <GridItem area="queue">
          <Heading>Start Coding!</Heading>
          <Box borderRadius="md" boxShadow="lg" p={8}>
            {inQueue ? <Countdown /> : <QueueForm />}
          </Box>
        </GridItem>
      </Grid>
    </>
  );
}

export default Home;
