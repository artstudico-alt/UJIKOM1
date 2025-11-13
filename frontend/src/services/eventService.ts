// Shared Event Service untuk menghubungkan Event Organizer dan Admin Utama
interface Event {
  id: number;
  name: string;
  description: string;
  registrationDate: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  status: 'draft' | 'pending_approval' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  category: string;
  organizer?: string;
  organizerName?: string; // For public display
  organizerEmail?: string;
  organizerContact?: string;
  image?: string; // Event image
  createdAt?: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  // Legacy fields for compatibility
  date?: string;
  time?: string;
  title?: string; // For EventCard compatibility
}

class EventService {
  private storageKey = 'gomoment_events';
  private notificationKey = 'gomoment_notifications';

  // Get all events from localStorage
  getAllEvents(): Event[] {
    try {
      const events = localStorage.getItem(this.storageKey);
      const parsedEvents = events ? JSON.parse(events) : [];
      console.log('🔍 EventService: getAllEvents called, found', parsedEvents.length, 'events');
      console.log('🔍 EventService: Raw events data:', parsedEvents);
      return parsedEvents;
    } catch (error) {
      console.error('Error loading events:', error);
      return [];
    }
  }

  // Save event (from Event Organizer) - Always pending approval
  saveEvent(event: Partial<Event>): Event {
    console.log('🔍 EventService: Saving event from organizer...', event);
    const events = this.getAllEvents();
    console.log('🔍 EventService: Current events count:', events.length);
    const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
    
    const newEvent: Event = {
      id: newId,
      name: event.name || '',
      description: event.description || '',
      registrationDate: event.registrationDate || '',
      eventDate: event.eventDate || '',
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      location: event.location || '',
      maxParticipants: event.maxParticipants || 0,
      currentParticipants: 0,
      price: event.price || 0,
      status: 'pending_approval', // Always pending approval from organizer
      category: event.category || '',
      organizer: event.organizer || '',
      organizerName: event.organizer || '', // For public display
      organizerEmail: event.organizerEmail || 'artstudi.co@gmail.com',
      organizerContact: event.organizerContact || '+6285147144348',
      image: event.image || '', // Store event image
      createdAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      // Legacy fields for backward compatibility
      date: event.eventDate || '',
      time: event.startTime || '',
      title: event.name || '' // For EventCard compatibility
    };

    events.push(newEvent);
    localStorage.setItem(this.storageKey, JSON.stringify(events));
    console.log('✅ EventService: Event saved to localStorage', newEvent);
    console.log('✅ EventService: Total events after save:', events.length);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('eventDataChanged', { 
      detail: { 
        type: 'organizer_event_created', 
        event: newEvent 
      } 
    }));
    
    // Create notification for admin
    this.createNotification(newEvent);
    console.log('✅ EventService: Notification created for admin');
    
    // Verify data was saved
    const savedEvents = this.getAllEvents();
    console.log('🔍 EventService: Verification - events in storage:', savedEvents.length);
    
