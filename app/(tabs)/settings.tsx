import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { getSettings, saveSettings, resetAllData, AppSettings, DEFAULT_SETTINGS } from '../../utils/storage';
import RatingPrompt from '../components/RatingPrompt';

const GOOGLE_PLAY_URL =
  'https://play.google.com/store/apps/details?id=xyz.jsmglobal.ace';
const APP_STORE_URL =
  'https://apps.apple.com/app/ace-au-citizenship-exam/id6743394564';
const SHARE_TEXT =
  'I\'m using ACE to study for the Australian Citizenship Test — check it out!';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [showRating, setShowRating] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const s = await getSettings();
    setSettings(s);
  };

  const updateSetting = async (key: keyof AppSettings, value: any) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await saveSettings(updated);
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all your progress, quiz history, and bookmarks. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetAllData();
            Alert.alert('Done', 'All data has been reset.');
          },
        },
      ]
    );
  };

  const handleOpenOfficialSite = () => {
    Linking.openURL('https://immi.homeaffairs.gov.au/citizenship/test-and-interview/our-common-bond');
  };

  const handleRateApp = () => {
    const url = Platform.OS === 'ios' ? APP_STORE_URL : GOOGLE_PLAY_URL;
    Linking.openURL(url).catch(() =>
      Alert.alert('Could not open store', url)
    );
  };

  const handleShareApp = async () => {
    try {
      const { Share } = await import('react-native');
      const url = Platform.OS === 'ios' ? APP_STORE_URL : GOOGLE_PLAY_URL;
      await Share.share({ message: `${SHARE_TEXT}\n${url}`, url });
    } catch (error) {
      console.error('Share failed', error);
    }
  };

  return (
    <>
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Quiz Settings */}
      <Text style={styles.sectionTitle}>Quiz Settings</Text>
      <View style={styles.settingsGroup}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="timer" size={22} color={Colors.blue} />
            <Text style={styles.settingLabel}>Show Timer</Text>
          </View>
          <Switch
            value={settings.showTimer}
            onValueChange={(v) => updateSetting('showTimer', v)}
            trackColor={{ false: Colors.lightGray, true: Colors.lightBlue }}
            thumbColor={settings.showTimer ? Colors.blue : Colors.gray}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="phone-portrait" size={22} color={Colors.blue} />
            <Text style={styles.settingLabel}>Haptic Feedback</Text>
          </View>
          <Switch
            value={settings.hapticEnabled}
            onValueChange={(v) => updateSetting('hapticEnabled', v)}
            trackColor={{ false: Colors.lightGray, true: Colors.lightBlue }}
            thumbColor={settings.hapticEnabled ? Colors.blue : Colors.gray}
          />
        </View>
      </View>

      {/* Display Settings */}
      <Text style={styles.sectionTitle}>Display</Text>
      <View style={styles.settingsGroup}>
        <Text style={styles.fontSizeLabel}>Font Size</Text>
        <View style={styles.fontSizeRow}>
          {(['small', 'medium', 'large'] as const).map((size) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.fontSizeButton,
                settings.fontSize === size && styles.fontSizeButtonActive,
              ]}
              onPress={() => updateSetting('fontSize', size)}
            >
              <Text
                style={[
                  styles.fontSizeButtonText,
                  settings.fontSize === size && styles.fontSizeButtonTextActive,
                  {
                    fontSize: size === 'small' ? 13 : size === 'medium' ? 16 : 19,
                  },
                ]}
              >
                Aa
              </Text>
              <Text
                style={[
                  styles.fontSizeLabel2,
                  settings.fontSize === size && styles.fontSizeButtonTextActive,
                ]}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Resources */}
      <Text style={styles.sectionTitle}>Official Resources</Text>
      <View style={styles.settingsGroup}>
        <TouchableOpacity style={styles.linkRow} onPress={handleOpenOfficialSite}>
          <Ionicons name="globe" size={22} color={Colors.blue} />
          <View style={styles.linkContent}>
            <Text style={styles.linkTitle}>Our Common Bond Booklet</Text>
            <Text style={styles.linkSubtitle}>Official resource from Home Affairs</Text>
          </View>
          <Ionicons name="open-outline" size={18} color={Colors.gray} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() =>
            Linking.openURL(
              'https://immi.homeaffairs.gov.au/citizenship/test-and-interview/prepare-for-test/practice-test-new'
            )
          }
        >
          <Ionicons name="document-text" size={22} color={Colors.blue} />
          <View style={styles.linkContent}>
            <Text style={styles.linkTitle}>Official Practice Test</Text>
            <Text style={styles.linkSubtitle}>Government practice test website</Text>
          </View>
          <Ionicons name="open-outline" size={18} color={Colors.gray} />
        </TouchableOpacity>
      </View>

      {/* Data Management */}
      <Text style={styles.sectionTitle}>Data</Text>
      <View style={styles.settingsGroup}>
        <TouchableOpacity style={styles.linkRow} onPress={handleResetData}>
          <Ionicons name="trash" size={22} color={Colors.error} />
          <View style={styles.linkContent}>
            <Text style={[styles.linkTitle, { color: Colors.error }]}>
              Reset All Progress
            </Text>
            <Text style={styles.linkSubtitle}>
              Clear all quiz history and progress data
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Support Us */}
      <Text style={styles.sectionTitle}>Support Us</Text>
      <View style={styles.settingsGroup}>
        <TouchableOpacity style={styles.linkRow} onPress={() => setShowRating(true)}>
          <Ionicons name="star" size={22} color={Colors.gold} />
          <View style={styles.linkContent}>
            <Text style={styles.linkTitle}>Rate ACE</Text>
            <Text style={styles.linkSubtitle}>
              Leave us a quick review on the {Platform.OS === 'ios' ? 'App Store' : 'Play Store'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.gray} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.linkRow} onPress={handleShareApp}>
          <Ionicons name="share-social" size={22} color={Colors.blue} />
          <View style={styles.linkContent}>
            <Text style={styles.linkTitle}>Share with a friend</Text>
            <Text style={styles.linkSubtitle}>
              Help others passing the citizenship test
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.gray} />
        </TouchableOpacity>
      </View>

      {/* About */}
      <Text style={styles.sectionTitle}>About</Text>
      <View style={styles.settingsGroup}>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.aboutContent}>
          <View style={styles.disclaimerBanner}>
            <Text style={styles.disclaimerBannerTitle}>⚠️ Unofficial App — Disclaimer</Text>
            <Text style={styles.disclaimerBannerText}>
              This app is NOT affiliated with, endorsed by, or connected to the
              Australian Government or the Department of Home Affairs.
            </Text>
          </View>
          <Text style={[styles.aboutText, { marginTop: Spacing.sm }]}>
            This is an independent study aid based on the publicly available
            "Australian Citizenship: Our Common Bond" booklet published by the
            Department of Home Affairs.
          </Text>
          <TouchableOpacity
            style={styles.sourceLink}
            onPress={() => Linking.openURL('https://immi.homeaffairs.gov.au/citizenship/test-and-interview/our-common-bond')}
          >
            <Ionicons name="globe-outline" size={14} color={Colors.blue} />
            <Text style={styles.sourceLinkText}>Official source: immi.homeaffairs.gov.au</Text>
            <Ionicons name="open-outline" size={13} color={Colors.blue} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contact Us */}
      <Text style={styles.sectionTitle}>Support</Text>
      <View style={styles.settingsGroup}>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => Linking.openURL('mailto:support@jsmglobal.xyz')}
        >
          <Ionicons name="mail" size={22} color={Colors.blue} />
          <View style={styles.linkContent}>
            <Text style={styles.linkTitle}>Contact Us</Text>
            <Text style={styles.linkSubtitle}>support@jsmglobal.xyz</Text>
          </View>
          <Ionicons name="open-outline" size={18} color={Colors.gray} />
        </TouchableOpacity>
      </View>

      <View style={{ height: 48 }} />
    </ScrollView>
    <RatingPrompt visible={showRating} onDismiss={() => setShowRating(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  settingsGroup: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.small,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingLabel: {
    fontSize: Fonts.sizes.md,
    color: Colors.charcoal,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.lightGray,
    marginVertical: Spacing.xs,
  },
  fontSizeLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.darkGray,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  fontSizeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  fontSizeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.lightGray,
  },
  fontSizeButtonActive: {
    borderColor: Colors.blue,
    backgroundColor: Colors.lightBlue,
  },
  fontSizeButtonText: {
    color: Colors.darkGray,
    fontWeight: '600',
  },
  fontSizeButtonTextActive: {
    color: Colors.blue,
  },
  fontSizeLabel2: {
    fontSize: 11,
    color: Colors.gray,
    marginTop: 4,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.charcoal,
    fontWeight: '500',
  },
  linkSubtitle: {
    fontSize: Fonts.sizes.xs,
    color: Colors.gray,
    marginTop: 2,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  aboutLabel: {
    fontSize: Fonts.sizes.md,
    color: Colors.charcoal,
  },
  aboutValue: {
    fontSize: Fonts.sizes.md,
    color: Colors.gray,
  },
  aboutContent: {
    paddingVertical: Spacing.sm,
  },
  aboutText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.darkGray,
    lineHeight: 20,
  },
  disclaimerBanner: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
    marginBottom: 4,
  },
  disclaimerBannerTitle: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    color: '#856404',
    marginBottom: 4,
  },
  disclaimerBannerText: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 18,
  },
  sourceLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  sourceLinkText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.blue,
    fontWeight: '600',
    flex: 1,
  },
});
