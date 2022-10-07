/* eslint react/destructuring-assignment: 0 */
/* eslint react/prop-types: 0 */
/* eslint react/no-unstable-nested-components: 0 */
import React from "react";
import { useTable, Column, useSortBy } from "react-table";
import {
  Box,
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
  Button
} from "@chakra-ui/react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  TriangleDownIcon,
  TriangleUpIcon
} from "@chakra-ui/icons";
import { HistoryAttempt, QuestionDifficulty } from "../../proto/types";
import HistoryAttemptModal from "./HistoryAttemptModal";
import difficultyColor from "../../utils/diffcultyColors";
import usePagination from "../../utils/hooks/usePagination";
import {
  GetAttemptHistoryRequest,
  GetAttemptHistoryResponse
} from "../../proto/history-service";

type Props = {
  questionId: number;
};

function HistoryTable({ questionId }: Props) {
  const requestFactory = (offset: number, limit: number) => {
    const req: GetAttemptHistoryRequest = {
      offset,
      limit,
      questionId
    };
    return req;
  };

  const responseExtractor = (data: GetAttemptHistoryResponse) => {
    const { errorMessage } = data;
    if (errorMessage !== "") {
      throw new Error(errorMessage);
    }

    // TODO total missing - need pull from main
    const { attempts } = data;
    return { items: attempts, total: 25 };
  };

  const pagination = usePagination({
    fetchUrl: "/api/user/history",
    requestFactory,
    responseExtractor
  });

  // const [userHistory, setUserHistory] = React.useState<HistoryAttempt[]>([]);

  // React.useEffect(() => {
  //   setUserHistory(historyAttempts);
  // }, []);

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
        Cell: (props) => <Text>{props.value[0]}</Text>
      },
      {
        Header: "Submited At",
        accessor: "timestamp"
      },
      {
        Header: "submission",
        disableSortBy: true,
        accessor: (row) => (
          <HistoryAttemptModal
            language={row.language}
            users={row.users}
            attemptId={row.attemptId}
            submission={row.submission}
            question={row.question!}
          />
        )
      }
    ],
    []
  );

  // const data = React.useMemo(() => userHistory, [userHistory]);

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
          hiddenColumns: ["attemptId"]
        }
      },
      useSortBy
    );

  return (
    <Box>
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
                      {...column.getHeaderProps(column.getSortByToggleProps())}
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
    </Box>
  );
}

export default HistoryTable;
