import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  Table,
  TableContainer,
  Th,
  Thead,
  Tr,
  Text,
  Tbody,
  Td,
} from "@chakra-ui/react";
import React from "react";
import usePagination from "../utils/hooks/usePagination";

// Can be taken from proto
type GetPersonRequest = {
  offset: number;
  limit: number;
};

type Person = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

type GetPersonResponse = {
  errorMsg: string;
  total: number;
  persons: Person[];
};

// Only thing to define
type ExtractedResponse = {
  items: Person[];
  total: number;
};

function requestFactory(offset: number, limit: number): GetPersonRequest {
  return { offset, limit };
}

function responseExtractor(data: GetPersonResponse): ExtractedResponse {
  const { errorMsg } = data;
  if (errorMsg !== "") {
    throw new Error(errorMsg);
  }

  const { persons, total } = data;
  return { items: persons, total };
}

function Test() {
  const pagination = usePagination<Person, GetPersonRequest, GetPersonResponse>(
    {
      fetchUrl: "http://localhost:4000/v2/getPersons",
      requestFactory,
      responseExtractor,
    }
  );

  return (
    <>
      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>First Name</Th>
              <Th>Last Name</Th>
              <Th>Email</Th>
            </Tr>
          </Thead>
          <Tbody>
            {pagination.items.map((item) => (
              <Tr>
                <Td>{item.id}</Td>
                <Td>{item.firstName}</Td>
                <Td>{item.lastName}</Td>
                <Td>{item.email}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <Flex w="100%">
        <Button
          leftIcon={<ArrowLeftIcon />}
          isDisabled={!pagination.hasPrevious}
          onClick={pagination.previousPage}
        >
          Previous
        </Button>
        <Text>{pagination.page}</Text>
        <Button
          rightIcon={<ArrowRightIcon />}
          isDisabled={!pagination.hasNext}
          onClick={pagination.nextPage}
        >
          Next
        </Button>
      </Flex>
    </>
  );
}

export default Test;
