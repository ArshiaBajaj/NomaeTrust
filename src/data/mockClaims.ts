import type {
  CallVerificationResult,
  Claim,
  EvidenceCard,
  MapHotspot,
  VoicePassport,
} from "../types";

export const mockVoiceTranscription =
  "Hey, this is Mom. I need you to wire $2,000 to this account immediately. Don't tell your sister — it's urgent and confidential. The bank account number is 4829-1102-7734.";

export const mockScreenshotOCR = `BREAKING: City water supply contaminated with bacteria.
Residents advised to boil all water immediately.
Officials confirm outbreak in downtown district.
Share this with everyone you know — schools closing tomorrow.`;

export const mockExtractedVoiceClaims: Claim[] = [
  {
    id: "vc-1",
    text: "Caller claims to be a family member requesting an urgent wire transfer of $2,000.",
    source: "voice",
    status: "disputed",
    confidence: 0.91,
    extractedAt: new Date().toISOString(),
  },
  {
    id: "vc-2",
    text: "Caller asks recipient to keep the request secret from other family members.",
    source: "voice",
    status: "unverified",
    confidence: 0.87,
    extractedAt: new Date().toISOString(),
  },
  {
    id: "vc-3",
    text: "Bank account number 4829-1102-7734 provided for immediate transfer.",
    source: "voice",
    status: "unverified",
    confidence: 0.95,
    extractedAt: new Date().toISOString(),
  },
];

export const mockExtractedScreenshotClaims: Claim[] = [
  {
    id: "sc-1",
    text: "City water supply is contaminated with bacteria.",
    source: "screenshot",
    status: "unverified",
    confidence: 0.88,
    extractedAt: new Date().toISOString(),
    location: { lat: 37.7749, lng: -122.4194, label: "San Francisco, CA" },
  },
  {
    id: "sc-2",
    text: "Officials have confirmed a downtown water outbreak.",
    source: "screenshot",
    status: "disputed",
    confidence: 0.76,
    extractedAt: new Date().toISOString(),
    location: { lat: 37.7749, lng: -122.4194, label: "San Francisco, CA" },
  },
  {
    id: "sc-3",
    text: "All schools will close tomorrow due to the contamination.",
    source: "screenshot",
    status: "unverified",
    confidence: 0.82,
    extractedAt: new Date().toISOString(),
    location: { lat: 37.7749, lng: -122.4194, label: "San Francisco, CA" },
  },
];

export const mockVoiceEvidenceCards: EvidenceCard[] = [
  {
    id: "ev-v1",
    claim: "Voice pattern does not match enrolled voice passport for 'Mom'.",
    status: "unverified",
    confidence: 0.94,
    sources: ["Voice biometrics", "Behavioral analysis"],
    summary:
      "Acoustic analysis detected synthetic speech artifacts consistent with AI voice cloning. Urgency framing and secrecy requests match known grandparent scam patterns.",
    verifiedAt: new Date().toISOString(),
    riskLevel: "high",
    sourceType: "voice",
  },
  {
    id: "ev-v2",
    claim: "Wire transfer request flagged as high-risk financial scam indicator.",
    status: "disputed",
    confidence: 0.89,
    sources: ["Fraud pattern database", "Community reports"],
    summary:
      "This claim pattern has been reported 847 times in the last 30 days. No official family verification on file for this account number.",
    verifiedAt: new Date().toISOString(),
    riskLevel: "high",
    sourceType: "voice",
  },
];

export const mockScreenshotEvidenceCards: EvidenceCard[] = [
  {
    id: "ev-s1",
    claim: "Water contamination alert has no official government source.",
    status: "unverified",
    confidence: 0.92,
    sources: ["Municipal water authority API", "Fact-check database"],
    summary:
      "San Francisco Public Utilities Commission reports normal water quality. No boil-water advisory issued. Image metadata suggests screenshot from unverified group chat.",
    verifiedAt: new Date().toISOString(),
    riskLevel: "high",
    sourceType: "screenshot",
  },
  {
    id: "ev-s2",
    claim: "School closure claim is not confirmed by district officials.",
    status: "disputed",
    confidence: 0.85,
    sources: ["School district feed", "Local news aggregator"],
    summary:
      "SFUSD has not announced any closures. Similar messages circulated during previous misinformation events in the Bay Area.",
    verifiedAt: new Date().toISOString(),
    riskLevel: "medium",
    sourceType: "screenshot",
  },
];

