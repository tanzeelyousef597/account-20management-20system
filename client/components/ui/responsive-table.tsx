import React from 'react';
import { cn } from '@/lib/utils';
import { Table } from './table';

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
  minWidth?: string;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  children,
  className,
  minWidth = '600px'
}) => {
  return (
    <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
      <Table 
        className={cn('table-auto', minWidth && `min-w-[${minWidth}]`, className)}
        style={{ minWidth }}
      >
        {children}
      </Table>
    </div>
  );
};

export default ResponsiveTable;
