import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Bookmark {
  pdfUri: string;
  page: number;
  timestamp: number;
}

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  bookmarks: Bookmark[];
  addBookmark: (pdfUri: string, page: number) => void;
  removeBookmark: (pdfUri: string) => void;
  getBookmarkPage: (pdfUri: string) => number | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setTheme(savedTheme as 'light' | 'dark');
        }

        const savedBookmarks = await AsyncStorage.getItem('bookmarks');
        if (savedBookmarks) {
          setBookmarks(JSON.parse(savedBookmarks));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const addBookmark = async (pdfUri: string, page: number) => {
    const existingIndex = bookmarks.findIndex(b => b.pdfUri === pdfUri);
    if (existingIndex >= 0) {
      const updatedBookmarks = [...bookmarks];
      updatedBookmarks[existingIndex] = {
        pdfUri,
        page,
        timestamp: Date.now(),
      };
      setBookmarks(updatedBookmarks);
    } else {
      setBookmarks([
        ...bookmarks,
        {
          pdfUri,
          page,
          timestamp: Date.now(),
        },
      ]);
    }
    try {
      await AsyncStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  };

  const removeBookmark = async (pdfUri: string) => {
    const updatedBookmarks = bookmarks.filter(b => b.pdfUri !== pdfUri);
    setBookmarks(updatedBookmarks);
    try {
      await AsyncStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  };

  const getBookmarkPage = (pdfUri: string) => {
    const bookmark = bookmarks.find(b => b.pdfUri === pdfUri);
    return bookmark ? bookmark.page : null;
  };

  return (
    <AppContext.Provider value={{
      theme,
      toggleTheme,
      bookmarks,
      addBookmark,
      removeBookmark,
      getBookmarkPage,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
