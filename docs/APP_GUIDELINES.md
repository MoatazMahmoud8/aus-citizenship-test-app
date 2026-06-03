# ACE Aus Citizenship App - Content & Format Guidelines

**Last Updated**: June 2026  
**Version**: 1.0  
**Status**: Active

---

## 📖 Content Alignment: "Our Common Bond"

All content in the ACE app must align with the official Australian Citizenship resource booklet: **"Australian Citizenship: Our Common Bond"** published by the Department of Home Affairs.

### Official Source
- **Publisher**: Department of Home Affairs, Australian Government
- **Official URL**: https://immi.homeaffairs.gov.au/citizenship/test-and-interview/our-common-bond
- **Purpose**: Guide and resource for Australian Citizenship Test preparation
- **Status**: This app is NOT affiliated with, endorsed by, or connected to the Australian Government

---

## 🎯 Question Format Standards

### Question Structure
Every question in the question bank MUST follow this structure:

```typescript
{
  id: number;                        // Unique identifier
  question: string;                  // Question text (clear, concise)
  options: string[];                 // 3-4 answer options
  correctAnswer: number;             // Index of correct option (0-indexed)
  category: string;                  // Category: 'australian_values', 'australia_and_its_people', 'democratic_beliefs', 'government_and_law'
  isValuesQuestion?: boolean;        // TRUE if answer MUST be 100% correct
  explanation: string;               // Why the answer is correct (educate user)
  source: string;                    // Must reference "Our Common Bond"
  recallCount?: number;              // (Optional) How many times this Q appears in real exams
}
```

### Question Writing Rules

#### 1. **Alignment with Our Common Bond**
- ✅ Questions must be based on official content from "Our Common Bond" booklet
- ✅ Explanations must reference the official source
- ✅ Format: `source: 'Our Common Bond - [Topic]'`
- ❌ Never create questions without official source backing
- ❌ Never invent exam format not mentioned in official materials

#### 2. **Question Text Requirements**
- Exactly match exam format (20 multiple-choice questions)
- Use clear, simple English (non-native speakers take this test)
- Max 2 lines per question
- Do not include trick questions or misleading wording
- Format: "[Statement/phrase]?" or "Which of these...?"

#### 3. **Answer Options Requirements**
- Provide exactly 3 options (matches official test format)
- One option is unambiguously correct
- Two distractor options are plausible but incorrect
- NO "all of the above" or "none of the above" options
- Order: Don't always put correct answer first, randomize naturally

#### 4. **Explanation Standards**
- Clear, educational explanation of why answer is correct
- Reference specific sections from "Our Common Bond"
- Simple language appropriate for ESL learners
- 1-2 sentences max
- Must teach, not just confirm answer

#### 5. **Category Classification**
| Category | Source | Example Topic |
|----------|--------|---|
| `australian_values` | Our Common Bond - Values | Rule of Law, Equality, Fairness |
| `australia_and_its_people` | Our Common Bond - Australia | Geography, Symbols, History |
| `democratic_beliefs` | Our Common Bond - Democracy | Participation, Rights, Freedoms |
| `government_and_law` | Our Common Bond - Government | Parliament, Courts, Laws |

#### 6. **Special Rules for Values Questions**
- Flag with `isValuesQuestion: true`
- Test if candidate MUST get ALL 5 values questions correct
- Answer cannot have ambiguous interpretation
- Must clearly distinguish Australian values from other systems

---

## 🏷️ Metadata & Attribution

### Source Attribution Format
```
source: "Our Common Bond - [Section Name]"
```

**Examples**:
- `"Our Common Bond - Australian Values"`
- `"Our Common Bond - Australia and Its People"`
- `"Our Common Bond - Democratic Beliefs and Rights"`
- `"Our Common Bond - Government and Law"`

### Recall Count Tracking
For frequently-asked questions in practice mode:
```typescript
recallCount: 1  // This question appears in real exams
```

