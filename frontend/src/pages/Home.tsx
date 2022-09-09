// import { Button, Heading } from "@chakra-ui/react";
// import { useCookies } from "react-cookie";
// import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
import { Box, Grid, Heading } from "@chakra-ui/react";
import React from "react";
// import { useSelector } from "react-redux";
// import QueueForm from "../components/form/QueueForm";
import Navbar from "../components/ui/Navbar";
// import { RootState } from "../app/store";
import Countdown from "../components/matching/Countdown";
// import { logout } from "../feature/user/userSlice";

function Home() {
  // This section of the code is left here first once the Navbar is fully implemented
  // const navigate = useNavigate();
  // const dispatch = useDispatch();
  // // eslint-disable-next-line
  // const [cookies, setCookies, removeCookies] = useCookies(["session_token"]);

  // const logoutHandler = () => {
  //   removeCookies("session_token");
  //   dispatch(logout());
  //   navigate("/login", { replace: true });
  // };

  // const inQueue = useSelector((state: RootState) => state.matching.inQueue);

  return (
    <>
      <Navbar />
      {/* Existing placeholder content */}
      {/* <Heading>Hello world!</Heading>
      <Button onClick={logoutHandler}>Log me out</Button> */}

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
            <Countdown />
          </Box>
        </Box>
      </Grid>
    </>
  );
}

export default Home;
