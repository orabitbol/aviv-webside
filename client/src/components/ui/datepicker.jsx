import React from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export function DatePicker({ selected, onChange, ...props }) {
  return (
    <ReactDatePicker
      selected={selected}
      onChange={onChange}
      className="rounded-lg border border-gray-300 px-4 py-2 shadow focus:outline-none focus:ring-2 focus:ring-primary"
      dateFormat="dd/MM/yyyy"
      {...props}
    />
  );
} 