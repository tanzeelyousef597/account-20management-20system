import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-full overflow-hidden rounded-lg border border-slate-200">
        <Table className={cn("w-full", className)}>
          {children}
        </Table>
      </div>
    </div>
  );
}

interface ResponsiveTableCellProps {
  children: React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
}

export function ResponsiveTableCell({ 
  children, 
  className, 
  hideOnMobile = false, 
  hideOnTablet = false 
}: ResponsiveTableCellProps) {
  const hiddenClasses = cn(
    hideOnMobile && "hidden sm:table-cell",
    hideOnTablet && "hidden md:table-cell"
  );

  return (
    <TableCell className={cn(
      "px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4 text-xs sm:text-sm",
      hiddenClasses,
      className
    )}>
      {children}
    </TableCell>
  );
}

export function ResponsiveTableHeader({ 
  children, 
  className, 
  hideOnMobile = false, 
  hideOnTablet = false 
}: ResponsiveTableCellProps) {
  const hiddenClasses = cn(
    hideOnMobile && "hidden sm:table-cell",
    hideOnTablet && "hidden md:table-cell"
  );

  return (
    <TableHead className={cn(
      "px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4 text-xs sm:text-sm font-medium",
      hiddenClasses,
      className
    )}>
      {children}
    </TableHead>
  );
}

// Export all table components for consistency
export { Table, TableBody, TableHeader, TableRow };
