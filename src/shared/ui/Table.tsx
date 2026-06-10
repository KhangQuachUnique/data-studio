import type {
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";
import { cn } from "@renderer/shared/lib/cn";

export function TableContainer({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "overflow-auto rounded-lg border border-theme-plum/12 bg-white/45",
        className,
      )}
      {...props}>
      {children}
    </div>
  );
}

export function Table({
  children,
  className,
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn("min-w-full border-collapse text-sm", className)}
      {...props}>
      {children}
    </table>
  );
}

export function TableHead({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("bg-white", className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("border-b border-theme-plum/8 last:border-b-0", className)}
      {...props}>
      {children}
    </tr>
  );
}

export function TableHeaderCell({
  children,
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "whitespace-nowrap px-3 py-2 text-left text-[0.7rem] font-extrabold uppercase text-theme-ink/68",
        className,
      )}
      {...props}>
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-3 py-2 text-theme-ink/78", className)} {...props}>
      {children}
    </td>
  );
}
