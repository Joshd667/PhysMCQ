// LocalStorage utilities
export const STORAGE_KEY = 'moodle-questions';

export const saveToLocalStorage = (questions) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
    return true;
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
    return false;
  }
};

export const loadFromLocalStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
    return [];
  }
};
