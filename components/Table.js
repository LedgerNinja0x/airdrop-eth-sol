import {
  useTable,
  useFilters,
  useGlobalFilter,
  useAsyncDebounce,
} from "react-table";
import { useState } from "react";
import Dialog from "./Modal";
import axios from "axios";

const Table = ({ columns, data }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
    },
    useFilters,
    useGlobalFilter
  );
  async function sendMessage(username) {
    try {
      //insert msg into required user

      //find and update with selectedUser
      await axios.post("/api/me/message", {
        username,
      });

      alert("Message sent successfully");
    } catch (e) {
      console.error(e);
      alert("Something went wrong. Check logs.");
    }
  }

  const { globalFilter } = state;

  const [searchValue, setSearchValue] = useState(globalFilter);

  const debouncedSetGlobalFilter = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    debouncedSetGlobalFilter(e.target.value);
  };

  let [isOpen, setIsOpen] = useState(false);
  let [selectedUser, setSelectedUser] = useState("");

  console.log(selectedUser);

  return (
    <>
      <input
        type="text"
        value={searchValue || ""}
        onChange={handleSearchChange}
        placeholder="Search any column in the table..."
        class="block !outline-none rounded-md md:w-1/3 w-full px-4 border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
      />
      <div className="overflow-x-auto">
        <table
          {...getTableProps()}
          className="border-[1.2px] my-4 overflow-x-auto border-solid border-gray-700"
        >
          <thead>
            {headerGroups.map((headerGroup) => (
              <>
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th
                      {...column.getHeaderProps()}
                      className="py-2 px-4 border-[1.2px] border-solid border-gray-700"
                    >
                      {column.render("Header")}
                    </th>
                  ))}
                </tr>
              </>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className="even:bg-indigo-100">
                  {row.cells.map((cell, i) => (
                    <>
                      {i == 0 ? (
                        <td
                          className="pt-8 h-full px-4 flex items-center gap-x-1"
                          {...cell.getCellProps()}
                        >
                            {console.log(cell.value)}
                          {/* check if user's message object is an empty field, if no then admin already sent msg */}
                          {(!cell.value?.text) && (
                            <button className="flex items-center gap-x-1 bg-indigo-500 text-white text-sm px-2 py-1 rounded-md hover:bg-indigo-400">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4 -rotate-45"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                                />
                              </svg>
                              {/* dont show message btn is twitter already verified */}

                              <span onClick={() => sendMessage(cell.value)}>
                                Message
                              </span>

                              {/* <span>{cell.render("Cell")}</span> */}
                            </button>
                          )}
                          <a
                            href={`https://twitter.com/${row.cells[15].value}`}
                            target="_blank"
                            className="flex items-center gap-x-1 bg-gray-900 text-white text-sm px-2 py-1 rounded-md hover:bg-gray-800"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                              />
                            </svg>
                          </a>
                        </td>
                      ) : (
                        // first cell should be msg sending, check for i and length
                        <td
                          className="py-2 px-4 border-[1.2px] border-solid border-gray-700"
                          {...cell.getCellProps()}
                        >
                          {cell.render("Cell")}
                        </td>
                      )}
                    </>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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
