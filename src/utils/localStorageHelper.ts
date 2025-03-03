class LocalStorageHelper {
  static setItem(key: string, value: any) {
    if (value === undefined) {
      throw new Error("Cannot store undefined in Local Storage");
    }
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  static getItem<T>(key: string): T | null {
    const value = window.localStorage.getItem(key);
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch (error) {
        console.warn(`Error parsing value for key "${key}": ${error}`);
        return null;
      }
    }
    return null;
  }

  static removeItem(key: string) {
    window.localStorage.removeItem(key);
  }

  static updateItem<T>(key: string, value: any) {
    const existingValue = LocalStorageHelper.getItem<T>(key);
    if (existingValue) {
      LocalStorageHelper.removeItem(key);
      LocalStorageHelper.setItem(key, { ...existingValue, ...value } as T);
    } else {
      LocalStorageHelper.setItem(key, value as T);
    }
  }

  static clearAll() {
    window.localStorage.clear();
  }

  static hasItem(key: string) {
    return window.localStorage.getItem(key) !== null;
  }
}

export default LocalStorageHelper;

/* 
// Usage

import LocalStorageHelper from './localStorageHelper';

LocalStorageHelper.setItem('name', 'John Doe');

const name = LocalStorageHelper.getItem<string>('name');
console.log(name); // John Doe

LocalStorageHelper.setItem('user', { id: 1, name: 'Jane Doe' });

const user = LocalStorageHelper.getItem<{ id: number, name: string }>('user');
console.log(user); // { id: 1, name: 'Jane Doe' }

if (LocalStorageHelper.hasItem('user')) {
    console.log('User data exists');
}

LocalStorageHelper.removeItem('user');

LocalStorageHelper.clearAll();

*/
