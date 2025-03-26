class Course {
    _id;
    name;
    description;
    requirements;
    target;
    min_age;
    max_age;
    minutesPerSession;
    numOfSessions;
    fee;
    cubeSubject;
    level;
    courseDetail=[];
    constructor() {}
  }
  module.exports = Course;