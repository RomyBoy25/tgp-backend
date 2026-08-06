const Event = require("../model/event.model");

const getOpenEvent = async (eventId) => {
  const event = await Event.findById(eventId);

  console.log("===== EVENT GUARD =====");
  console.log("Event ID:", eventId);
  console.log("Found:", event);
  console.log("isClosed:", event?.isClosed);

  if (!event) {
    return {
      error: {
        status: 404,
        message: "Event not found.",
      },
    };
  }

  if (event.isClosed) {
    return {
      error: {
        status: 400,
        message: "This event has already been closed.",
      },
    };
  }

  return { event };
};

module.exports = {
  getOpenEvent,
};