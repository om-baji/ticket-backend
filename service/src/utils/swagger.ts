const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Train Booking API",
    version: "1.0.0",
    description:
      "REST API for trains, tickets, and users with gRPC-based booking engine and Redis-backed seat allocation.",
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Local development server",
    },
  ],
  tags: [
    {
      name: "Trains",
      description: "Train routes, classes, quotas, and search APIs",
    },
    {
      name: "Ticket",
      description: "Booking, cancellation, and PNR APIs (gRPC-backed)",
    },
    {
      name: "User",
      description: "Authentication, VPA, and account management APIs",
    },
  ],
};

export default swaggerDefinition;
