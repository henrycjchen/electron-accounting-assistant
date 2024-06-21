import type ExcelJS from 'exceljs';

export function setWrapBorder(cell: ExcelJS.Cell) {
  cell.border = {
    top: {style: 'thin', color: {argb: 'FF000000'}},
    left: {style: 'thin', color: {argb: 'FF000000'}},
    bottom: {style: 'thin', color: {argb: 'FF000000'}},
    right: {style: 'thin', color: {argb: 'FF000000'}},
  };
  cell.alignment = {
    vertical: 'middle',
    horizontal: 'center',
  };
}
