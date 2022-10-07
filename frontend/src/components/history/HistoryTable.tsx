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
  useDisclosure,
  Button,
} from "@chakra-ui/react";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { useSelector } from "react-redux";
import { HistoryAttempt, QuestionDifficulty } from "../../proto/types";
import HistoryAttemptModal from "../modal/HistoryAttemptModal";
import difficultyColor from "../../utils/diffcultyColors";
import { RootState } from "../../app/store";

type Props = {
  historyAttempts: HistoryAttempt[];
  hiddenColumns: string[];
};

function HistoryTable({ historyAttempts, hiddenColumns }: Props) {
  const [userHistory, setUserHistory] = React.useState<HistoryAttempt[]>([]);
  const [modalHistoryAttempt, setModalHistoryAttempt] = React.useState<
    HistoryAttempt | undefined
  >();
  const {
    isOpen: isHistoryModalOpen,
    onOpen: onOpenHistoryModal,
    onClose: onCloseHistoryModal,
  } = useDisclosure();
  const onHistoryAttemptClick = (historyAttempt: HistoryAttempt) => {
    setModalHistoryAttempt(historyAttempt);
    onOpenHistoryModal();
  };
  const currUser = useSelector((state: RootState) => state.user.user);
  React.useEffect(() => {
    setUserHistory(historyAttempts);
  }, []);

  const columns: Column<HistoryAttempt>[] = React.useMemo(
    () => [
      {
        Header: "ID",
        accessor: "attemptId",
      },
      {
        Header: "question",
        accessor: "question",
        Cell: (props) => (
          <Text fontWeight="bold">{`${props.value?.questionId}. ${props.value?.name}`}</Text>
        ),
      },
      {
        Header: "diffculty",
        accessor: (row) => (
          <Text
            fontWeight="bold"
            color={difficultyColor(row.question!.difficulty)}
          >
            {QuestionDifficulty[row.question!.difficulty].toString()}
          </Text>
        ),
      },
      {
        Header: "language",
        accessor: "language",
        Cell: (props) => <Code>{props.value}</Code>,
      },
      {
        Header: "users",
        accessor: "users",
        Cell: (props) => (
          <Text>{props.value.find((user) => user !== currUser?.nickname)}</Text>
        ),
      },
      {
        Header: "Submited At",
        accessor: "timestamp",
      },
      {
        Header: "submission",
        disableSortBy: true,
        accessor: (row) => (
          <Button onClick={() => onHistoryAttemptClick(row)} colorScheme="blue">
            View
          </Button>
        ),
      },
    ],
    [userHistory]
  );

  const data = React.useMemo(() => userHistory, [userHistory]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data,
        initialState: {
          sortBy: [
            {
              id: "timestamp",
              desc: false,
            },
          ],

          hiddenColumns,
        },
      },

      useSortBy
    );

  return (
    <Box>
      {data.length === 0 ? (
        <Text>No history</Text>
      ) : (
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
      )}
      <HistoryAttemptModal
        historyAttempt={modalHistoryAttempt}
        isOpen={isHistoryModalOpen}
        onClose={onCloseHistoryModal}
      />
    </Box>
  );
}

export default HistoryTable;