export const mockVoicePassports: VoicePassport[] = [
  {
    contactName: "Mom (Sarah Chen)",
    voiceprintId: "vp-sarah-chen-001",
    enrolledAt: "2025-11-14T10:00:00Z",
    trustScore: 0.97,
  },
  {
    contactName: "Dad (James Chen)",
    voiceprintId: "vp-james-chen-001",
    enrolledAt: "2025-11-14T10:05:00Z",
    trustScore: 0.95,
  },
  {
    contactName: "Sister (Emily Chen)",
    voiceprintId: "vp-emily-chen-001",
    enrolledAt: "2025-12-01T14:30:00Z",
    trustScore: 0.93,
  },
];

export const mockCallVerificationResults: Record<string, CallVerificationResult> =
  {
    verified: {
      callerName: "Mom (Sarah Chen)",
      isVerified: true,
      deepfakeRiskScore: 0.08,
      voicePassport: mockVoicePassports[0],
      analysis:
        "Voice biometrics match enrolled passport with 97% confidence. Natural speech patterns, consistent background noise profile, and no synthetic artifact detection.",
      recommendation: "Caller verified. Safe to continue conversation.",
      challengeCode: "SUNFLOWER",
      challengePassed: true,
      detectedClaim: null,
      transcript: "Hi, it's Mom. I'll see you at dinner tonight.",
    },
    suspicious: {
      callerName: "Unknown — claims to be Mom",
      isVerified: false,
      deepfakeRiskScore: 0.87,
      voicePassport: null,
      analysis:
        "Voice does not match Sarah Chen's enrolled passport. Detected neural TTS artifacts at 2.4kHz range. Caller used urgency and secrecy framing typical of AI impersonation scams.",
      recommendation:
        "Do not share financial information. Hang up and call back using a known number.",
      challengeCode: "SUNFLOWER",
      challengePassed: false,
      detectedClaim:
        "Caller requests urgent wire transfer claiming to be a family member.",
      transcript: mockVoiceTranscription,
    },
  };

export const mockMapHotspots: MapHotspot[] = [
  {
    id: "hs-1",
    label: "San Francisco, CA",
    lat: 37.7749,
    lng: -122.4194,
    intensity: 0.92,
    claimCount: 342,
    verifiedCount: 28,
    unverifiedCount: 314,
  },
  {
    id: "hs-2",
    label: "Los Angeles, CA",
    lat: 34.0522,
    lng: -118.2437,
    intensity: 0.78,
    claimCount: 256,
    verifiedCount: 41,
    unverifiedCount: 215,
  },
  {
    id: "hs-3",
    label: "Chicago, IL",
    lat: 41.8781,
    lng: -87.6298,
    intensity: 0.65,
    claimCount: 189,
    verifiedCount: 52,
    unverifiedCount: 137,
  },
  {
    id: "hs-4",
    label: "New York, NY",
    lat: 40.7128,
    lng: -74.006,
    intensity: 0.71,
    claimCount: 278,
    verifiedCount: 63,
    unverifiedCount: 215,
  },
  {
    id: "hs-5",
    label: "Houston, TX",
    lat: 29.7604,
    lng: -95.3698,
    intensity: 0.54,
    claimCount: 134,
    verifiedCount: 38,
    unverifiedCount: 96,
  },
  {
    id: "hs-6",
    label: "Miami, FL",
    lat: 25.7617,
    lng: -80.1918,
    intensity: 0.48,
    claimCount: 112,
    verifiedCount: 29,
    unverifiedCount: 83,
  },
];

export const mockCommunityClaims: Claim[] = [
  ...mockExtractedScreenshotClaims,
  ...mockExtractedVoiceClaims,
  {
    id: "cm-1",
    text: "Emergency curfew declared in downtown area tonight.",
    source: "community",
    status: "verified",
    confidence: 0.96,
    extractedAt: "2026-06-10T18:00:00Z",
    location: { lat: 41.8781, lng: -87.6298, label: "Chicago, IL" },
  },
  {
    id: "cm-2",
    text: "Free vaccine clinic open at community center this weekend.",
    source: "community",
    status: "verified",
    confidence: 0.91,
    extractedAt: "2026-06-11T09:00:00Z",
    location: { lat: 34.0522, lng: -118.2437, label: "Los Angeles, CA" },
  },
  {
    id: "cm-3",
    text: "Power grid failure expected across the state tomorrow.",
    source: "community",
    status: "unverified",
    confidence: 0.73,
    extractedAt: "2026-06-12T14:22:00Z",
    location: { lat: 29.7604, lng: -95.3698, label: "Houston, TX" },
  },
  {
    id: "cm-4",
    text: "Local hospital offering free health screenings.",
    source: "community",
    status: "verified",
    confidence: 0.88,
    extractedAt: "2026-06-13T11:00:00Z",
    location: { lat: 25.7617, lng: -80.1918, label: "Miami, FL" },
  },
];
