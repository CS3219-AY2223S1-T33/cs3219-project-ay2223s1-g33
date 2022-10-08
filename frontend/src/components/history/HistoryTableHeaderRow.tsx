import { Tr, Th } from "@chakra-ui/react";
import React from "react";
import { HeaderGroup } from "react-table";
import SortedArrow from "../ui/SortedArrow";
import { HistoryAttempt } from "../../proto/types";

type Props = {
  headerGroup: HeaderGroup<HistoryAttempt>;
};
function HistoryTableHeaderRow({ headerGroup }: Props) {
  return (
    <Tr {...headerGroup.getHeaderGroupProps()}>
      {
        // Loop over the headers in each row and apply the header cell props
        headerGroup.headers.map((column) => (
          <Th {...column.getHeaderProps(column.getSortByToggleProps())}>
            {column.render("Header")}
            <SortedArrow
              isSorted={column.isSorted}
              isDesc={column.isSortedDesc}
            />
          </Th>
        ))
      }
    </Tr>
  );
}

export default HistoryTableHeaderRow;
