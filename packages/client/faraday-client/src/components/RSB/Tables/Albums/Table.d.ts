import '@tanstack/react-table';

// I'm using this to extend the ColumnMeta interface to get classNames for respsonsive design
// https://tanstack.com/table/latest/docs/api/core/column-def#meta
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string;
  }
}
