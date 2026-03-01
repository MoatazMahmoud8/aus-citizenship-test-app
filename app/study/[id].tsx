import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { studySections } from '../../data/studyMaterials';
import { StudySection } from '../../constants/types';
import { markStudySectionComplete } from '../../utils/storage';

export default function StudyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  const section = studySections.find((s) => s.id === id);

  useEffect(() => {
    if (section) {
      markStudySectionComplete(section.id);
    }
  }, [section]);

  if (!section) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Study section not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.errorLink}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleSection = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: section.color }]}>
        <Ionicons name={section.icon as any} size={48} color={Colors.white} />
        <Text style={styles.headerTitle}>{section.title}</Text>
        <Text style={styles.headerSubtitle}>{section.subtitle}</Text>
      </View>

      {/* Key Facts Quick Reference */}
      <View style={styles.keyFactsCard}>
        <Text style={styles.keyFactsTitle}>🔑 Key Facts to Remember</Text>
        {section.keyFacts.map((fact, index) => (
          <View key={index} style={styles.keyFactRow}>
            <Text style={styles.keyFactBullet}>•</Text>
            <Text style={styles.keyFactText}>{fact}</Text>
          </View>
        ))}
      </View>

      {/* Content Sections */}
      <Text style={styles.sectionTitle}>📖 Detailed Study Content</Text>
      {section.content.map((content, index) => (
        <View key={index} style={styles.contentCard}>
          <TouchableOpacity
            style={styles.contentHeader}
            onPress={() => toggleSection(index)}
            activeOpacity={0.7}
          >
            <Text style={styles.contentHeading}>{content.heading}</Text>
            <Ionicons
              name={expandedSection === index ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={Colors.gray}
            />
          </TouchableOpacity>

          {expandedSection === index && (
            <View style={styles.contentBody}>
              <Text style={styles.bodyText}>{content.body}</Text>

              {content.bulletPoints && content.bulletPoints.length > 0 && (
                <View style={styles.bulletList}>
                  {content.bulletPoints.map((point, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.bulletText}>{point}</Text>
                    </View>
                  ))}
                </View>
              )}

              {content.importantNote && (
                <View style={styles.importantNote}>
                  <Ionicons
                    name="alert-circle"
                    size={20}
                    color={Colors.error}
                  />
                  <Text style={styles.importantNoteText}>
                    {content.importantNote}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      ))}

      {/* Practice Button */}
      <View style={styles.practiceSection}>
        <TouchableOpacity
          style={[styles.practiceButton, { backgroundColor: section.color }]}
          onPress={() =>
            router.push(
              `/quiz?mode=category&category=${section.category}`
            )
          }
          activeOpacity={0.8}
        >
          <Ionicons name="play-circle" size={24} color={Colors.white} />
          <Text style={styles.practiceButtonText}>
            Practice {section.title} Questions
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: Fonts.sizes.lg,
    color: Colors.gray,
    marginBottom: Spacing.md,
  },
  errorLink: {
    fontSize: Fonts.sizes.md,
    color: Colors.blue,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  headerTitle: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: 'bold',
    color: Colors.white,
    marginTop: Spacing.md,
  },
  headerSubtitle: {
    fontSize: Fonts.sizes.md,
    color: 'rgba(255,255,255,0.85)',
    marginTop: Spacing.xs,
  },
  keyFactsCard: {
    margin: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.lightGold,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E6D295',
  },
  keyFactsTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: 'bold',
    color: Colors.charcoal,
    marginBottom: Spacing.md,
  },
  keyFactRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  keyFactBullet: {
    fontSize: Fonts.sizes.md,
    color: Colors.darkGray,
    marginRight: Spacing.sm,
    fontWeight: 'bold',
  },
  keyFactText: {
    flex: 1,
    fontSize: Fonts.sizes.md,
    color: Colors.darkGray,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: 'bold',
    color: Colors.charcoal,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  contentCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.small,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  contentHeading: {
    flex: 1,
    fontSize: Fonts.sizes.md,
    fontWeight: 'bold',
    color: Colors.charcoal,
  },
  contentBody: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  bodyText: {
    fontSize: Fonts.sizes.md,
    color: Colors.darkGray,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  bulletList: {
    marginBottom: Spacing.md,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  bullet: {
    fontSize: Fonts.sizes.md,
    color: Colors.blue,
    marginRight: Spacing.sm,
    fontWeight: 'bold',
  },
  bulletText: {
    flex: 1,
    fontSize: Fonts.sizes.md,
    color: Colors.darkGray,
    lineHeight: 22,
  },
  importantNote: {
    flexDirection: 'row',
    backgroundColor: '#FFF3F3',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  importantNoteText: {
    flex: 1,
    fontSize: Fonts.sizes.sm,
    color: Colors.error,
    lineHeight: 20,
    fontWeight: '600',
  },
  practiceSection: {
    padding: Spacing.lg,
  },
  practiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    ...Shadows.medium,
  },
  practiceButtonText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: 'bold',
    color: Colors.white,
  },
});
