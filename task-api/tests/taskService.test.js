const taskService = require("../src/services/taskService");

//Runs before each test case so that no created task for above test case interfer with the test cases after that
beforeEach(() => {
  taskService._reset();
});

describe("getAll", () => {
  test("Should return an empty array when there are no tasks", () => {
    expect(taskService.getAll()).toEqual([]);
  });

  test("Should return the number of created tasks", () => {
    taskService.create({ title: "task 1" });
    taskService.create({ title: "task 2" });

    const result = taskService.getAll();

    expect(result).toHaveLength(2);
  });

  test("Should return the title of the first created tasks", () => {
    taskService.create({ title: "task 3" });
    taskService.create({ title: "task 4" });

    const result = taskService.getAll();

    expect(result[0].title).toBe("task 3");
  });
});

describe("findById", () => {
  test("should return task when id exists", () => {
    const task = taskService.create({ title: "find me" });

    expect(taskService.findById(task.id)).toEqual(task);
  });

  test("should return undefined when id does not exist in current tasks", () => {
    expect(taskService.findById("na")).toBeUndefined();
  });
});

describe("getByStatus", () => {
  test("should return the the tasks with matching status", () => {
    taskService.create({ title: "status test", status: "failed" });

    expect(taskService.getByStatus("failed")).toHaveLength(1);
  });

  test("should return empty array if no task with that status is found", () => {
    expect(taskService.getByStatus("undefiend")).toEqual([]);
  });
});

describe("getPaginated", () => {
  test("should return the task according to page and limit", () => {
    taskService.create({ title: "Task 1" });
    taskService.create({ title: "Task 2" });
    taskService.create({ title: "Task 3" });
    taskService.create({ title: "Task 4" });

    const result = taskService.getPaginated(1, 2);

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("Task 1");
    expect(result[1].title).toBe("Task 2");
  });

  test("should return empty array if both page and limit is 0", () => {
    const result = taskService.getPaginated(0, 0);

    expect(result).toEqual([]);
  });
});

describe("getStats", () => {
  test("should return every stat equal to 0 when there are no tasks", () => {
    expect(taskService.getStats()).toEqual({
      todo: 0,
      in_progress: 0,
      done: 0,
      overdue: 0,
    });
  });

  test("should return the count of tasks by status", () => {
    taskService.create({ title: "task 1", status: "todo" });
    taskService.create({ title: "task 2", status: "in_progress" });
    taskService.create({ title: "task 3", status: "done" });

    const result = taskService.getStats();

    expect(result.todo).toBe(1);
    expect(result.in_progress).toBe(1);
    expect(result.done).toBe(1);
  });

  test("should return the count of overdue unfinished tasks ", () => {
    taskService.create({
      title: "task 1",
      status: "todo",
      dueDate: "2026-09-05",
    });

    taskService.create({
      title: "task 2",
      status: "done",
      dueDate: "2026-09-05",
    });

    taskService.create({
      title: "task 3",
      status: "todo",
      dueDate: "2026-11-05",
    });

    taskService.create({
      title: "task 4",
      status: "done",
      dueDate: "2026-11-05",
    });

    expect(taskService.getStats().overdue).toBe(1);
  });
});

describe("create", () => {
  test("should create a task with provided values", () => {
    const result = taskService.create({
      title: "task 1",
      description: "testing the app",
      status: "in_progress",
      priority: "high",
      dueDate: "2026-09-30",
    });

    expect(result.title).toBe("task 1");
    expect(result.status).toBe("in_progress");
    expect(result.priority).toBe("high");
    expect(result.dueDate).toBe("2026-09-30");
  });

  test("should fill defualt values", () => {
    const result = taskService.create({ title: "default values" });

    expect(result.description).toBe("");
    expect(result.status).toBe("todo");
    expect(result.priority).toBe("medium");
    expect(result.dueDate).toBeNull();
    expect(result.completedAt).toBeNull();
  });

  test("should generate id and createdAt automatically", () => {
    const result = taskService.create({ title: "Create id" });

    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeDefined();
  });
});

describe("update", () => {
  test("should update an existing task fields", () => {
    const task = taskService.create({
      title: "old title",
      priority: "low",
    });

    const result = taskService.update(task.id, {
      title: "new title",
      priority: "high",
    });

    expect(result.title).toBe("new title");
    expect(result.priority).toBe("high");
  });

  test("should return null when task doesn't exist", () => {
    expect(taskService.update("invalid", { title: "Updated" })).toBeNull();
  });
});

describe("remove", () => {
  test("should remove an existing task", () => {
    const task = taskService.create({ title: "Delete me" });

    expect(taskService.remove(task.id)).toBe(true);
    expect(taskService.findById(task.id)).toBeUndefined();
  });

  test("should return false when task does not exist", () => {
    expect(taskService.remove("invalid")).toBe(false);
  });
});

describe("completeTask", () => {
  test("should mark a task as done", () => {
    const task = taskService.create({
      title: "task 1",
      status: "todo",
      priority: "high",
    });

    const result = taskService.completeTask(task.id);

    expect(result.status).toBe("done");
    expect(result.priority).toBe("medium");
    expect(result.completedAt).toBeDefined();
  });

  test("should return null when task does not exist", () => {
    expect(taskService.completeTask("invalid")).toBeNull();
  });
});
