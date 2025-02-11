import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import { useAudio } from './AudioContext'; 
import { useVibration } from './VibrationContext'; 

// Screen dimensions
const { width, height } = Dimensions.get('window');

// Colors matching your snippet
const GOLD = '#FFD700';
const DARK_RED = '#8B0000';

const Settings = ({ navigation }) => {
  const { isMusicPlaying, setIsMusicPlaying, volume, setVolume } = useAudio();
  const { vibrationOn, setVibrationOn } = useVibration();
  const [localVolume, setLocalVolume] = useState(volume);

  const handleVolumeChange = (delta) => {
    const newVolume = Math.max(0, Math.min(1, localVolume + delta));
    setLocalVolume(newVolume);
    setVolume(newVolume);
  };

  useEffect(() => {
    setVolume(localVolume);
  }, [localVolume, setVolume]);

  return (
    <ImageBackground
      source={require('../assets/background.jpg')}
      style={styles.background}
    >
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Settings</Text>

          {/* Music On/Off row */}
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Turn Music On/Off</Text>
            <Switch
              value={isMusicPlaying}
              onValueChange={setIsMusicPlaying}
              trackColor={{ false: '#767577', true: GOLD }}
              thumbColor={isMusicPlaying ? DARK_RED : '#4E342E'}
            />
          </View>

          {/* Music Volume row */}
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>
              Music Volume: {Math.round(localVolume * 100)}%
            </Text>
            <View style={styles.volumeContainer}>
              <TouchableOpacity
                onPress={() => handleVolumeChange(-0.1)}
                style={styles.roundButton}
              >
                <Text style={styles.roundButtonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleVolumeChange(0.1)}
                style={styles.roundButton}
              >
                <Text style={styles.roundButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Vibration On/Off row */}
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Enable Vibration</Text>
            <Switch
              value={vibrationOn}
              onValueChange={setVibrationOn}
              trackColor={{ false: '#767577', true: GOLD }}
              thumbColor={vibrationOn ? DARK_RED : '#4E342E'}
            />
          </View>

          {/* Return to Menu button */}
          <TouchableOpacity onPress={navigation.goBack} style={styles.exitButton}>
            <Text style={styles.exitButtonText}>Return to Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};
/* ========== STYLES (Dimension-based by width) ========== */
const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  
  },
  safeArea: {
    flex: 1
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: width * 0.01
  },
  title: {
    fontSize: width * 0.07,   // dimension-based font size
    fontWeight: 'bold',
    marginBottom: width * 0.06, // spacing also from width
    color: GOLD,
    textAlign: 'center'
  },
  settingRow: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)', // semi-transparent
    borderRadius: width * 0.03, 
    borderWidth: width * 0.005,   // ~2px if width = 400
    borderColor: GOLD,
    paddingVertical: width * 0.03,
    paddingHorizontal: width * 0.04,
    marginVertical: width * 0.03
  },
  settingText: {
    flex: 1,
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: GOLD
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  roundButton: {
    width: width * 0.1,
    height: width * 0.1,
    backgroundColor: DARK_RED,
    borderRadius: width * 0.02,
    borderWidth: width * 0.005,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: width * 0.03
  },
  roundButtonText: {
    color: GOLD,
    fontSize: width * 0.05,
    fontWeight: 'bold'
  },
  exitButton: {
    width: '90%',
    marginTop: width * 0.04,
    backgroundColor: DARK_RED,
    borderRadius: width * 0.04,
    borderWidth: width * 0.005,
    borderColor: GOLD,
    paddingVertical: width * 0.04,
    alignItems: 'center'
  },
  exitButtonText: {
    color: GOLD,
    fontWeight: 'bold',
    fontSize: width * 0.05
  }
});
export default Settings;