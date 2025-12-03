"use client";

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Download, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetWeeklyReports } from '../api/use-get-weekly-reports';
import { Skeleton } from '@/components/ui/skeleton';

// Extended type for admin view with joined user data
// Note: API returns dates as strings, not Date objects
type AdminWeeklyReport = {
  id: string;
  userId: string;
  fromDate: string;
  toDate: string;
  department: string;
  dailyDescriptions: Record<string, string>;
  uploadedFiles: Array<{
    date: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: string;
  }>;
  status: string;
  createdAt: string;
  updatedAt: string;
  employeeName: string;
  employeeEmail: string;
};

const departments = [
  'All Departments',
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
];

export function AdminReportsView() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All Departments');

  const { data: reports, isLoading } = useGetWeeklyReports({
    department: selectedDepartment === 'All Departments' ? undefined : selectedDepartment,
  });

  const downloadReport = async (report: AdminWeeklyReport) => {
    // Generate a simple text/markdown format report
    let content = `# Weekly Report\n\n`;
    content += `**Employee:** ${report.employeeName}\n`;
    content += `**Department:** ${report.department}\n`;
    content += `**Period:** ${format(parseISO(report.fromDate), 'PPP')} - ${format(parseISO(report.toDate), 'PPP')}\n`;
    content += `**Submitted:** ${format(parseISO(report.createdAt), 'PPP')}\n\n`;
    content += `---\n\n`;

    // dailyDescriptions is a Record<string, string> where key is date and value is description
    Object.entries(report.dailyDescriptions).forEach(([date, description]) => {
      content += `## ${format(parseISO(date), 'EEEE, MMMM d, yyyy')}\n\n`;
      content += `${description || 'No description provided'}\n\n`;
      
      // Find files for this date
      const filesForDate = report.uploadedFiles.filter(file => file.date === date);
      if (filesForDate.length > 0) {
        content += `**Attachments:**\n`;
        filesForDate.forEach((file) => {
          content += `- ${file.fileName} (${file.fileUrl})\n`;
        });
        content += `\n`;
      }
    });

    // Create and download file
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Weekly_Report_${report.employeeName}_${format(parseISO(report.fromDate), 'yyyy-MM-dd')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Weekly Reports
            </CardTitle>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !reports || reports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No weekly reports found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>From Date</TableHead>
                    <TableHead>To Date</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.employeeName}</TableCell>
                      <TableCell>{report.department}</TableCell>
                      <TableCell>{format(parseISO(report.fromDate), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{format(parseISO(report.toDate), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{format(parseISO(report.createdAt), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadReport(report as AdminWeeklyReport)}
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
