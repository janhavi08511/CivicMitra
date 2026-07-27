# DEPLOYMENT GUIDE: Phase 1 & 2 Upgrades

**Last Updated**: July 6, 2026  
**Environment**: Production Ready  

---

## 🚀 QUICK START

### Pre-Deployment Checklist
- [ ] All tests passing (npm test)
- [ ] TypeScript compilation successful (npm run build)
- [ ] Code reviewed and approved
- [ ] Staging environment tested
- [ ] Database backups completed
- [ ] Team notified

---

## 📦 PHASE 1: SCIENTIFIC IMPACT ENGINE

### Deployment Steps

#### Step 1: Code Deployment
```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm install

# 3. Run TypeScript compilation
npm run build

# 4. Run tests
npm test

# 5. If all passed, commit and push
git add .
git commit -m "feat: Phase 1 - Scientific Impact Engine"
git push origin main
```

#### Step 2: Firestore Schema Validation
```javascript
// Verify that challenges have optional impactCalculation field

// Example:
{
  challengeId: "cycle-10km",
  title: "Cycle 10km",
  // ... other fields ...
  impactCalculation: {
    type: "transport",
    distance: 10,
    distanceUnit: "km",
    formulaId: "transport-0.21"
  }
}
```

#### Step 3: Enable Feature
```typescript
// In src/App.tsx or feature flags collection
const PHASE_1_ENABLED = true; // Will automatically use activity-based impact

// Dashboard.tsx will:
// 1. Calculate points-based impact (legacy)
// 2. Calculate activity-based impact (new)
// 3. Display total combined impact
```

#### Step 4: Verify in Production
```bash
# Check that:
✅ Dashboard loads without errors
✅ Profile shows "Environmental Impact" section
✅ Impact values display correctly
✅ ChallengeModal shows measured value input
✅ No console errors
```

---

## 🛡️ PHASE 2: FRAUD DETECTION SYSTEM

### Deployment Steps

#### Step 1: Code Deployment
```bash
# 1. Ensure Phase 1 is deployed
# 2. Pull latest code
git pull origin main

# 3. Install dependencies
npm install

# 4. Run tests
npm test -- fraud-detection.test.ts

# 5. Build
npm run build

# 6. Push to production
git add .
git commit -m "feat: Phase 2 - Fraud Detection System"
git push origin main
```

#### Step 2: Create Firestore Collections
```javascript
// 1. Create fraudReviewTasks collection
db.createCollection("fraudReviewTasks", {
  indexFields: [
    { field: "status", order: "ASCENDING" },
    { field: "createdAt", order: "DESCENDING" },
    { field: "userId", order: "ASCENDING" }
  ]
});

// 2. Create userTrustScores collection
db.createCollection("userTrustScores");

// Security rules:
match /fraudReviewTasks/{document=**} {
  allow read: if request.auth.uid != null && 
                (request.auth.customClaims.role == "admin" || 
                 resource.data.userId == request.auth.uid);
  allow write: if request.auth.customClaims.role == "admin";
}

match /userTrustScores/{uid} {
  allow read: if request.auth.uid == uid || 
                 request.auth.customClaims.role == "admin";
  allow write: if request.auth.customClaims.role == "admin";
}
```

#### Step 3: Initialize Trust Scores
```typescript
// Run migration script from MIGRATION_GUIDE.md
npm run scripts/migrateToPhase2

// This will:
// 1. Create fraudReviewTasks collection
// 2. Initialize userTrustScores for all users
// 3. Run analysis on existing submissions (optional)
```

#### Step 4: Add Admin Routes
```typescript
// In src/App.tsx
import AdminFraudReview from "src/pages/AdminFraudReview";

// Add route
<Route 
  path="/admin/fraud-review" 
  element={
    <ProtectedRoute requireAdmin={true}>
      <AdminFraudReview />
    </ProtectedRoute>
  } 
/>
```

