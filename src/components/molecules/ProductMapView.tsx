import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import MapView, {Marker, Region} from 'react-native-maps';
import {useTheme} from '../../contexts/ThemeContext';
import {getResponsiveValue} from '../../utils/responsive';
import fontVariants from '../../utils/fonts';
import Icon from '../atoms/icons';
import {Location} from '../../types/product';

interface ProductMapViewProps {
  location: Location;
  title?: string;
}

const ProductMapView: React.FC<ProductMapViewProps> = ({location, title}) => {
  const {colors} = useTheme();

  const region: Region = {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const openInMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;

    Alert.alert(
      'Open in Maps',
      'Would you like to open this location in Google Maps?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Open',
          onPress: async () => {
            try {
              const supported = await Linking.canOpenURL(url);
              if (supported) {
                await Linking.openURL(url);
              } else {
                Alert.alert('Error', 'Cannot open maps application');
              }
            } catch (error) {
              console.error('Error opening maps:', error);
              Alert.alert('Error', 'Failed to open maps application');
            }
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.card}]}>
      <View style={styles.header}>
        <Text
          style={[
            styles.sectionTitle,
            {color: colors.text},
            fontVariants.bodyBold,
          ]}>
          Location
        </Text>
        <TouchableOpacity
          style={[styles.openMapsButton, {borderColor: colors.primary}]}
          onPress={openInMaps}>
          <Icon name="location-on" size={16} color={colors.primary} />
          <Text
            style={[
              styles.openMapsText,
              {color: colors.primary},
              fontVariants.caption,
            ]}>
            Open in Maps
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.locationInfo}>
        <Icon name="location-on" size={20} color={colors.primary} />
        <Text
          style={[
            styles.locationText,
            {color: colors.text},
            fontVariants.body,
          ]}>
          {location.name}
        </Text>
      </View>

      <View style={[styles.mapContainer, {borderColor: colors.border}]}>
        <MapView
          style={styles.map}
          region={region}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
          onPress={openInMaps}
          pointerEvents="box-only">
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title={title || 'Product Location'}
            description={location.name}
          />
        </MapView>

        {/* Overlay to make the entire map clickable */}
        <TouchableOpacity
          style={styles.mapOverlay}
          onPress={openInMaps}
          activeOpacity={0.7}>
          <View style={[styles.tapHint, {backgroundColor: colors.background}]}>
            <Text
              style={[
                styles.tapHintText,
                {color: colors.text},
                fontVariants.caption,
              ]}>
              Tap to open in maps
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: getResponsiveValue(24),
    borderRadius: getResponsiveValue(12),
    padding: getResponsiveValue(16),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveValue(12),
  },
  sectionTitle: {},
  openMapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getResponsiveValue(8),
    paddingVertical: getResponsiveValue(4),
    borderRadius: getResponsiveValue(6),
    borderWidth: 1,
  },
  openMapsText: {
    marginLeft: getResponsiveValue(4),
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveValue(12),
  },
  locationText: {
    marginLeft: getResponsiveValue(8),
    flex: 1,
  },
  mapContainer: {
    height: getResponsiveValue(200),
    borderRadius: getResponsiveValue(8),
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: getResponsiveValue(8),
  },
  tapHint: {
    paddingHorizontal: getResponsiveValue(8),
    paddingVertical: getResponsiveValue(4),
    borderRadius: getResponsiveValue(4),
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  tapHintText: {
    fontSize: getResponsiveValue(12),
  },
});

export default ProductMapView;
