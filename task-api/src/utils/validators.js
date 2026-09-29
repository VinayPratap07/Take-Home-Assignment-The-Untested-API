const VALID_STATUSES = ["todo", "in_progress", "done"];
const VALID_PRIORITIES = ["low", "medium", "high"];

//Created the valid update field that store all the valid fields that can be updated
const VALID_UPDATE_FIELDS = [
  "title",
  "description",
  "status",
  "priority",
  "dueDate",
];

const validateCreateTask = (body) => {
  if (
    !body.title ||
    typeof body.title !== "string" ||
    body.title.trim() === ""
  ) {
    return "title is required and must be a non-empty string";
  }
  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return `status must be one of: ${VALID_STATUSES.join(", ")}`;
  }
  if (body.priority && !VALID_PRIORITIES.includes(body.priority)) {
    return `priority must be one of: ${VALID_PRIORITIES.join(", ")}`;
  }
  if (body.dueDate && isNaN(Date.parse(body.dueDate))) {
    return "dueDate must be a valid ISO date string";
  }
  return null;
};

const validateUpdateTask = (body) => {
  // checks the new update filed with the VALID_UPDATE_FIELDS
  const unknownField = Object.keys(body).find(
    (field) => !VALID_UPDATE_FIELDS.includes(field),
  );

  //If the field does not exists it returns with message that it is not a valid field
  if (unknownField) {
    return `${unknownField} is not a valid field`;
  }
  if (
    body.title !== undefined &&
    (typeof body.title !== "string" || body.title.trim() === "")
  ) {
    return "title must be a non-empty string";
  }
  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return `status must be one of: ${VALID_STATUSES.join(", ")}`;
  }
  if (body.priority && !VALID_PRIORITIES.includes(body.priority)) {
    return `priority must be one of: ${VALID_PRIORITIES.join(", ")}`;
  }
  if (body.dueDate && isNaN(Date.parse(body.dueDate))) {
    return "dueDate must be a valid ISO date string";
  }
  return null;
};

module.exports = { validateCreateTask, validateUpdateTask };
