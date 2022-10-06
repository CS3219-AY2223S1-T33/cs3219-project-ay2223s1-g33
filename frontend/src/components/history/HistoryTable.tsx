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
} from "@chakra-ui/react";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { HistoryAttempt } from "../../proto/types";

// type Props = {
//   historyAttempt: HistoryAttempt;
// };

function HistoryTable() {
  const [userHistory, setUserHistory] = React.useState<HistoryAttempt[]>([]);

  React.useEffect(() => {
    setUserHistory([
      {
        attemptId: 123,
        language: "abcd",
        timestamp: 123,
        question: {
          questionId: 123,
          name: "abcd",
          difficulty: 1,
          content: "abcd",
          solution: "abcd",
        },
        users: ["user 1"],
        submission: "abcd",
      },
      {
        attemptId: 123,
        language: "abcd",
        timestamp: 123,
        question: {
          questionId: 123,
          name: "a",
          difficulty: 1,
          content: "abcd",
          solution: "abcd",
        },
        users: ["user 1"],
        submission: "abcd",
      },
    ]);
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
        Cell: (props) => <Text>{props.value?.name}</Text>,
      },
      {
        Header: "language",
        accessor: "language",
      },
      {
        Header: "users",
        accessor: "users",
        Cell: (props) => <Text>{props.value[0]}</Text>,
      },
      {
        Header: "submission",
        accessor: "submission",
        show: false,
      },
      {
        Header: "timestamp",
        accessor: "timestamp",
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
          hiddenColumns: ["submission", "attemptId"],
        },
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
    </Box>
  );
}

export default HistoryTable;
