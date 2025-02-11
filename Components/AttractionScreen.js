import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  ImageBackground,
  SafeAreaView,
  Alert
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const backgroundImg = require('../assets/background.jpg');
const backArrowImg = require('../assets/back.png');


const GOLD = '#FFD700';
const DARK_RED = '#8B0000';
const ORANGE = '#FF9900';

const secretSpotsMock = [
  { name: 'Secret Spot 1', description: 'Hidden gem #1...' },
  { name: 'Secret Spot 2', description: 'Hidden gem #2...' },
  { name: 'Secret Spot 3', description: 'Hidden gem #3...' },
];

const AttractionScreen = ({ route, navigation }) => {
  const {
    name,
    address,
    lat,
    lng,
    image,
    description,
    secretSpots,
    questCompleted,
    secretUnlocked
  } = route.params || {};

  
  const [allSpotsUnlocked, setAllSpotsUnlocked] = useState(false);

 
  const [selectedSpot, setSelectedSpot] = useState(null);

  
  useEffect(() => {
    if (secretUnlocked === 3) {
      setAllSpotsUnlocked(true);
    }
  }, [secretUnlocked]);

  
  const handleStartTrivia = () => {
    navigation.navigate('QuizScreen', {
      name,
      address,
      lat,
      lng,
      image,
      description,
      secretSpots
    });
  };

  const openSecretSpot = (spot) => {
    if (!allSpotsUnlocked) {
      Alert.alert('Locked!', 'Complete the quiz first to unlock all secret spots!');
      return;
    }
    setSelectedSpot(spot);
  };

  return (
    <ImageBackground source={backgroundImg} style={styles.background}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.overlay} />

        <ScrollView contentContainerStyle={styles.scrollContainer}>

          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('MainMenu')}
            >
              <Image source={backArrowImg} style={styles.backButtonImage} />
            </TouchableOpacity>
          </View>


          <View style={styles.topImageContainer}>
            <Image source={image} style={styles.topImage} />
          </View>

          
          <View style={styles.mapAndButtonRow}>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: lat,
                  longitude: lng,
                  latitudeDelta: 0.1,
                  longitudeDelta: 0.1,
                }}
              >
                <Marker
                  coordinate={{ latitude: lat, longitude: lng }}
                  title={name}
                  description={address}
                />
              </MapView>
            </View>

            <TouchableOpacity style={styles.triviaButton} onPress={handleStartTrivia}>
              <Text style={styles.triviaButtonText}>
                Start Trivia{'\n'}to Open Secret Spots
              </Text>
            </TouchableOpacity>
          </View>

        
          <View style={styles.infoContainer}>
            <Text style={styles.attractionName}>{name}</Text>
            <Text style={styles.attractionAddress}>{address}</Text>
            <Text style={styles.attractionDesc}>{description}</Text>
          </View>         
          <Text style={styles.secretTitle}>Secret Spots:</Text>
          <View style={styles.secretSpotsRow}>
            {(secretSpots || secretSpotsMock).map((spot, i) => (
              <TouchableOpacity
                key={i}
                style={styles.secretSpotButton}
                onPress={() => openSecretSpot(spot)}
              >
                <Text style={styles.secretSpotText}>{spot.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

         
          <Modal visible={!!selectedSpot} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                {selectedSpot && (
                  <>
                    <Text style={styles.modalTitle}>{selectedSpot.name}</Text>
                    <Text style={styles.modalInfo}>{selectedSpot.description}</Text>
                  </>
                )}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedSpot(null)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default AttractionScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: 'cover'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollContainer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  // Header row with back arrow
  headerRow: {
    width: '100%',
    paddingHorizontal: 15,
    paddingTop: 10,
    alignItems: 'flex-start',
  },
  backButton: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    width: 50,
    height: 50,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  backButtonImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  // Top photo container
  topImageContainer: {
    width: '100%',
    height: 220,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 10,
  },
  topImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain'
  },
  mapAndButtonRow: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  mapContainer: {
    width: '48%',
    height: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  triviaButton: {
    width: '48%',
    height: 200,
    backgroundColor: '#8B0000',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  triviaButtonText: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  infoContainer: {
    width: '90%',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 10,
    borderColor:'#FFD700',
    borderWidth:3,
    padding: 15,
    marginBottom: 20,
  },
  attractionName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  attractionAddress: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  attractionDesc: {
    fontSize: 16,
    color: '#333',
  },
  secretTitle: {
    width: '90%',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  secretSpotsRow: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  secretSpotButton: {
    flex: 1,
    backgroundColor: '#8B0000',
    marginHorizontal: 5,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
    alignItems: 'center',
  },
  secretSpotText: {
    color: '#FFD700',    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Modal overlay & container in the app's color scheme
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#8B0000',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFD700',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FFD700',
    textAlign: 'center'
  },
  modalInfo: {
    fontSize: 16,
    marginBottom: 20,
    color: '#FFD700',
    textAlign: 'center'
  },
  closeButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#8B0000'
  },
  closeButtonText: {
    color: '#8B0000',
    fontWeight: 'bold',
    fontSize: 16
  },
});