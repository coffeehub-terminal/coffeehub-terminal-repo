export const ActivityTypes = {
  SampleRequest: "SampleRequest",
  PurchaseOrder: "PurchaseOrder",
  Contract: "Contract",
  Logistics: "Logistics",
  RoomCreated: "RoomCreated",
  SAMPLE_REQUESTED: { action: "SampleRequested", title: "Sample Requested" },
  SAMPLE_APPROVED: { action: "SampleApproved", title: "Sample Approved" },
  SAMPLE_REJECTED: { action: "SampleRejected", title: "Sample Rejected" },
  SAMPLE_SENT: { action: "SampleSent", title: "Sample Sent" },
  PO_CREATED: { action: "PurchaseOrder", title: "Purchase Order Created" },
  ROOM_CREATED: { action: "RoomCreated", title: "Room Created" },
} as const;
