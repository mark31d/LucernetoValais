import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// The context that holds which collectible card titles are unlocked
const UnlockedCardsContext = createContext();

// A helper hook to use the context more conveniently
export function useUnlockedCards() {
  return useContext(UnlockedCardsContext);
}

export function UnlockedCardsProvider({ children }) {
  // We store the titles of unlocked cards in an array
  const [unlockedTitles, setUnlockedTitles] = useState([]);

  // Load previously saved unlocked card titles from AsyncStorage when the provider mounts
  useEffect(() => {
    async function loadUnlockedTitles() {
      try {
        const saved = await AsyncStorage.getItem('unlockedTitles');
        if (saved) {
          // Convert JSON string back into an array
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setUnlockedTitles(parsed);
          }
        }
      } catch (error) {
        console.log('Error reading unlockedTitles from AsyncStorage:', error);
      }
    }
    loadUnlockedTitles();
  }, []);

  // Save the current list of unlocked titles to AsyncStorage
  const saveUnlockedTitles = async (titlesArray) => {
    try {
      await AsyncStorage.setItem('unlockedTitles', JSON.stringify(titlesArray));
    } catch (error) {
      console.log('Error writing unlockedTitles to AsyncStorage:', error);
    }
  };

  // A function to unlock a card by its "title"
  const unlockCardByTitle = (title) => {
    setUnlockedTitles((prev) => {
      // If already unlocked, do nothing
      if (prev.includes(title)) {
        return prev;
      }
      const newArr = [...prev, title];
      // Save the updated array to AsyncStorage
      saveUnlockedTitles(newArr);
      return newArr;
    });
  };

  // We provide two things:
  // 1) The array of unlocked titles
  // 2) The function to unlock a card
  const value = {
    unlockedTitles,
    unlockCardByTitle
  };

  return (
    <UnlockedCardsContext.Provider value={value}>
      {children}
    </UnlockedCardsContext.Provider>
  );
}