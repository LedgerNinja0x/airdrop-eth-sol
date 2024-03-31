import { alpha, styled } from '@mui/material/styles';
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import { useState } from "react";
import Dialog from "./Modal";
import axios from "axios";
import { toast } from "react-toastify";

const ODD_OPACITY = 0.5;

const StripedDataGrid = styled(DataGrid)(({ theme }) => ({
  [`& .${gridClasses.row}.even`]: {
    backgroundColor: theme.palette.grey[200],
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY),
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
    },
    '&.Mui-selected': {
      backgroundColor: alpha(
        theme.palette.primary.main,
        ODD_OPACITY + theme.palette.action.selectedOpacity,
      ),
      '&:hover': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          ODD_OPACITY +
            theme.palette.action.selectedOpacity +
            theme.palette.action.hoverOpacity,
        ),
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          backgroundColor: alpha(
            theme.palette.primary.main,
            ODD_OPACITY + theme.palette.action.selectedOpacity,
          ),
        },
      },
    },
  },
}));

const Table = ({ columns, data }) => {

  let [isOpen, setIsOpen] = useState(false);
  let [selectedUser, setSelectedUser] = useState("");
  return (
    <>
      <StripedDataGrid
        sx={{width: '100%'}}
        rows={data}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[5, 10, 20]}
        disableRowSelectionOnClick
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 1 ? 'even' : 'odd'
        }
      />

      {/* modal config */}
      <Dialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title={"Send Message For Verification"}
        description={
          "Create a message and hastag for verification of this twitter user and verify him on autopilot."
        }
        input={true}
        selectedUser={selectedUser}
      />
    </>
  );
};

export default Table;
