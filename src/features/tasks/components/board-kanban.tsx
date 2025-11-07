import React, { useCallback, useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

import { KanbanCard } from "./kanban-card";
import { KanbanColumnHeader } from "./kanban-column-header";

import { Task, TaskStatus } from "../types";

// Board columns: To Do, In Progress, In Review, Done
const boards: TaskStatus[] = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
];

type TasksState = {
  [key in TaskStatus]: Task[];
};

interface BoardKanbanProps {
  data: Task[];
  onChange: (
    tasks: { id: string; status: TaskStatus; position: number }[]
  ) => void;
}

export const BoardKanban = ({ data, onChange }: BoardKanbanProps) => {
  const [tasks, setTasks] = useState<TasksState>(() => {
    const initialTasks: TasksState = {
      [TaskStatus.BACKLOG]: [],
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.IN_REVIEW]: [],
      [TaskStatus.DONE]: [],
    };

    data.forEach((task) => {
      initialTasks[task.status].push(task);
    });

    // Sort tasks with custom logic: due date first, then by position
    Object.keys(initialTasks).forEach((status) => {
      initialTasks[status as TaskStatus].sort((a, b) => {
        // Special sorting for TODO column: prioritize by due date
        if (status === TaskStatus.TODO) {
          // Tasks with due dates come first
          const aHasDueDate = a.dueDate && a.dueDate.trim() !== '';
          const bHasDueDate = b.dueDate && b.dueDate.trim() !== '';
          
          if (aHasDueDate && !bHasDueDate) return -1;
          if (!aHasDueDate && bHasDueDate) return 1;
          
          // If both have due dates, sort by due date (earliest first)
          if (aHasDueDate && bHasDueDate) {
            const dateA = new Date(a.dueDate!);
            const dateB = new Date(b.dueDate!);
            const dateDiff = dateA.getTime() - dateB.getTime();
            if (dateDiff !== 0) return dateDiff;
          }
        }
        
        // Fallback to position sorting for all other cases
        return a.position - b.position;
      });
    });

    return initialTasks;
  });

  useEffect(() => {
    const newTasks: TasksState = {
      [TaskStatus.BACKLOG]: [],
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.IN_REVIEW]: [],
      [TaskStatus.DONE]: [],
    };

    data.forEach((task) => {
      newTasks[task.status].push(task);
    });

    // Sort tasks with custom logic: due date first for TODO, then by position
    Object.keys(newTasks).forEach((status) => {
      newTasks[status as TaskStatus].sort((a, b) => {
        // Special sorting for TODO column: prioritize by due date
        if (status === TaskStatus.TODO) {
          // Tasks with due dates come first
          const aHasDueDate = a.dueDate && a.dueDate.trim() !== '';
          const bHasDueDate = b.dueDate && b.dueDate.trim() !== '';
          
          if (aHasDueDate && !bHasDueDate) return -1;
          if (!aHasDueDate && bHasDueDate) return 1;
          
          // If both have due dates, sort by due date (earliest first)
          if (aHasDueDate && bHasDueDate) {
            const dateA = new Date(a.dueDate!);
            const dateB = new Date(b.dueDate!);
            const dateDiff = dateA.getTime() - dateB.getTime();
            if (dateDiff !== 0) return dateDiff;
          }
        }
        
        // Fallback to position sorting for all other cases
        return a.position - b.position;
      });
    });

    setTasks(newTasks);
  }, [data]);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const { source, destination } = result;
      const sourceStatus = source.droppableId as TaskStatus;
      const destStatus = destination.droppableId as TaskStatus;

      let updatesPayload: { id: string; status: TaskStatus; position: number }[] = [];

      setTasks((prevTasks) => {
        const newTasks = { ...prevTasks };

        // Remove task from source
        const sourceColumn = [...newTasks[sourceStatus]];
        const [movedTask] = sourceColumn.splice(source.index, 1);

        // If moving to a different column, update status
        if (sourceStatus !== destStatus) {
          movedTask.status = destStatus;

          // Add to destination
          const destColumn = [...newTasks[destStatus]];
          destColumn.splice(destination.index, 0, movedTask);
          newTasks[destStatus] = destColumn;
        } else {
          // Same column, just reorder
          sourceColumn.splice(destination.index, 0, movedTask);
        }

        newTasks[sourceStatus] = sourceColumn;

        // Prepare updates payload
        updatesPayload = [];

        newTasks[sourceStatus].forEach((task, index) => {
          const newPosition = Math.min(1000 + index * 1000, 1000000);
          if (task.position !== newPosition) {
            updatesPayload.push({
              id: task.id,
              status: sourceStatus,
              position: newPosition,
            });
          }
        });

        if (sourceStatus !== destStatus) {
          newTasks[destStatus].forEach((task, index) => {
            const newPosition = Math.min(1000 + index * 1000, 1000000);
            if (task.position !== newPosition || task.id === movedTask.id) {
              updatesPayload.push({
                id: task.id,
                status: destStatus,
                position: newPosition,
              });
            }
          });
        }

        return newTasks;
      });

      onChange(updatesPayload);
    },
    [onChange]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex overflow-x-auto">
        {boards.map((board) => {
          return (
            <div
              key={board}
              className="flex-1 mx-2 bg-muted p-1.5 rounded-md min-h-[200px]"
            >
              <KanbanColumnHeader board={board} taskCount={tasks[board].length} />
              <Droppable droppableId={board}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="min-h-[200px] py-1.5"
                  >
                    {tasks[board].map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <KanbanCard task={task} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};