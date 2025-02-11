import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainMenu from './Components/MainMenu';
import Settings from './Components/Settings';
import Loader from './Components/Loader'; 
import Profile from './Components/Profile';
import { AudioProvider } from './Components/AudioContext'; 
import { VibrationProvider } from './Components/VibrationContext';
import AttractionScreen from './Components/AttractionScreen';
import QuizScreen from './Components/QuizScreen';
import CollectibleCards from './Components/CollectibleCards';
import { UnlockedCardsProvider } from './Components/UnlockedCardsContext';
import Folder from './Components/Folder';
const Stack = createStackNavigator();

const App = () => {
  const [louderIsEnded, setLouderIsEnded] = useState(false); 

  return (
    <AudioProvider>
      <VibrationProvider>
      <UnlockedCardsProvider>
          <NavigationContainer>
            {!louderIsEnded ? (
              <Loader onEnd={() => setLouderIsEnded(true)} />
            ) : (
              <Stack.Navigator initialRouteName="Profile">
                <Stack.Screen name="MainMenu" component={MainMenu} options={{ headerShown: false }} />
                <Stack.Screen name="Settings" component={Settings} options={{ headerShown: false }} />
                <Stack.Screen name="Folder" component={Folder} options={{ headerShown: false }} />
                <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
                <Stack.Screen name="AttractionScreen" component={AttractionScreen} options={{ headerShown: false }} />
                <Stack.Screen name="QuizScreen" component={QuizScreen} options={{ headerShown: false }} />
                <Stack.Screen name="CollectibleCards" component={CollectibleCards} options={{ headerShown: false }} />
              </Stack.Navigator>
            )}
          </NavigationContainer>
          </UnlockedCardsProvider>
      </VibrationProvider>
    </AudioProvider>
  );
};

export default App;