This helps the "Last Minute Study" feature surface high-frequency questions.

---

## 🎨 User Interface Format Standards

### Homepage Update Format
When releasing monthly updates:
```
Questions last updated: [Month] 2026
Example: "Questions last updated: June 2026"
```

### Welcome Banner
```
🎯 Welcome, Future Citizen!
Prepare for your Australian Citizenship Test with [X] real exam-style questions.
```

### Section Headers
- Use consistent emoji + title format
- Icons must relate to content category
- Examples:
  - ❤️ Australian Values
  - 🌏 Australia & Its People  
  - 🛡️ Democratic Beliefs
  - 🏛️ Government & Law
  - ⚡ Last Minute Study

### Color Standards
| Element | Color | Usage |
|---------|-------|-------|
| Australian Values | `#DC3545` (Red) | Critical questions (5/5 required) |
| Australia | `#002B7F` (Blue) | Standard questions |
| Democratic | `#00843D` (Green) | Standard questions |
| Government | `#B8860B` (Gold) | Standard questions |
| Highlights | `#FFD700` (Gold Star) | Premium content |
| Action Buttons | `#00843D` (Green) | Primary CTAs |

### Last Minute Study Section
- Highlight most frequently-asked questions
- Show `recallCount` to build confidence
- Direct users to practice mode for focused review
- Position above "Last Updated" but after study categories

---

## ✅ Content Verification Checklist

Before releasing ANY update, verify:

- [ ] All questions have official "Our Common Bond" source attribution
- [ ] No questions contradict official materials
- [ ] Questions follow the 3-option format (no more, no fewer)
- [ ] Explanations are educative and simple
- [ ] Category assignments are accurate
- [ ] No duplicate questions exist
- [ ] Values questions (5 total) are flagged with `isValuesQuestion: true`
- [ ] High-frequency questions have `recallCount: 1`
- [ ] Homepage "Last Updated" date matches release month/year
- [ ] All links to official sources work correctly
- [ ] Compliance with Google Play Store policies

---

## 📅 Monthly Release Requirements

### Before Every Monthly Update
1. Update `app/(tabs)/index.tsx` - change month in `lastUpdatedDate`
2. Review all questions for accuracy against latest "Our Common Bond"
3. Add any new questions discovered in recent test updates
4. Update `CHANGELOG.md` with month and changes
5. Test on real device (Android + iOS if possible)
6. Verify all external links still work

### Release Announcement Format
```
June 2026 Update - ACE Aus Citizenship App

✅ [X] questions reviewed and verified
✅ [X] new questions added
✅ All content aligned with "Our Common Bond"
✅ Ready for Australian Citizenship Test

Download now from Google Play & App Store
```

---

## 🚀 Quality Metrics

Track these metrics monthly:

| Metric | Target | Current |
|--------|--------|---------|
| Total Questions | 150-200 | TBD |
| Coverage: Australian Values | 25-30 | TBD |
| Coverage: Australia & People | 35-40 | TBD |
| Coverage: Democratic Beliefs | 35-40 | TBD |
| Coverage: Government & Law | 35-40 | TBD |
| Values Questions (must get all) | 5 | TBD |
| Average User Score (target) | 75%+ | TBD |

---

## 🔗 Important Links

- **Official Test Info**: https://immi.homeaffairs.gov.au/citizenship/test-and-interview
- **Our Common Bond PDF**: https://immi.homeaffairs.gov.au/citizenship/test-and-interview/our-common-bond
- **Privacy Policy**: https://jsmglobal.xyz/privacy.html
- **Support Email**: support@jsmglobal.xyz

---

## 📝 Notes

- This app is maintained as an independent study tool
- All content is publicly available information from official sources
- Regular updates ensure questions reflect current test materials
- User privacy and data security are prioritized
- No affiliation with Australian Government (as per compliance requirements)

---

**Last Updated**: June 3, 2026  
**Next Review**: July 3, 2026
