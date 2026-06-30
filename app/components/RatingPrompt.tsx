import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  Shadows,
} from '../../constants/theme';
import {
  markRatingPromptShown,
  dismissRatingPrompt,
  markRated,
} from '../../utils/ratingPrompt';

interface RatingPromptProps {
  visible: boolean;
  onDismiss: () => void;
}

const GOOGLE_PLAY_URL =
  'https://play.google.com/store/apps/details?id=xyz.jsmglobal.ace';
const APP_STORE_URL =
  'https://apps.apple.com/app/ace-au-citizenship-exam/id6743394564';
const FEEDBACK_EMAIL = 'support@jsmglobal.xyz';
const STORE_NAME = Platform.OS === 'ios' ? 'App Store' : 'Google Play';

type Step = 'ask' | 'happy' | 'sad';

export default function RatingPrompt({ visible, onDismiss }: RatingPromptProps) {
  const [step, setStep] = useState<Step>('ask');
  const [busy, setBusy] = useState(false);

  // Reset whenever the modal is re-opened so we always start at step 1.
  useEffect(() => {
    if (visible) setStep('ask');
  }, [visible]);

  const close = async (saveShown = true) => {
    if (saveShown) await markRatingPromptShown();
    onDismiss();
  };

  const handleEnjoyingYes = () => setStep('happy');
  const handleEnjoyingNo = () => setStep('sad');

  const handleRate = async () => {
    setBusy(true);
    try {
      const url = Platform.OS === 'ios' ? APP_STORE_URL : GOOGLE_PLAY_URL;
      if (await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
      }
      await markRated();
      onDismiss();
    } catch (error) {
      console.error('Error opening store:', error);
      onDismiss();
    } finally {
      setBusy(false);
    }
  };

  const handleSendFeedback = async () => {
    setBusy(true);
    try {
      const subject = encodeURIComponent('ACE app feedback');
      const body = encodeURIComponent(
        "Hi! Here's what could be improved in the ACE app:\n\n",
      );
      const url = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;
      if (await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
      }
      await dismissRatingPrompt();
      onDismiss();
    } catch (error) {
      console.error('Error opening mail:', error);
      onDismiss();
    } finally {
      setBusy(false);
    }
  };

  const handleNeverAsk = async () => {
    await dismissRatingPrompt();
    onDismiss();
  };

  // ---- Per-step content ----
  const content = (() => {
    if (step === 'ask') {
      return {
        icon: '👋',
        title: 'Enjoying ACE?',
        message:
          'Quick question — how is the Australian Citizenship Exam app working for you?',
        primary: { label: '😍 Yes, love it!', onPress: handleEnjoyingYes },
        secondary: { label: '😐 Could be better', onPress: handleEnjoyingNo },
      };
    }
    if (step === 'happy') {
      return {
        icon: '⭐',
        title: 'Awesome!',
        message: `Would you mind taking 10 seconds to leave us a 5-star rating on the ${STORE_NAME}? It really helps other learners discover the app.`,
        primary: {
          label: busy ? 'Opening…' : `Rate Us`,
          onPress: handleRate,
          icon: 'star' as const,
        },
        secondary: { label: 'Maybe later', onPress: () => close(true) },
      };
    }
    // sad
    return {
      icon: '💬',
      title: 'Sorry to hear that',
      message:
        "We'd love to hear what we can improve. Send us a quick note and we'll do our best to fix it.",
      primary: {
        label: busy ? 'Opening…' : 'Send feedback',
        onPress: handleSendFeedback,
        icon: 'mail' as const,
      },
      secondary: { label: 'No thanks', onPress: handleNeverAsk },
    };
  })();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => close(true)}
    >
      <View style={styles.overlay}>
          <View style={[styles.card, Shadows.large]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => close(true)}
            disabled={busy}
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={24} color={Colors.gray} />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{content.icon}</Text>
          </View>

          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.message}>{content.message}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={content.secondary.onPress}
              disabled={busy}
            >
              <Text style={styles.secondaryButtonText}>
                {content.secondary.label}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={content.primary.onPress}
              disabled={busy}
            >
              {'icon' in content.primary && content.primary.icon ? (
                <Ionicons
                  name={content.primary.icon}
                  size={18}
                  color={Colors.white}
                />
              ) : null}
              <Text style={styles.primaryButtonText}>
                {content.primary.label}
              </Text>
            </TouchableOpacity>
          </View>

          {step === 'ask' && (
            <Text style={styles.hint}>
              Tap the X to dismiss. We won't ask again for a while.
            </Text>
          )}
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
    maxWidth: 360,
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
    fontWeight: '700',
    color: Colors.blue,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: Fonts.sizes.md,
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
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  secondaryButton: {
    backgroundColor: Colors.lightGray,
  },
  secondaryButtonText: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.darkGray,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.gold,
  },
  primaryButtonText: {
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
    flexShrink: 1,
  },
  hint: {
    fontSize: Fonts.sizes.sm,
    color: Colors.gray,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
