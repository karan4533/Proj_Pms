import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";

const PdfXmlPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col gap-y-4 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">📄 PDF to XML Extraction</h1>
        </div>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <p className="text-muted-foreground">
            Upload PDF documents and extract structured XML data.
          </p>
        </div>
        
        <div className="flex items-center justify-center h-96 rounded-lg border border-dashed">
          <p className="text-muted-foreground">PDF to XML Extraction feature coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default PdfXmlPage;
