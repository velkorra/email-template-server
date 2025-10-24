export interface EmailAnalyticsDto {
  templateId: string;
  sentCount: number;
  openCount: number;
  clickCount: number;
  lastSent: string;
  devices: {
    mobile: number;
    desktop: number;
    other: number;
  };
  locations: Array<{
    country: string;
    count: number;
  }>;
}

export interface GlobalAnalyticsDto {
    totalProjects: number;
    totalTemplates: number;
    totalSentEmails: number;
    averageOpenRate: number;
    averageClickRate: number;
    topProjects: Array<{
      projectId: string;
      projectName: string;
      sentCount: number;
    }>;
    activityTimeline: Array<{
      date: string;
      sentCount: number;
      openedCount: number;
    }>;
    devicesDistribution: {
      mobile: number;
      desktop: number;
      other: number;
    };
    popularTags: Array<{
      tagId: string;
      tagName: string;
      usageCount: number;
    }>;
  }
  
  export interface ProjectAnalyticsDto {
    projectId: string;
    projectName: string;
    timeline: Array<{
      period: string;
      sent: number;
      opened: number;
      clicked: number;
      unsubscribed: number;
    }>;
    topTemplates: Array<{
      templateId: string;
      templateName: string;
      sentCount: number;
      openRate: number;
    }>;
    recipientStats: {
      total: number;
      active: number;
      bounced: number;
      unsubscribed: number;
    };
    engagementMetrics: {
      avgOpenTime: number;
      avgClickDepth: number;
      popularLinks: Array<{
        url: string;
        clicks: number;
      }>;
    };
    geographicDistribution: Array<{
      country: string;
      sent: number;
      opened: number;
    }>;
  }