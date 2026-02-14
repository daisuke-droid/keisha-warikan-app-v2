import { WarikanEvent } from '@/types';

const STORAGE_KEY = 'keisha_warikan_events';

export const eventRepository = {
    getAll: (): WarikanEvent[] => {
        if (typeof window === 'undefined') return [];
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to load events', e);
            return [];
        }
    },

    getById: (id: string): WarikanEvent | undefined => {
        const events = eventRepository.getAll();
        return events.find(e => e.id === id);
    },

    save: (event: WarikanEvent): void => {
        const events = eventRepository.getAll();
        const index = events.findIndex(e => e.id === event.id);
        if (index >= 0) {
            events[index] = event;
        } else {
            events.push(event);
        }

        // Sort by createdAt desc
        events.sort((a, b) => b.createdAt - a.createdAt);

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
        } catch (e) {
            console.error('Failed to save event', e);
        }
    },

    delete: (id: string): void => {
        const events = eventRepository.getAll();
        const newEvents = events.filter(e => e.id !== id);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newEvents));
        } catch (e) {
            console.error('Failed to delete event', e);
        }
    }
};
