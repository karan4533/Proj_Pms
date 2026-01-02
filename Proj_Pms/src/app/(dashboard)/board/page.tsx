import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { BoardView } from "@/features/tasks/components/board-view";

const BoardPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return (
    <div className="h-full">
      <BoardView />
    </div>
  );
};

export default BoardPage;
