/* eslint react/destructuring-assignment: 0 */
/* eslint react/prop-types: 0 */
/* eslint react/no-unstable-nested-components: 0 */
import React, { useState } from "react";
import { useTable, Column, useSortBy } from "react-table";
import {
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  chakra,
  Code,
  Flex,
  useDisclosure,
  Button,
  TableContainer
} from "@chakra-ui/react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  TriangleDownIcon,
  TriangleUpIcon
} from "@chakra-ui/icons";
import { useSelector } from "react-redux";
import { HistoryAttempt, QuestionDifficulty } from "../../proto/types";
import HistoryAttemptModal from "../modal/HistoryAttemptModal";
import difficultyColor from "../../utils/diffcultyColors";
import usePagination from "../../utils/hooks/usePagination";
import { RootState } from "../../app/store";
import {
  createAttemptHistoryExtractor,
  createAttemptHistoryReqFactory
} from "../../utils/builderUtils";

type Props = {
  questionId?: number;
  hiddenColumns: string[];
};

function HistoryTable({ hiddenColumns, questionId = 0 }: Props) {
  const currUser = useSelector((state: RootState) => state.user.user);

  const pagination = usePagination({
    fetchUrl: "/api/user/history",
    requestFactory: createAttemptHistoryReqFactory(questionId),
    responseExtractor: createAttemptHistoryExtractor()
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalHistoryAttempt, setModalHistoryAttempt] = useState<
    HistoryAttempt | undefined
  >();

  const onHistoryAttemptClick = (historyAttempt: HistoryAttempt) => {
    setModalHistoryAttempt(historyAttempt);
    onOpen();
  };

  const columns: Column<HistoryAttempt>[] = React.useMemo(
    () => [
      {
        Header: "ID",
        accessor: "attemptId"
      },
      {
        Header: "question",
        accessor: "question",
        Cell: (props) => (
          <Text fontWeight="bold">{`${props.value?.questionId}. ${props.value?.name}`}</Text>
        )
      },
      {
        Header: "difficulty",
        accessor: (row) => (
          <Text
            fontWeight="bold"
            color={difficultyColor(row.question!.difficulty)}
          >
            {QuestionDifficulty[row.question!.difficulty].toString()}
          </Text>
        )
      },
      {
        Header: "language",
        accessor: "language",
        Cell: (props) => <Code>{props.value}</Code>
      },
      {
        Header: "users",
        accessor: "users",
        Cell: (props) => (
          <Text>{props.value.find((user) => user !== currUser?.nickname)}</Text>
        )
      },
      {
        Header: "Submited At",
        accessor: "timestamp"
      },
      {
        Header: "submission",
        disableSortBy: true,
        accessor: (row) => (
          <Button onClick={() => onHistoryAttemptClick(row)} colorScheme="blue">
            View
          </Button>
        )
      }
    ],
    [currUser]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data: pagination.items,
        initialState: {
          sortBy: [
            {
              id: "timestamp",
              desc: false
            }
          ],
          hiddenColumns
        }
      },
      useSortBy
    );

  if (pagination.total === 0) {
    const text =
      questionId > 0
        ? "No attempt history for this question"
        : "No attempt history";
    return <Text fontSize="xl">{text}</Text>;
  }

  return (
    <>
      <TableContainer>
        <Table overflow="auto" {...getTableProps()}>
          <Thead>
            {
              // Loop over the header rows
              headerGroups.map((headerGroup) => (
                // Apply the header row props
                <Tr {...headerGroup.getHeaderGroupProps()}>
                  {
                    // Loop over the headers in each row
                    headerGroup.headers.map((column) => (
                      // Apply the header cell props
                      // <Th {...column.getHeaderProps()}>.

                      <Th
                        {...column.getHeaderProps(
                          column.getSortByToggleProps()
                        )}
                      >
                        {column.render("Header")}
                        <chakra.span pl="4">
                          {column.isSorted && column.isSortedDesc ? (
                            <TriangleDownIcon aria-label="sorted descending" />
                          ) : (
                            ""
                          )}
                        </chakra.span>
                        <chakra.span pl="4">
                          {column.isSorted && column.isSortedDesc === false ? (
                            <TriangleUpIcon aria-label="sorted ascending" />
                          ) : (
                            ""
                          )}
                        </chakra.span>
                      </Th>
                    ))
                  }
                </Tr>
              ))
            }
          </Thead>
          {/* Apply the table body props */}
          <Tbody {...getTableBodyProps()}>
            {
              // Loop over the table rows
              rows.map((row) => {
                // Prepare the row for display
                prepareRow(row);
                return (
                  // Apply the row props
                  <Tr {...row.getRowProps()}>
                    {
                      // Loop over the rows cells
                      row.cells.map((cell) => (
                        // Apply the cell props
                        <Td {...cell.getCellProps()}>
                          {
                            // Render the cell contents
                            cell.render("Cell")
                          }
                        </Td>
                      ))
                    }
                  </Tr>
                );
              })
            }
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
      {/* History modal */}
      <HistoryAttemptModal
        historyAttempt={modalHistoryAttempt}
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  );
}

export default HistoryTable;
