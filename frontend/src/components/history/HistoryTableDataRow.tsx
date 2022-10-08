import { Td, Tr } from "@chakra-ui/react";
import React from "react";
import { Row } from "react-table";
import { HistoryAttempt } from "../../proto/types";

type Props = {
  row: Row<HistoryAttempt>;
};

function HistoryTableDataRow({ row }: Props) {
  return (
    <Tr {...row.getRowProps()}>
      {
        // Loop over the rows cells and apply cell props
        row.cells.map((cell) => (
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
}

export default HistoryTableDataRow;
