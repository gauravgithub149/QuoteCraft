import Api from "./Api";


export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: "staff";
  status: "active" | "inactive";
  createdAt: string;
  lastActive: string;
  ownerId?: string;
}

export interface CreateStaffPayload {
  name: string;
  email: string;
  password: string;
  status?: "active" | "inactive";
}

export interface UpdateStaffPayload {
  name: string;
  email: string;
  status: "active" | "inactive";
}

export const userService = {
  getStaffUsers: async () => {
    const response = await Api.get("/users");
    return response.data;
  },

  getStaffUser: async (id: string) => {
    const response = await Api.get(`/users/${id}`);
    return response.data;
  },

  createStaff: async (data: CreateStaffPayload) => {
    const response = await Api.post("/users", data);
    return response.data;
  },

  updateStaff: async (id: string, data: UpdateStaffPayload) => {
    const response = await Api.put(`/users/${id}`, data);
    return response.data;
  },

  updateStaffStatus: async (
    id: string,
    status: "active" | "inactive",
  ) => {
    const response = await Api.patch(`/users/${id}/status`, {
      status,
    });

    return response.data;
  },

  deleteStaff: async (id: string) => {
    const response = await Api.delete(`/users/${id}`);
    return response.data;
  },
};