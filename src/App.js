import React, { useState } from 'react';
import './App.css';

// Days of the week for the schedule
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Maps priority to a number for sorting (lower means higher priority)
const PRIORITY_MAP = {
  High: 1,
  Medium: 2,
  Low: 3,
};

function App() {
  const [taskName, setTaskName] = useState("");
  const [dueDay, setDueDay] = useState("Monday");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [tasks, setTasks] = useState([]);

  // Adds a new task to our 'tasks' state
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskName || !dueDay || !estimatedHours || !priority) return;

    const newTask = {
      id: Date.now(),
      name: taskName,
      dueDay,
      estimatedHours: parseInt(estimatedHours, 10),
      priority,
    };

    setTasks([...tasks, newTask]);

    // Clear inputs
    setTaskName("");
    setDueDay("Monday");
    setEstimatedHours("");
    setPriority("Medium");
  };

  // Simple function to format an integer hour (e.g., 13 => "1:00 PM")
  const formatHour = (hour24) => {
    const suffix = hour24 >= 12 ? "PM" : "AM";
    let hour = hour24 % 12;
    if (hour === 0) hour = 12; // 0 or 12 => 12
    return `${hour}:00 ${suffix}`;
  };

  // This function generates the schedule by placing tasks in day slots
  const getSchedule = () => {
    // Prepare an array for each day with a maximum of 12 hours (8AM–8PM).
    // We'll track how many hours used so far and a list of tasks for that day.
    const daySchedules = DAYS.map((day) => ({
      day,
      usedHours: 0,
      tasks: [],
    }));

    // Sort tasks by priority (High → Medium → Low)
    // If same priority, keep the same insertion order for simplicity
    const sortedTasks = [...tasks].sort(
      (a, b) => PRIORITY_MAP[a.priority] - PRIORITY_MAP[b.priority]
    );

    // For each task, try to place it on or before its due day
    sortedTasks.forEach((task) => {
      // Find the index of the due day (e.g., Monday -> 0, Tuesday -> 1, etc.)
      const dueIndex = DAYS.indexOf(task.dueDay);
      // Attempt scheduling from day 0 to 'dueIndex'
      for (let i = 0; i <= dueIndex; i++) {
        // If there's enough space in this day, schedule it
        if (daySchedules[i].usedHours + task.estimatedHours <= 12) {
          const startHour = 8 + daySchedules[i].usedHours; // e.g., 8AM + usedHours
          const endHour = startHour + task.estimatedHours;

          // Add the task, including the time range
          daySchedules[i].tasks.push({
            ...task,
            start: formatHour(startHour),
            end: formatHour(endHour),
          });

          // Update used hours
          daySchedules[i].usedHours += task.estimatedHours;
          break; // stop searching once placed
        }
      }
    });

    return daySchedules;
  };

  // We'll compute the schedule each time the tasks change
  const schedule = getSchedule();

  return (
    <div className="app-container">
      <h1>Weekly Schedule Planner</h1>

      {/* Form to add tasks */}
      <form onSubmit={handleAddTask} className="task-form">
        <input
          type="text"
          placeholder="Task Name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
        />

        <label>Due Day:</label>
        <select value={dueDay} onChange={(e) => setDueDay(e.target.value)}>
          {DAYS.map((day) => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Estimated Hours"
          value={estimatedHours}
          onChange={(e) => setEstimatedHours(e.target.value)}
        />

        <label>Priority:</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <button type="submit">Add Task</button>
      </form>

      {/* Display the schedule in a table with one column per day */}
      <div className="schedule-table">
        <table>
          <thead>
            <tr>
              {DAYS.map((day) => (
                <th key={day}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* We'll just use one table row, and each cell will list tasks */}
            <tr>
              {schedule.map((daySchedule) => (
                <td key={daySchedule.day}>
                  {daySchedule.tasks.length === 0 ? (
                    <div className="no-tasks">No tasks</div>
                  ) : (
                    daySchedule.tasks.map((t) => (
                      <div key={t.id} className="scheduled-task">
                        <strong>{t.name}</strong>
                        <div>{t.start} - {t.end}</div>
                        <div>Priority: {t.priority}</div>
                      </div>
                    ))
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