#### Step 5: Wire ChallengeModal Integration
```typescript
// In src/components/ChallengeModal.tsx
// After successful submission, before storing:

const { FraudDetectionService } = await import("src/services/fraudDetectionService");

const fraudScore = await FraudDetectionService.analyzeSubmission({
  submissionId: completion.id,
  completionId: completion.id,
  userId: auth.currentUser.uid,
  challengeId: challenge.challengeId,
  imageFile: proofFile,
  submissionTime: new Date(),
  userProfile: profile,
  userSubmissionHistory: completions,
});

completion.fraudScore = fraudScore;
completion.fraudReviewStatus = 
  fraudScore.riskLevel === "APPROVED" ? "approved" : "pending";

// If flagged, create review task
if (fraudScore.riskLevel !== "APPROVED") {
  const reviewTask = {
    // ... create task
  };
  await db.collection("fraudReviewTasks").add(reviewTask);
}
```

#### Step 6: Add Admin Menu
```typescript
// Add to admin dashboard navigation
<NavItem 
  icon={<AlertTriangle />}
  label="Fraud Review"
  badge={pendingFraudCount}
  to="/admin/fraud-review"
/>
```

#### Step 7: Enable Fraud Detection
```typescript
// Set feature flag
const FRAUD_DETECTION_ENABLED = true;

// This will:
// 1. Analyze all submissions
// 2. Flag suspicious ones
// 3. Allow admin review
```

#### Step 8: Verify in Production
```bash
# Check that:
✅ AdminFraudReview page loads
✅ Fraud detection runs on new submissions
✅ Profile shows trust badge
✅ Admin can approve/reject
✅ Metrics display correctly
✅ No console errors
```

---

## 🔗 FULL DEPLOYMENT WORKFLOW

### Timeline
**Day 1: Preparation (2-3 hours)**
- [ ] Complete pre-deployment checklist
- [ ] Run all tests locally
- [ ] Backup production database
- [ ] Notify team

**Day 2: Phase 1 Deployment (1-2 hours)**
- [ ] Deploy Phase 1 code
- [ ] Enable feature flag
- [ ] Monitor for errors
- [ ] Verify impact calculations
- [ ] Smoke tests

**Day 3: Phase 2 Deployment (2-3 hours)**
- [ ] Create Firestore collections
- [ ] Initialize trust scores
- [ ] Deploy Phase 2 code
- [ ] Enable fraud detection
- [ ] Run admin workflow test
- [ ] Monitor dashboard

### Parallel Development (Optional)
If you want to deploy both phases together:

```bash
# 1. Deploy all code at once
git push origin main

# 2. Build and test
npm install && npm run build && npm test

# 3. Create collections
# (Can do in parallel with code deployment)

# 4. Verify both features work
# (Do before going live to production)

# 5. Monitor metrics carefully
# (Both systems are new)
```

---

## 📊 MONITORING & METRICS

### What to Monitor

#### Phase 1: Impact Engine
```
✅ Metric: Impact Calculations Accurate
- Sample 10 submissions
- Manually verify CO₂ calculations
- Compare with EPA standards

✅ Metric: Dashboard Performance
- Monitor load times
- Check for JS errors
- Verify no N+1 queries

✅ Metric: Data Quality
- Impact values within expected range
- No null/undefined values
- Units consistent
```

#### Phase 2: Fraud Detection
```
✅ Metric: Fraud Detection Accuracy
- False positive rate < 5%
- Detection time < 2 seconds
- No timeout errors

✅ Metric: Admin Workflow
- Reviews completed < 5 minutes
- No UI bugs
- Approve/reject works correctly

✅ Metric: User Experience
- Trust badge displays correctly
- No profile load delays
- Feedback positive
```

