import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import MapView, {Marker, Region} from 'react-native-maps';
import {useTheme} from '../../contexts/ThemeContext';
import {getResponsiveValue} from '../../utils/responsive';
import fontVariants from '../../utils/fonts';
import {
  requestLocationPermission,
  getCurrentLocation,
  getLocationName,
  LocationCoordinates,
} from '../../utils/locationPermisson';
import Icon from '../atoms/icons';

interface LocationData {
  name: string;
  latitude: number;
  longitude: number;
}

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (location: LocationData) => void;
  initialLocation?: LocationData | null;
  title?: string;
}

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  onClose,
  onConfirm,
  initialLocation,
  title = 'Select Location',
}) => {
  const {colors} = useTheme();
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates>(
    initialLocation || {
      latitude: 33.8938, // Default to Beirut, Lebanon
      longitude: 35.5018,
    },
  );
  const [locationName, setLocationName] = useState<string>(
    initialLocation?.name || '',
  );
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const [region, setRegion] = useState<Region>({
    latitude: selectedLocation.latitude,
    longitude: selectedLocation.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    if (visible && !initialLocation) {
      getCurrentLocationAsync();
    }
  }, [visible, initialLocation]);

  const getCurrentLocationAsync = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Location permission is needed to show your current location.',
        );
        return;
      }

      setLoading(true);
      const location = await getCurrentLocation();
      const name = await getLocationName(location.latitude, location.longitude);

      setSelectedLocation(location);
      setLocationName(name);
      setRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get current location.');
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = async (event: any) => {
    const {latitude, longitude} = event.nativeEvent.coordinate;

    setLoading(true);
    try {
      const name = await getLocationName(latitude, longitude);
      setSelectedLocation({latitude, longitude});
      setLocationName(name);
    } catch (error) {
      console.error('Error getting location name:', error);
      setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async () => {
    if (!searchText.trim()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          searchText,
        )}&key=AIzaSyB4AlKwHaqGiQthHWz4_09V0fKLO_l6fUc`,
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const location = result.geometry.location;

        setSelectedLocation({
          latitude: location.lat,
          longitude: location.lng,
        });
        setLocationName(result.formatted_address);
        setRegion({
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setSearchText(''); // Clear search after successful search
      } else {
        Alert.alert(
          'Location Not Found',
          'Please try a different search term.',
        );
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert(
        'Search Error',
        'Failed to search for location. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedLocation && locationName) {
      onConfirm({
        name: locationName,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      });
      onClose();
    }
  };

  const handleClose = () => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
      setLocationName(initialLocation.name);
      setRegion({
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
    setSearchText('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={handleClose}>
      <View style={[styles.container, {backgroundColor: colors.background}]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {backgroundColor: colors.card, borderBottomColor: colors.border},
          ]}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Icon name="clear" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text
            style={[styles.title, {color: colors.text}, fontVariants.heading3]}>
            {title}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Section */}
        <View style={[styles.searchContainer, {backgroundColor: colors.card}]}>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                },
                fontVariants.body,
              ]}
              placeholder="Search for a location..."
              placeholderTextColor={colors.border}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={[
                styles.searchButton,
                {backgroundColor: colors.primary},
                (!searchText.trim() || loading) && styles.disabledButton,
              ]}
              onPress={handleSearchSubmit}
              disabled={loading || !searchText.trim()}>
              <Icon name="search" size={20} color={colors.card} />
            </TouchableOpacity>
          </View>
          <Text
            style={[
              styles.searchHint,
              {color: colors.border},
              fontVariants.caption,
            ]}>
            Search for places like "Beirut", "Times Square", or tap on the map
          </Text>
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={true}>
            <Marker
              coordinate={selectedLocation}
              title="Selected Location"
              description={locationName}
            />
          </MapView>

          {/* Current Location Button */}
          <TouchableOpacity
            style={[
              styles.currentLocationButton,
              {backgroundColor: colors.primary},
            ]}
            onPress={getCurrentLocationAsync}
            disabled={loading}>
            <Icon name="location-on" size={24} color={colors.card} />
          </TouchableOpacity>

          {/* Loading Overlay */}
          {loading && (
            <View
              style={[
                styles.loadingOverlay,
                {backgroundColor: 'rgba(0,0,0,0.3)'},
              ]}>
              <View
                style={[
                  styles.loadingContainer,
                  {backgroundColor: colors.card},
                ]}>
                <Text
                  style={[
                    styles.loadingText,
                    {color: colors.text},
                    fontVariants.body,
                  ]}>
                  Loading location...
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Selected Location Display */}
        <View
          style={[
            styles.selectedLocationContainer,
            {backgroundColor: colors.card},
          ]}>
          <Icon name="location-on" size={20} color={colors.primary} />
          <Text
            style={[
              styles.selectedLocationText,
              {color: colors.text},
              fontVariants.body,
            ]}
            numberOfLines={2}>
            {locationName || 'Tap on the map to select a location'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={[styles.buttonContainer, {backgroundColor: colors.card}]}>
          <TouchableOpacity
            style={[styles.cancelButton, {borderColor: colors.border}]}
            onPress={handleClose}>
            <Text
              style={[
                styles.cancelButtonText,
                {color: colors.text},
                fontVariants.button,
              ]}>
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              {backgroundColor: colors.primary},
              (!selectedLocation || !locationName) && styles.disabledButton,
            ]}
            onPress={handleConfirm}
            disabled={!selectedLocation || !locationName || loading}>
            <Text
              style={[
                styles.confirmButtonText,
                {color: colors.card},
                fontVariants.button,
              ]}>
              {loading ? 'Loading...' : 'Confirm'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getResponsiveValue(16),
    paddingVertical: getResponsiveValue(12),
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: getResponsiveValue(8),
  },
  title: {
    textAlign: 'center',
  },
  placeholder: {
    width: getResponsiveValue(40),
  },
  searchContainer: {
    paddingHorizontal: getResponsiveValue(16),
    paddingVertical: getResponsiveValue(12),
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: getResponsiveValue(8),
    paddingHorizontal: getResponsiveValue(12),
    paddingVertical: getResponsiveValue(10),
    marginRight: getResponsiveValue(8),
  },
  searchButton: {
    paddingHorizontal: getResponsiveValue(12),
    paddingVertical: getResponsiveValue(10),
    borderRadius: getResponsiveValue(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchHint: {
    marginTop: getResponsiveValue(8),
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: getResponsiveValue(20),
    right: getResponsiveValue(20),
    width: getResponsiveValue(50),
    height: getResponsiveValue(50),
    borderRadius: getResponsiveValue(25),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    paddingHorizontal: getResponsiveValue(20),
    paddingVertical: getResponsiveValue(12),
    borderRadius: getResponsiveValue(8),
  },
  loadingText: {
    textAlign: 'center',
  },
  selectedLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getResponsiveValue(16),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  selectedLocationText: {
    flex: 1,
    marginLeft: getResponsiveValue(8),
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: getResponsiveValue(16),
    gap: getResponsiveValue(12),
  },
  cancelButton: {
    flex: 1,
    paddingVertical: getResponsiveValue(12),
    borderRadius: getResponsiveValue(8),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: getResponsiveValue(12),
    borderRadius: getResponsiveValue(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButtonText: {},
  confirmButtonText: {},
});

export default LocationPickerModal;
