import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import React from "react";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, selectUser } from "../../../feature/user/userSlice";
import { LogoutResponse } from "../../../proto/user-bff-service";

function HomeNavbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // eslint-disable-next-line
  const [cookies, setCookies, removeCookies] = useCookies(["session_token"]);

  const logoutHandler = () => {
    // removeCookies("session_token");
    axios
      .post<LogoutResponse>("/api/user/logout", {}, { withCredentials: true })
      .then((res) => {
        const { errorCode, errorMessage } = res.data;
        if (errorCode) {
          throw new Error(errorMessage);
        }
      })
      .catch((err) => {
        console.error(err.message);
      })
      .finally(() => {
        dispatch(logout());
        navigate("/login", { replace: true });
      });
  };

  const user = useSelector(selectUser);
  if (!user) {
    return null;
  }

  return (
    <Box bg="gray.100" px={12} py={2}>
      <Flex alignItems="center" justifyContent="space-between" h={16}>
        {/* Future: Logo goes here */}
        <Box>
          <Heading>PeerPrep</Heading>
        </Box>

        <Flex alignItems="center">
          <HStack spacing={7}>
            {/* TODO Placeholder icon for dark mode in future */}
            {/* <MoonIcon /> */}

            <Menu>
              <MenuButton as={Button} variant="ghost" cursor="pointer">
                <Text fontSize="lg">{`Hello, ${user.nickname}!`}</Text>
              </MenuButton>
              <MenuList alignItems="center">
                <MenuItem>Account Settings</MenuItem>
                <MenuItem onClick={logoutHandler}>Logout</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Flex>
    </Box>
  );
}

export default HomeNavbar;
