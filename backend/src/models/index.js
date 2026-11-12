"use strict";

// All database schemas in one place. Each file defines one collection.
module.exports = {
  User: require("./User"),
  Department: require("./Department"),
  Grievance: require("./Grievance"),
  GrievanceHistory: require("./GrievanceHistory"),
  DepartmentAssignment: require("./DepartmentAssignment"),
  Attachment: require("./Attachment"),
  Feedback: require("./Feedback"),
  ContactEnquiry: require("./ContactEnquiry"),
  AiAnalysis: require("./AiAnalysis"),
};
