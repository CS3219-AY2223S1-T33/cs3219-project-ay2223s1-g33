/* eslint react/destructuring-assignment: 0 */
/* eslint react/prop-types: 0 */
/* eslint react/no-unstable-nested-components: 0 */
import React, { useState, useMemo } from "react";
import { useTable, Column, useSortBy } from "react-table";
import {
  Text,
  Table,
  Thead,
  Tbody,
  Code,
  useDisclosure,
  Button,
  TableContainer,
  Heading,
  Divider,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import PaginationControl from "../ui/PaginationControl";
import HistoryTableDataRow from "./HistoryTableDataRow";
import HistoryTableHeaderRow from "./HistoryTableHeaderRow";
import { HistoryAttempt, QuestionDifficulty } from "../../proto/types";
import HistoryAttemptModal from "../modal/HistoryAttemptModal";
import difficultyColor from "../../utils/difficultyColors";
import usePagination from "../../utils/hooks/usePagination";
import { RootState } from "../../app/store";
import {
  createAttemptHistoryExtractor,
  createAttemptHistoryReqFactory,
} from "../../utils/builderUtils";

type Props = {
  questionId?: number;
  hiddenColumns: string[];
};

const DATETIME_OPTIONS: Intl.DateTimeFormatOptions = {
  hour12: true,
  hour: "numeric",
  minute: "numeric",
  year: "numeric",
  month: "short",
  day: "numeric",
};

function HistoryTable({ hiddenColumns, questionId = 0 }: Props) {
  const currUser = useSelector((state: RootState) => state.user.user);

  const pagination = usePagination({
    fetchUrl: "/api/user/history",
    requestFactory: createAttemptHistoryReqFactory(questionId),
    responseExtractor: createAttemptHistoryExtractor(),
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalHistoryAttempt, setModalHistoryAttempt] = useState<
    HistoryAttempt | undefined
  >();

  const onHistoryAttemptClick = (historyAttempt: HistoryAttempt) => {
    setModalHistoryAttempt(historyAttempt);
    onOpen();
  };

  const columns: Column<HistoryAttempt>[] = useMemo(
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
        id: "difficulty",
        Header: "difficulty",
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
          <Text>{props.value.find((user) => user !== currUser?.username)}</Text>
        ),
      },
      {
        Header: "Submited At",
        accessor: "timestamp",
        Cell: (props) => (
          <Text>
            {new Date(props.value * 1000).toLocaleString(
              "en-GB",
              DATETIME_OPTIONS
            )}
          </Text>
        ),
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
              desc: false,
            },
          ],
          hiddenColumns,
        },
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
        <Heading as="h4" size="md" pb={4}>
          Page {pagination.page}
        </Heading>
        <Divider />
        <Table overflow="auto" {...getTableProps()}>
          <Thead>
            {
              // Loop over the header rows and apply the header row props
              headerGroups.map((headerGroup) => (
                <HistoryTableHeaderRow
                  headerGroup={headerGroup}
                  key={`header-${headerGroup.id}`}
                />
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
                // Apply the row props
                return <HistoryTableDataRow row={row} key={`row-${row.id}`} />;
              })
            }
          </Tbody>
        </Table>
      </TableContainer>
      <PaginationControl
        hasPrevious={!pagination.hasPrevious}
        hasNext={!pagination.hasNext}
        onPrevious={pagination.previousPage}
        onNext={pagination.nextPage}
      />
      {/* History modal */}
      {modalHistoryAttempt && (
        <HistoryAttemptModal
          historyAttempt={modalHistoryAttempt}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}
    </>
  );
}

export default HistoryTable;
