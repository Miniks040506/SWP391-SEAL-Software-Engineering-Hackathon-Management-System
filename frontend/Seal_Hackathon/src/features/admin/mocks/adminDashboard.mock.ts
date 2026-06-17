const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockAdminDashboardApi = {
  getUsers: async (params: any) => {
    await delay(300);
    const fakeCount =
      params.role === "ADMIN" ? 5 :
      params.role === "STUDENT" ? 1250 :
      params.role === "MENTOR" ? 45 :
      params.role === "JUDGE" ? 30 :
      params.role === "COORDINATOR" ? 12 :
      params.status === "PENDING_APPROVAL" ? 8 :
      params.status === "SUSPENDED" ? 3 :
      1350; // Total
    return { totalElements: fakeCount, content: [] };
  },

  getPendingApprovalUsers: async () => {
    await delay(500);
    return {
      content: [
        { id: "u1", fullName: "Nguyen Van A", email: "nva@example.com", emailVerifiedAt: new Date().toISOString() },
        { id: "u2", fullName: "Le Thi B", email: "ltb@example.com", emailVerifiedAt: new Date(Date.now() - 3600000).toISOString() },
        { id: "u3", fullName: "Tran Van C", email: "tvc@example.com", emailVerifiedAt: new Date(Date.now() - 7200000).toISOString() },
      ],
      totalElements: 3,
    };
  },

  getAuditLogs: async () => {
    await delay(400);
    return {
      content: [
        {
          id: "log1",
          createdAt: new Date().toISOString(),
          actionType: "LOGIN_SUCCESS",
          actorName: "Admin System",
          targetTable: "Auth",
          afterState: { ip: "192.168.1.1", browser: "Chrome" }
        },
        {
          id: "log2",
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          actionType: "UPDATE_EVENT",
          actorName: "John Coordinator",
          targetTable: "HackathonEvent",
          targetId: "evt-001",
          afterState: { status: "ONGOING" }
        }
      ],
      totalElements: 2,
    };
  }
};