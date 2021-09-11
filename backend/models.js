const { v4: uuid } = require('uuid');
const Queue = require("./utils/queue.js");

class Mendieta {
  #currentQueue = new Queue();
  activities = [];
  #currentActivity = null;
  #observers = [];

  get currentActivity() {
    return this.#currentActivity;
  }
  set currentActivity(activity) {
    // TODO(Richo): When changing activity we must reset the current queue!
    this.#currentActivity = activity;
    if (activity && !this.findActivity(activity.id)) {
      this.addActivity(activity);
    }
    this.update();
  }

  get submissions() {
    if (!this.#currentActivity) return [];
    return this.#currentActivity.submissions;
  }

  findActivity(id) {
    return this.activities.find(activity => activity.id == id);
  }
  addActivity(activity) {
    this.activities.push(activity);
  }

  findSubmission(id) {
    // TODO(Richo): Throw if no current activity is set yet!
    return this.#currentActivity.findSubmission(id);
  }
  addSubmission(submission) {
    // TODO(Richo): Throw if no current activity is set yet!
    this.#currentActivity.addSubmission(submission);
    this.#currentQueue.put(submission);
    this.update();
  }
  activateSubmission(submission) {
    submission.setActive();
    this.update();
  }
  completeSubmission(submission) {
    submission.complete();
    this.update();
  }
  cancelSubmission(submission) {
    submission.cancel();
    this.update();
  }

  nextSubmission() {
    return this.#currentQueue.take();
  }

  onUpdate(fn) {
    this.#observers.push(fn);
  }
  update() {
    this.#observers.forEach(fn => {
      try {
        fn(); // TODO(Richo): What should we send as argument?
      } catch (err) {
        console.error(err);
      }
    });
  }
}

class Activity {
  id = uuid();
  name;
  students = [];
  submissions = [];

  constructor(name) {
    this.name = name;
  }

  addSubmission(submission) {
    this.submissions.push(submission);
  }
  findSubmission(id) {
    return this.submissions.find(s => s.id == id);
  }
}

const SubmissionState = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  CANCELED: "CANCELED",
  COMPLETED: "COMPLETED",
};

class Submission {
  id = uuid();
  state = SubmissionState.PENDING;
  author;
  program;

  finalizationPromise;
  #finalizationResolve;

  constructor(author, program) {
    this.author = author;
    this.program = program;

    this.finalizationPromise = new Promise(resolve => {
      this.#finalizationResolve = resolve;
    })
  }

  setActive() {
    if (!this.isPending()) return;
    this.state = SubmissionState.ACTIVE;
  }
  cancel() {
    if (this.isCompleted()) return;
    this.state = SubmissionState.CANCELED;
    this.#finalizationResolve(false);
  }
  complete() {
    if (this.isCompleted()) return;
    this.state = SubmissionState.COMPLETED;
    this.#finalizationResolve(true);
  }

  isPending() {
    return this.state == SubmissionState.PENDING;
  }
  isCanceled() {
    return this.state == SubmissionState.CANCELED;
  }
  isCompleted() {
    return this.state == SubmissionState.COMPLETED;
  }
}

module.exports = {
  Mendieta: Mendieta,
  Activity: Activity,
  Submission: Submission,
  SubmissionState: SubmissionState,
};
