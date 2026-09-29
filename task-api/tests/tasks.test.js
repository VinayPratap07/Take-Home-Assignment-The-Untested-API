const request = require("supertest");
const app = require("../src/app");

describe("Task api", () => {
  //Testing get stats api it returns the stats of tasks in the database
  describe("GET /task/stats", () => {
    test("should return task statistics", async () => {
      const response = await request(app).get("/tasks/stats");

      expect(response.status).toBe(200);

      expect(response.body).toHaveProperty("todo");
      expect(response.body).toHaveProperty("in_progress");
      expect(response.body).toHaveProperty("done");
      expect(response.body).toHaveProperty("overdue");
    });
  });

  //api endpoint to get all the tasks
  describe("GET /tasks", () => {
    test("should return all available tasks in the databse", async () => {
      await request(app).post("/tasks").send({
        title: "Task 1",
        priority: "high",
        status: "in_progress",
      }); //creating a test entery

      const response = await request(app).get("/tasks");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
    });

    //Testing the status query parameter
    test("should filter tasks based on status", async () => {
      await request(app).post("/tasks").send({
        title: "Todo task",
        status: "todo",
      });

      await request(app).post("/tasks").send({
        title: "Done task",
        status: "done",
      });

      const response = await request(app).get("/tasks?status=todo");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].status).toBe("todo");
    });

    //Testing pagination query parameter that is limit and page
    test("should return paginated tasks", async () => {
      await request(app).post("/tasks").send({ title: "Task 1" });

      await request(app).post("/tasks").send({ title: "Task 2" });

      const response = await request(app).get("/tasks?page=1&limit=1");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });
  });

  //Testing POST req on the /task endpoint that is to create new tasks
  describe("POST /tasks", () => {
    test("should create a task", async () => {
      const response = await request(app).post("/tasks").send({
        title: "Complete testing",
        description: "Write tests",
        priority: "high",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.title).toBe("Complete testing");
      expect(response.body.priority).toBe("high");
    });

    //Testing invalid input on task creation
    test("should return 400 for invalid task data", async () => {
      const response = await request(app).post("/tasks").send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    //Testing invalid priorities on the task creation
    test("should return new task without the invalid field", async () => {
      const response = await request(app).post("/tasks").send({
        title: "Complete testing",
        description: "Write tests",
        priority: "very high",
      });

      expect(response.status).toBe(400);
    });

    //Testing entering unknown field
    test("should first", async () => {
      const response = await request(app).post("/tasks").send({
        title: "Task 1",
        priority: "low",
        invalidField: "invalid text",
      });

      expect(response.status).toBe(201);

      expect(response.body).not.toHaveProperty("invalidField");
    });
  });

  //Testing PUT req on the /task endpoint that is to update any availabel task
  describe("PUT /:id", () => {
    test("should update an existing taks", async () => {
      const createResponse = await request(app).post("/tasks").send({
        title: "Old title",
        priority: "low",
      });

      //Extracting task id from the response body
      const responseId = createResponse.body.id;

      //Calling the endpoint
      const response = await request(app).put(`/tasks/${responseId}`).send({
        title: "New title",
        priority: "medium",
        dueDate: "2026-10-05",
      });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe("New title");
      expect(response.body.priority).toBe("medium");
      expect(response.body.dueDate).toBe("2026-10-05");
    });

    //Test to check the response on an invalid id
    test("should return 404 when task does not exist", async () => {
      const response = await request(app).put("/tasks/invalid-ID").send({
        title: "Updated",
      });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Task not found");
    });

    //Test to update a field that does not exists on a valid tasks
    test("should return 400 because the field does not exists", async () => {
      const createResponse = await request(app).post("/tasks").send({
        title: "Task 1",
        priority: "low",
      });

      //Extracting task id from the response body
      const responseId = createResponse.body.id;

      //Calling the endpoint
      const response = await request(app).put(`/tasks/${responseId}`).send({
        invalidField: "invalid text",
      });

      expect(response.status).toBe(400);
    });
  });

  //Testing DELETE req on the /tasks/:id endpoint that is to delete any availabel task
  describe("DELETE /tasks/:id", () => {
    //Test to delete an available task
    test("should delete an existing task based on the id", async () => {
      const createResponse = await request(app).post("/tasks").send({
        title: "Delete me",
      });

      const responseId = createResponse.body.id;

      const response = await request(app).delete(`/tasks/${responseId}`);

      expect(response.status).toBe(204);
    });

    //Test to delete an unavaliable task id
    test("should return 404 when task does not exist", async () => {
      const response = await request(app).delete("/tasks/invalid-id");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Task not found");
    });
  });

  //Testing PATCH req on /tasks/:id/complete
  describe("PATCH /tasks/:id/complete", () => {
    //Test to mark a task completed
    test("should mark a task completed ", async () => {
      const createResponse = await request(app).post("/tasks").send({
        title: "Write test cases",
        status: "todo",
        priority: "high",
      });

      const responseId = createResponse.body.id;

      const response = await request(app).patch(
        `/tasks/${responseId}/complete`,
      );

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("done");
      expect(response.body.completedAt).not.toBeNull();
    });

    //Test to mark an invalid task complete
    test("should return a 404 because the task does not exits", async () => {
      const response = await request(app).patch("/tasks/invalid-id/complete");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Task not found");
    });
  });

  describe("PATCH /tasks/:id/assign", () => {
    //Testing with a valid assigne
    test("should assign an assignee", async () => {
      const createResponse = await request(app).post("/tasks").send({
        title: "Write test cases",
        status: "todo",
        priority: "high",
      });

      const responseId = createResponse.body.id;

      const response = await request(app)
        .patch(`/tasks/${responseId}/assign`)
        .send({ assignee: "Vinay" });

      expect(response.status).toBe(200);
      expect(response.body.assignee).toBe("Vinay");
    });

    //Testing with an invalid assigne
    test("should return status 400", async () => {
      const createResponse = await request(app).post("/tasks").send({
        title: "Write test cases",
        status: "todo",
        priority: "high",
      });

      const responseId = createResponse.body.id;

      const response = await request(app)
        .patch(`/tasks/${responseId}/assign`)
        .send({ assignee: "      " });

      expect(response.status).toBe(400);
    });
    //Testing on an invalid id
    test("should return status 400", async () => {
      const response = await request(app)
        .patch("/tasks/invalid-Id/assign")
        .send({ assignee: "Vinay" });

      expect(response.status).toBe(404);
    });

    //Testing for an already assigned assigne
    test("should return status 400", async () => {
      const createResponse = await request(app).post("/tasks").send({
        title: "Write test cases",
        status: "todo",
        priority: "high",
      });

      const responseId = createResponse.body.id;

      await request(app)
        .patch(`/tasks/${responseId}/assign`)
        .send({ assignee: "Vinay" });

      const response2 = await request(app)
        .patch(`/tasks/${responseId}/assign`)
        .send({ assignee: "Vinay" });

      expect(response2.status).toBe(400);
    });
  });
});
