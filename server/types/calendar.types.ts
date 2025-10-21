export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
  }>;
  location?: string;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export interface FindTimeOptions {
  duration: number; // in minutes
  dateRange: {
    start: Date;
    end: Date;
  };
  workingHours?: {
    start: number; // hour (0-23)
    end: number;   // hour (0-23)
  };
  excludeWeekends?: boolean;
}

export interface WorkingHours {
  start: number;
  end: number;
}
