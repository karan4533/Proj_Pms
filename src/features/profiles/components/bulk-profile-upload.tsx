"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useBulkUploadProfiles } from "../api/use-bulk-upload-profiles";
import { Progress } from "@/components/ui/progress";

export const BulkProfileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: uploadProfiles, isPending, isSuccess, isError, error } = useBulkUploadProfiles();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (
        selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type === "application/vnd.ms-excel" ||
        selectedFile.name.endsWith(".csv")
      ) {
        setFile(selectedFile);
      } else {
        alert("Please upload a valid Excel (.xlsx, .xls) or CSV file");
      }
    }
  };

  const handleUpload = () => {
    if (!file) return;

    uploadProfiles({ file }, {
      onSuccess: () => {
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
    });
  };

  const downloadTemplate = () => {
    // Create CSV template with detailed examples
    const headers = [
      "name",
      "email",
      "password",
      "mobile_no",
      "native",
      "designation",
      "department",
      "experience",
      "date_of_birth",
      "date_of_joining",
      "skills"
    ];

    const exampleRows = [
      [
        "John Doe",
        "john.doe@example.com",
        "password123",
        "+1234567890",
        "New York, USA",
        "senior_developer",
        "5",
        "1990-05-15",
        "2020-01-10",
        "JavaScript,React,Node.js"
      ],
      // Empty rows for users to fill
      Array(headers.length).fill(""),
      Array(headers.length).fill(""),
    ];

    const csvContent = [
      headers.join(","),
      ...exampleRows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "profile_upload_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Download Template</CardTitle>
          <CardDescription>
            Download the Excel/CSV template with the required format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={downloadTemplate} variant="outline" className="w-full">
            <Download className="size-4 mr-2" />
            Download Template
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload Instructions</CardTitle>
          <CardDescription>
            Follow these guidelines for successful bulk upload
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold">Required Columns:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong>name</strong> - Full name (required)</li>
              <li><strong>email</strong> - Valid email address (required, must be unique)</li>
              <li><strong>password</strong> - Minimum 6 characters (required)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Optional Columns:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong>mobile_no</strong> - Phone number</li>
              <li><strong>native</strong> - Native place/city</li>
              <li><strong>designation</strong> - intern, junior_developer, senior_developer, team_lead, manager, etc.</li>
              <li><strong>department</strong> - engineering, design, product, marketing, sales, hr, finance</li>
              <li><strong>experience</strong> - Years of experience (number)</li>
              <li><strong>date_of_birth</strong> - Format: YYYY-MM-DD (e.g., 1990-05-15)</li>
              <li><strong>date_of_joining</strong> - Format: YYYY-MM-DD (e.g., 2020-01-10)</li>
              <li><strong>skills</strong> - Comma-separated (e.g., JavaScript,React,Node.js)</li>
            </ul>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important Notes</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>File size limit: 10MB</li>
                <li>Maximum 100 profiles per upload</li>
                <li>Dates must be in YYYY-MM-DD format</li>
                <li>Each email must be unique in the system</li>
                <li>Empty optional fields will be left blank</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
          <CardDescription>
            Select your Excel or CSV file to upload profiles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Choose File</Label>
            <div className="flex gap-2">
              <Input
                id="file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx,.xls,.csv"
                disabled={isPending}
              />
              <Button
                onClick={handleUpload}
                disabled={!file || isPending}
                className="min-w-[120px]"
              >
                {isPending ? (
                  <>Uploading...</>
                ) : (
                  <>
                    <Upload className="size-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </div>
            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileSpreadsheet className="size-4" />
                <span>{file.name}</span>
                <span className="text-xs">({(file.size / 1024).toFixed(2)} KB)</span>
              </div>
            )}
          </div>

          {isPending && (
            <div className="space-y-2">
              <Progress value={50} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Processing profiles... Please wait.
              </p>
            </div>
          )}

          {isSuccess && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Success!</AlertTitle>
              <AlertDescription className="text-green-600">
                Profiles have been uploaded successfully.
              </AlertDescription>
            </Alert>
          )}

          {isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Upload Failed</AlertTitle>
              <AlertDescription>
                {error instanceof Error ? error.message : "An error occurred during upload"}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