    return newEvent;
  }

  // Save event (from Admin Utama) - Directly published
  saveAdminEvent(event: Partial<Event>): Event {
    console.log('🔧 saveAdminEvent: Starting to save admin event...');
    console.log('🔧 saveAdminEvent: Input event data:', event);
    
    const events = this.getAllEvents();
    console.log('🔧 saveAdminEvent: Current events count:', events.length);
    const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
    console.log('🔧 saveAdminEvent: Generated new ID:', newId);
    
    const newEvent: Event = {
      id: newId,
      name: event.name || '',
      description: event.description || '',
      registrationDate: event.registrationDate || '',
      eventDate: event.eventDate || '',
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      location: event.location || '',
      maxParticipants: event.maxParticipants || 0,
      currentParticipants: 0,
      price: event.price || 0,
      status: 'published', // Admin events are directly published
      category: event.category || '',
      organizer: event.organizer || 'Admin Utama',
      organizerName: event.organizerName || 'Admin Utama', // For public display
      organizerEmail: event.organizerEmail || 'admin@gomoment.com',
      organizerContact: event.organizerContact || '+6281234567890',
      image: event.image || '', // Store event image
      createdAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(), // Auto-approved since it's from admin
      // Legacy fields for backward compatibility
      date: event.eventDate || '',
      time: event.startTime || '',
      title: event.name || '' // For EventCard compatibility
    };

    console.log('🔧 saveAdminEvent: Created admin event object:', newEvent);

    events.push(newEvent);
    console.log('🔧 saveAdminEvent: Events after adding admin event:', events.length);
    
    localStorage.setItem(this.storageKey, JSON.stringify(events));
    console.log('🔧 saveAdminEvent: Event saved to localStorage');
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('eventDataChanged', { 
      detail: { 
        type: 'admin_event_created', 
        event: newEvent 
      } 
    }));
    console.log('🔧 saveAdminEvent: Custom event dispatched');
    
    // Verify it was saved
    const verifyEvents = this.getAllEvents();
    console.log('🔧 saveAdminEvent: Verification - total events after save:', verifyEvents.length);
    
    const publishedEvents = this.getPublishedEvents();
    console.log('🔧 saveAdminEvent: Published events after save:', publishedEvents.length);
    publishedEvents.forEach((event, index) => {
      console.log(`🔧 Admin Published Event ${index + 1}:`, {
        id: event.id,
        name: event.name,
        status: event.status,
        organizer: event.organizer,
        organizerName: event.organizerName
      });
    });
    
    // COMPREHENSIVE DEBUG: Compare admin event structure
    console.log('🔍 ADMIN EVENT DEBUG - Final event structure:');
    console.log('🔍 Event ID:', newEvent.id);
    console.log('🔍 Event Name:', newEvent.name);
    console.log('🔍 Event Status:', newEvent.status);
    console.log('🔍 Event Organizer:', newEvent.organizer);
    console.log('🔍 Event OrganizerName:', newEvent.organizerName);
    console.log('🔍 Event Date Fields:', {
      eventDate: newEvent.eventDate,
      date: newEvent.date,
      startTime: newEvent.startTime,
      time: newEvent.time
    });
    console.log('🔍 Event Legacy Fields:', {
      title: newEvent.title,
      name: newEvent.name
    });
    
    // Test immediate retrieval
    const immediateCheck = this.getPublishedEvents();
    const adminEventFound = immediateCheck.find(e => e.id === newEvent.id);
    console.log('🔍 IMMEDIATE CHECK - Admin event found in published:', !!adminEventFound);
    if (adminEventFound) {
      console.log('🔍 IMMEDIATE CHECK - Admin event details:', {
        id: adminEventFound.id,
        name: adminEventFound.name,
        status: adminEventFound.status,
        organizer: adminEventFound.organizer
      });
    }
    
    console.log('✅ saveAdminEvent: Admin event saved and published successfully');
    return newEvent;
  }

  // Update event (from Admin approval/rejection)
  updateEvent(id: number, updates: Partial<Event>): Event | null {
    const events = this.getAllEvents();
    const eventIndex = events.findIndex(e => e.id === id);
    
    if (eventIndex === -1) return null;
    
    events[eventIndex] = { ...events[eventIndex], ...updates };
    localStorage.setItem(this.storageKey, JSON.stringify(events));
    
    return events[eventIndex];
  }

  // Get events by status
  getEventsByStatus(status: string): Event[] {
    const allEvents = this.getAllEvents();
    console.log(`🔍 EventService: getEventsByStatus('${status}') called`);
    console.log('🔍 EventService: All events before filtering:', allEvents);
    
    const filteredEvents = allEvents.filter(event => {
      const matches = event.status === status;
      console.log(`🔍 Event "${event.name}" (ID: ${event.id}) status: "${event.status}" - matches "${status}": ${matches}`);
      console.log(`🔍 Event "${event.name}" organizer: "${event.organizer}" | organizerName: "${event.organizerName}"`);
      console.log(`🔍 Event "${event.name}" fields:`, {
        id: event.id,
        name: event.name,
        status: event.status,
        organizer: event.organizer,
        organizerName: event.organizerName,
        createdAt: event.createdAt,
        approvedAt: event.approvedAt
      });
      return matches;
    });
    
    console.log(`🔍 EventService: Found ${filteredEvents.length} events with status "${status}"`);
    console.log(`🔍 EventService: Filtered events details:`, filteredEvents.map(e => ({
      id: e.id,
      name: e.name,
      status: e.status,
      organizer: e.organizer
    })));
    return filteredEvents;
  }

  // Get pending approval events (for Admin)
  getPendingEvents(): Event[] {
    return this.getEventsByStatus('pending_approval');
  }

  // Get published events (for public)
  getPublishedEvents(): Event[] {
    const publishedEvents = this.getEventsByStatus('published');
    console.log('🔍 EventService: getPublishedEvents called');
    console.log('🔍 EventService: Found published events:', publishedEvents.length);
    publishedEvents.forEach((event, index) => {
      console.log(`🔍 Published Event ${index + 1}:`, {
        id: event.id,
        name: event.name,
        status: event.status,
        organizer: event.organizer,
        approvedAt: event.approvedAt
      });
    });
    return publishedEvents;
  }

  // Approve event (Admin action)
  approveEvent(id: number): Event | null {
    return this.updateEvent(id, { 
      status: 'published',
      approvedAt: new Date().toISOString()
    });
  }

  // Reject event (Admin action)
  rejectEvent(id: number): Event | null {
    return this.updateEvent(id, { 
      status: 'cancelled',
      rejectedAt: new Date().toISOString()
    });
  }

  // Create notification for admin
  private createNotification(event: Event): void {
    const notifications = this.getNotifications();
    const notification = {
      id: Date.now(),
      type: 'event_pending',
      title: 'Event Menunggu Persetujuan',
      message: `Event "${event.name}" dari ${event.organizer} menunggu persetujuan`,
      eventId: event.id,
      createdAt: new Date().toISOString(),
      read: false
    };
    
    notifications.push(notification);
    localStorage.setItem(this.notificationKey, JSON.stringify(notifications));
  }

  // Get notifications
  getNotifications(): any[] {
    try {
      const notifications = localStorage.getItem(this.notificationKey);
      return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }

  // Get unread notifications count
  getUnreadNotificationsCount(): number {
    return this.getNotifications().filter(n => !n.read).length;
  }

  // Mark notification as read
  markNotificationAsRead(id: number): void {
    const notifications = this.getNotifications();
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      localStorage.setItem(this.notificationKey, JSON.stringify(notifications));
    }
  }

  // Delete event
  deleteEvent(id: number): boolean {
    const events = this.getAllEvents();
    const filteredEvents = events.filter(event => event.id !== id);
    
    if (filteredEvents.length < events.length) {
      localStorage.setItem(this.storageKey, JSON.stringify(filteredEvents));
      return true;
    }
    return false;
  }

  // Debug: Check localStorage availability
  isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.error('❌ localStorage is not available:', e);
      return false;
    }
  }

  // Debug: Get raw localStorage data
  getRawStorageData(): { events: string | null, notifications: string | null } {
    return {
      events: localStorage.getItem(this.storageKey),
      notifications: localStorage.getItem(this.notificationKey)
    };
  }

  // Debug: Force save test data
  saveTestEvent(): Event {
    const testEvent: Event = {
      id: 999,
      name: 'Test Event - Debug',
      description: 'This is a test event for debugging',
      registrationDate: '2024-11-05',
      eventDate: '2024-11-10',
      startTime: '10:00',
      endTime: '12:00',
      location: 'Test Location',
      maxParticipants: 50,
      currentParticipants: 0,
      price: 0,
      status: 'pending_approval',
      category: 'Test',
      organizer: 'Test Organizer',
      organizerEmail: 'test@example.com',
      organizerContact: '+6281234567890',
      createdAt: new Date().toISOString(),
      submittedAt: new Date().toISOString()
    };

    const events = this.getAllEvents();
    events.push(testEvent);
    localStorage.setItem(this.storageKey, JSON.stringify(events));
    console.log('🧪 Test event saved:', testEvent);
    return testEvent;
  }

  // Save test admin event (for debugging)
  saveTestAdminEvent(): Event {
    console.log('🧪 saveTestAdminEvent: Starting to create test admin event...');
    
    // Generate unique ID to avoid conflicts
    const existingEvents = this.getAllEvents();
    const newId = existingEvents.length > 0 ? Math.max(...existingEvents.map(e => e.id)) + 1 : 1;
    console.log('🧪 saveTestAdminEvent: Generated new ID:', newId);
    
    const testAdminEvent: Event = {
      id: newId,
      name: 'Test Admin Event - Published',
      description: 'This is a test event created by admin, directly published',
      registrationDate: '2024-11-05',
      eventDate: '2024-11-15',
      startTime: '14:00',
      endTime: '16:00',
      location: 'Admin Event Location',
      maxParticipants: 100,
      currentParticipants: 0,
      price: 50000,
      status: 'published', // Admin events are directly published
      category: 'Conference',
      organizer: 'Admin Utama',
      organizerName: 'Admin Utama',
      organizerEmail: 'admin@gomoment.com',
      organizerContact: '+6281234567890',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
      createdAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      // Legacy fields for compatibility
      date: '2024-11-15',
      time: '14:00',
      title: 'Test Admin Event - Published'
    };

    console.log('🧪 saveTestAdminEvent: Test admin event object created:', testAdminEvent);

    const allEvents = this.getAllEvents();
    console.log('🧪 saveTestAdminEvent: Current events before adding:', allEvents.length);
    
    allEvents.push(testAdminEvent);
    console.log('🧪 saveTestAdminEvent: Events after adding admin event:', allEvents.length);
    
    localStorage.setItem(this.storageKey, JSON.stringify(allEvents));
    console.log('🧪 saveTestAdminEvent: Event saved to localStorage');
    
    // Verify it was saved
    const verifyEvents = this.getAllEvents();
    console.log('🧪 saveTestAdminEvent: Verification - total events after save:', verifyEvents.length);
    
    const publishedEvents = this.getPublishedEvents();
    console.log('🧪 saveTestAdminEvent: Published events after save:', publishedEvents.length);
    publishedEvents.forEach((event, index) => {
      console.log(`🧪 Published Event ${index + 1}:`, {
        id: event.id,
        name: event.name,
        status: event.status,
        organizer: event.organizer
      });
    });
    
    console.log('✅ saveTestAdminEvent: Test admin event saved and published successfully');
    return testAdminEvent;
  }

  // Clear all data (for testing)
  clearAllData(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.notificationKey);
    console.log('🗑️ All localStorage data cleared');
  }



  // Get dashboard stats
  getDashboardStats() {
    const events = this.getAllEvents();
    const pendingCount = this.getPendingEvents().length;
    const publishedCount = this.getPublishedEvents().length;
    
    return {
      totalEvents: events.length,
      pendingApprovals: pendingCount,
      publishedEvents: publishedCount,
      activeEvents: events.filter(e => e.status === 'ongoing').length
    };
  }
}

// Export singleton instance
export const eventService = new EventService();
export type { Event };