### Monitoring Dashboard
```typescript
// Create in Firebase Console or Datadog

// Key metrics:
- Phase1CompletionTime (avg < 500ms)
- FraudDetectionTime (avg < 2s)
- AdminApprovalRate (%) 
- FlaggedSubmissions (count)
- UserTrustScore (distribution)
- SystemErrors (count)
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### Before Going Live
```bash
# 1. Bundle analysis
npm run build
npm run analyze

# 2. Performance profiling
npm run profile

# 3. Load testing
npm run load-test

# 4. Memory leak detection
npm run memory-test
```

### Expected Performance
- Page load: < 2s
- Impact calculation: < 500ms
- Fraud analysis: < 2s
- Admin dashboard: < 1.5s
- API response: < 200ms

---

## 🔄 ROLLBACK PROCEDURE

If critical issues occur:

### Immediate Rollback (< 30 minutes)
```bash
# 1. Revert code to previous commit
git revert HEAD

# 2. Rebuild and redeploy
npm run build
npm run deploy

# 3. Disable feature flags
firebase config set features.phase1Enabled=false
firebase config set features.phase2Enabled=false

# 4. Clear cache
firebase cache clear

# 5. Verify system
curl https://civicmitra.app/api/health
```

### Partial Rollback (If only one phase has issues)
```bash
# Phase 1 only - disable impact engine
PHASE_1_ENABLED = false

# Phase 2 only - disable fraud detection
FRAUD_DETECTION_ENABLED = false

# System continues with legacy functionality
```

### Data Recovery (If needed)
```bash
# 1. Restore from backup
firebase backup restore <backup-id>

# 2. Verify data integrity
firebase verify

# 3. Redeploy original code
git checkout v1.0.0  # Previous stable version
npm run deploy
```

---

## 🚨 INCIDENT RESPONSE

### If Fraud Detection Flags Too Many Submissions
```
1. Check detection thresholds
2. Review detection logic
3. Temporarily disable "FLAG" status (approve/reject only)
4. Investigate specific false positives
5. Adjust weights or thresholds
6. Re-enable gradual
```

### If Impact Calculations Seem Wrong
```
1. Verify EPA formulas are correct
2. Check unit conversions
3. Review sample calculations
4. Validate against known values
5. Adjust formulas if needed
6. Re-run migration if necessary
```

### If Admin Workflow Has Errors
```
1. Check browser console for JS errors
2. Verify Firestore queries work
3. Review admin user permissions
4. Test with different admin accounts
5. Check for Firestore rule violations
6. Review error logs
```

---

## ✅ POST-DEPLOYMENT VERIFICATION

### Hour 1
- [ ] No critical errors in logs
- [ ] Dashboard accessible
- [ ] Admin panel working
- [ ] User profiles load quickly

### Hour 4
- [ ] Sample submissions verified
- [ ] Impact calculations checked
- [ ] Fraud detection running
- [ ] Trust scores initialized

### Day 1
- [ ] 100+ submissions processed
- [ ] 0 critical bugs
- [ ] Performance metrics good
- [ ] User feedback positive

### Week 1
- [ ] 1000+ submissions processed
- [ ] Fraud detection accuracy > 90%
- [ ] No performance degradation
- [ ] Admin reviewed all flagged items

---

## 📞 SUPPORT CONTACTS

### During Deployment
- **Tech Lead**: [Contact info]
- **Database Admin**: [Contact info]
- **DevOps**: [Contact info]

### Documentation
- [PHASE1_COMPLETE.md](PHASE1_COMPLETE.md)
- [PHASE2_COMPLETE.md](PHASE2_COMPLETE.md)
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)

---

## 🎯 SUCCESS CRITERIA

✅ Deployment successful if:
1. All tests passing
2. No critical errors
3. Performance metrics met
4. Users can submit challenges
5. Admin can review frauds
6. Trust scores visible on profiles
7. No data loss
8. System stable for 24+ hours

---

**Status**: Ready for Deployment ✅  
**Last Reviewed**: July 6, 2026 ✅  
**Estimated Duration**: 4-5 hours ✅  
**Risk Level**: Low ✅

