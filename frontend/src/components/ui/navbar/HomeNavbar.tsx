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
  useDisclosure
} from "@chakra-ui/react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { reset } from "../../../feature/matching/matchingSlice";
import { logout, selectUser } from "../../../feature/user/userSlice";
import AccountSettingsModal from "../../modal/AccountSettingsModal";
import AuthAPI from "../../../api/auth";

function HomeNavbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const logoutHandler = () => {
    AuthAPI.logout().finally(() => {
      dispatch(reset());
      dispatch(logout());
      navigate("/login", { replace: true });
    });
  };

  const { isOpen, onOpen, onClose } = useDisclosure();

  const user = useSelector(selectUser);
  if (!user) {
    return null;
  }

  return (
    <>
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
                  <Text fontSize="xl">{`Hello, ${user.nickname}!`}</Text>
                </MenuButton>
                <MenuList alignItems="center">
                  <MenuItem onClick={onOpen}>Account Settings</MenuItem>
                  <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>
        </Flex>
      </Box>
      <AccountSettingsModal isOpen={isOpen} onClose={onClose} />
    </>
  );
}

export default HomeNavbar;
