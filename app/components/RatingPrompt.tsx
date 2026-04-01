import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import * as StoreReview from 'expo-store-review';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import {
  shouldShowRatingPrompt,
  markRatingPromptShown,
  dismissRatingPrompt,
} from '../../utils/ratingPrompt';

interface RatingPromptProps {
  visible: boolean;
  onDismiss: () => void;
}

const GOOGLE_PLAY_URL =
  'https://play.google.com/store/apps/details?id=xyz.jsmglobal.ace';
const APP_STORE_URL =
  'https://apps.apple.com/app/ace-au-citizenship-exam/id6743394564';

const STORE_NAME = Platform.OS === 'ios' ? 'App Store' : 'Google Play';

export default function RatingPrompt({ visible, onDismiss }: RatingPromptProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRate = async () => {
    setIsLoading(true);
    try {
      // Try native in-app review first (smoother UX, no app switch)
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        await StoreReview.requestReview();
        await markRatingPromptShown();
        onDismiss();
        return;
      }

      // Fallback: open store URL in browser
      const url = Platform.OS === 'ios' ? APP_STORE_URL : GOOGLE_PLAY_URL;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        await markRatingPromptShown();
        onDismiss();
      }
    } catch (error) {
      // Final fallback on any error
      try {
        const url = Platform.OS === 'ios' ? APP_STORE_URL : GOOGLE_PLAY_URL;
        await Linking.openURL(url);
      } catch (_) {}
      await markRatingPromptShown();
      onDismiss();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = async () => {
    try {
      await dismissRatingPrompt();
      onDismiss();
    } catch (error) {
      console.error('Error dismissing prompt:', error);
      onDismiss();
    }
  };

  const handleLater = async () => {
    try {
      await markRatingPromptShown();
      onDismiss();
    } catch (error) {
      console.error('Error marking as shown:', error);
      onDismiss();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, Shadows.default]}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleDismiss}
            disabled={isLoading}
          >
            <Ionicons name="close" size={24} color={Colors.gray} />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>⭐</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Enjoying ACE? 🇦🇺</Text>

          {/* Message */}
          <Text style={styles.message}>
            You're doing amazing! 🎉 Your hard work is paying off.{"\n\n"}If ACE has helped you prepare for your citizenship test, we'd love your support! A quick 5-star rating on the {STORE_NAME} helps other future Aussies find us too. ⭐⭐⭐⭐⭐{"\n\n"}It only takes a few seconds and means the world to us! 💛
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.laterButton]}
              onPress={handleLater}
              disabled={isLoading}
            >
              <Text style={styles.laterButtonText}>Later</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.rateButton]}
              onPress={handleRate}
              disabled={isLoading}
            >
              <Ionicons name="star" size={18} color={Colors.white} />
              <Text style={styles.rateButtonText}>
                {isLoading ? 'Opening...' : 'Rate Now'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Dismiss hint */}
          <Text style={styles.hint}>
            You can dismiss this and never see it again by tapping the X button.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    maxWidth: 340,
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    zIndex: 1,
    padding: Spacing.sm,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold as any,
    color: Colors.blue,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: Fonts.sizes.base,
    color: Colors.darkGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  laterButton: {
    backgroundColor: Colors.lightGray,
  },
  laterButtonText: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold as any,
    color: Colors.darkGray,
  },
  rateButton: {
    backgroundColor: Colors.gold,
  },
  rateButtonText: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold as any,
    color: Colors.white,
  },
  hint: {
    fontSize: Fonts.sizes.sm,
    color: Colors.gray,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
