export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: "user" | "admin";
  lastLogin: string;
  projects: string[];
}

export interface UserProfileDto {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  notificationSettings: {
    email: boolean;
    push: boolean;
    frequency: "instant" | "daily" | "weekly";
  };
  starredProjects: string[];
  recentTemplates: string[];
}
