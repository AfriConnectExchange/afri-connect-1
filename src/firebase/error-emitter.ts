'use client';

// A simple, typed event emitter
type EventMap = Record<string, any>;
type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = (params: T) => void;

interface Emitter<T extends EventMap> {
  on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
  off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
  emit<K extends EventKey<T>>(eventName: K, params: T[K]): void;
}

function createEmitter<T extends EventMap>(): Emitter<T> {
  const listeners: { [K in keyof T]?: Array<(p: T[K]) => void> } = {};

  return {
    on(eventName, fn) {
      listeners[eventName] = listeners[eventName] || [];
      listeners[eventName]!.push(fn);
    },
    off(eventName, fn) {
      const eventListeners = listeners[eventName];
      if (eventListeners) {
        listeners[eventName] = eventListeners.filter((listener) => listener !== fn);
      }
    },
    emit(eventName, params) {
      const eventListeners = listeners[eventName];
      if (eventListeners) {
        eventListeners.forEach((fn) => fn(params));
      }
    },
  };
}

// Define the events and their payloads
interface AppEvents {
  'permission-error': FirestorePermissionError;
}

import type { FirestorePermissionError } from './errors';

// Export a singleton instance of the emitter
export const errorEmitter = createEmitter<AppEvents>();