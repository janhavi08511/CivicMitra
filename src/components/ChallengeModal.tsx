import { useState } from "react";
<<<<<<< HEAD
import { auth } from "../auth";
import { api } from "../lib/api";
import { Challenge, ImpactData } from "../types";
import { motion } from "motion/react";
import { X, Upload, CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { cn } from "../lib/utils";
import { verifyEcoProof } from "../services/geminiService";
import { updateStats } from "../lib/badge-utils";
import { ImpactService } from "../services/impactService";
=======
import { collection, doc, updateDoc, increment, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "../firebase";
import { handleFirestoreError, OperationType } from "../lib/firestore-error-handler";
import { Challenge } from "../types";
import { motion } from "motion/react";
import { X, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { verifyEcoProof } from "../services/geminiService";
import { updateStats } from "../lib/badge-utils";
>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
import { toast } from "react-hot-toast";

interface ChallengeModalProps {
  challenge: Challenge;
  onClose: () => void;
}

<<<<<<< HEAD
export default function ChallengeModal({
  challenge,
  onClose,
}: ChallengeModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<
    "IDLE" | "VERIFYING" | "SUCCESS" | "ERROR"
  >("IDLE");
  const [reason, setReason] = useState("");

  // Impact data state
  const [measuredValue, setMeasuredValue] = useState<number | null>(null);
  const [impactData, setImpactData] = useState<ImpactData | null>(null);

=======
export default function ChallengeModal({ challenge, onClose }: ChallengeModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"IDLE" | "VERIFYING" | "SUCCESS" | "ERROR">("IDLE");
  const [reason, setReason] = useState("");

>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const handleSubmit = async () => {
    if (!file || !auth.currentUser) return;
<<<<<<< HEAD

    // Validate measured value if impact calculation required
    if (
  challenge.impactCalculation &&
  (measuredValue === null || measuredValue <= 0)
   ) {
      toast.error("Please enter the measured value");
      return;
    }

=======
>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
    setSubmitting(true);
    setStatus("VERIFYING");

    try {
<<<<<<< HEAD
      const reader = new FileReader();
      const fileDataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });
      const base64 = fileDataUrl.split(',')[1] || '';

      // 2. AI Verification
      const result = await verifyEcoProof(
        preview!,
        challenge.title,
        challenge.proofInstructions,
      );

      // 3. Calculate impact if impactCalculation is defined
      let calculatedImpactData: ImpactData | undefined;
      if (challenge.impactCalculation && measuredValue!==null) {
        try {
          calculatedImpactData = ImpactService.calculateAndFormat({
            type: challenge.impactCalculation.type,
            value: Number(measuredValue),
            unit: getUnitForImpactType(challenge.impactCalculation.type),
            metadata: { challengeId: challenge.challengeId },
          });
        } catch (impactError) {
          console.error("Impact calculation error:", impactError);
          // Continue without impact data if calculation fails
        }
      }

      // 4. Save Completion
      const completionData: any = {
        userId: auth.currentUser.uid,
        challengeId: challenge.challengeId,
        proofUrl: "",
        proofType: "IMAGE",
        proofBase64: base64,
        fileName: file.name,
=======
      // 1. Upload to Firebase Storage
      const storageRef = ref(storage, `completions/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(uploadResult.ref);

      // 2. AI Verification
      const result = await verifyEcoProof(preview!, challenge.title, challenge.proofInstructions);
      
      // 3. Save Completion
      const completionData = {
        userId: auth.currentUser.uid,
        challengeId: challenge.challengeId,
        proofUrl: downloadUrl,
        proofType: "IMAGE",
>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
        aiVerificationStatus: result.verified ? "VERIFIED" : "REJECTED",
        aiVerificationScore: result.score,
        pointsAwarded: result.verified ? challenge.points : 0,
        isStreakDay: result.verified,
        submittedAt: new Date().toISOString(),
        verifiedAt: result.verified ? new Date().toISOString() : null,
        caption: "",
        likesCount: 0,
<<<<<<< HEAD
        commentsCount: 0,
      };

      // Add impact data if calculated
      if (calculatedImpactData) {
        completionData.impactData = calculatedImpactData;
      }

      await api.submitCompletion(completionData);

      if (result.verified) {
        // Update badge stats
        updateStats({
          points: challenge.points,
          proofs_submitted: 1,
        });

        setImpactData(calculatedImpactData || null);
=======
        commentsCount: 0
      };

      await addDoc(collection(db, "completions"), completionData).catch(e => handleFirestoreError(e, OperationType.CREATE, "completions"));

      if (result.verified) {
        // 4. Update User Points & Streak
        const userRef = doc(db, "users", auth.currentUser.uid);
        
        const updateData = {
          points: increment(challenge.points),
          totalPoints: increment(challenge.points),
          currentStreak: increment(1),
          lastActivityDate: new Date().toISOString().split('T')[0]
        };

        await updateDoc(userRef, updateData).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${auth.currentUser?.uid}`));
        
        // Update badge stats
        updateStats({
          points: challenge.points,
          proofs_submitted: 1
        });

>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
        setStatus("SUCCESS");
        toast.success(`Verified! +${challenge.points} points earned.`);
      } else {
        setStatus("ERROR");
        setReason(result.reason);
        toast.error("Verification failed. Please try again.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("ERROR");
      setReason("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

<<<<<<< HEAD
  // Helper to get default unit for impact type
  const getUnitForImpactType = (impactType: string): string => {
    switch (impactType) {
      case "TRANSPORT":
        return "km";
      case "ELECTRICITY":
        return "kWh";
      case "WATER":
        return "L";
      case "PLASTIC":
        return "kg";
      case "ACTIVITY":
        return "min";
      default:
        return "";
    }
  };

  // Helper to get placeholder text for impact type
  const getPlaceholder = (impactType: string): string => {
    switch (impactType) {
      case "TRANSPORT":
        return "e.g., 5 km";
      case "ELECTRICITY":
        return "e.g., 50 kWh";
      case "WATER":
        return "e.g., 100 L";
      case "PLASTIC":
        return "e.g., 2 kg";
      case "ACTIVITY":
        return "e.g., 20 minutes";
      default:
        return "Enter value";
    }
  };

  // Helper to get label for impact type
  const getImpactLabel = (impactType: string): string => {
    switch (impactType) {
      case "TRANSPORT":
        return "Distance (in km)";
      case "ELECTRICITY":
        return "Electricity Saved (in kWh)";
      case "WATER":
        return "Water Saved (in litres)";
      case "PLASTIC":
        return "Plastic Collected (in kg)";
      case "ACTIVITY":
        return "Activity Duration (in minutes)";
      default:
        return "Measured Value";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
=======
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
<<<<<<< HEAD
      <motion.div
=======
      <motion.div 
>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-card rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="h-48 relative">
<<<<<<< HEAD
          <img
            src={challenge.bannerImageUrl}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <button
=======
          <img src={challenge.bannerImageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <button 
>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-card/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-card/40 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{challenge.iconEmoji}</span>
<<<<<<< HEAD
            <h2 className="text-3xl font-display text-text-primary">
              {challenge.title}
            </h2>
=======
            <h2 className="text-3xl font-display text-text-primary">{challenge.title}</h2>
>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
          </div>

          <div className="space-y-6">
            <div>
<<<<<<< HEAD
              <h4 className="font-bold text-text-secondary uppercase text-xs tracking-widest mb-2">
                Instructions
              </h4>
              <p className="text-text-secondary leading-relaxed">
                {challenge.description}
              </p>
            </div>

            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
              <h4 className="font-bold text-primary text-sm mb-1">
                Proof Required
              </h4>
              <p className="text-sm text-primary/80">
                {challenge.proofInstructions}
              </p>
=======
              <h4 className="font-bold text-text-secondary uppercase text-xs tracking-widest mb-2">Instructions</h4>
              <p className="text-text-secondary leading-relaxed">{challenge.description}</p>
            </div>

            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
              <h4 className="font-bold text-primary text-sm mb-1">Proof Required</h4>
              <p className="text-sm text-primary/80">{challenge.proofInstructions}</p>
>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
            </div>

            {status === "IDLE" && (
              <div className="space-y-4">
<<<<<<< HEAD
                {/* Impact Data Input - Show only if challenge has impact calculation */}
                {challenge.impactCalculation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap size={20} className="text-blue-600" />
                      <h4 className="font-bold text-blue-900">
                        Measure Your Impact
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-blue-900">
                        {getImpactLabel(challenge.impactCalculation.type)}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={measuredValue ?? ""}
                          onChange={(e) =>
                            setMeasuredValue(
                              e.target.value === ""
                                ? null
                                : Number(e.target.value),
                            )
                          }
                          placeholder={getPlaceholder(
                            challenge.impactCalculation.type,
                          )}
                          className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          step="0.1"
                          min="0"
                        />
                        <span className="px-3 py-2 bg-blue-100 rounded-lg text-sm font-medium text-blue-900">
                          {getUnitForImpactType(
                            challenge.impactCalculation.type,
                          )}
                        </span>
                      </div>
                      {measuredValue && (
                        <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
                          ✓ Impact will be calculated and saved with your
                          submission
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div
                  className={cn(
                    "border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center transition-all",
                    preview
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary hover:bg-gray-50",
=======
                <div 
                  className={cn(
                    "border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center transition-all",
                    preview ? "border-primary bg-primary/5" : "hover:border-primary hover:bg-gray-50"
>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
                  )}
                >
                  {preview ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden">
<<<<<<< HEAD
                      <img
                        src={preview}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          setFile(null);
                          setPreview(null);
                        }}
=======
                      <img src={preview} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => {setFile(null); setPreview(null);}}
>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
<<<<<<< HEAD
                      <Upload
                        className="mx-auto text-gray-400 mb-4"
                        size={48}
                      />
                      <p className="font-bold text-lg">Upload Proof</p>
                      <p className="text-sm text-text-secondary">
                        Click to browse or drag and drop
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="hidden"
=======
                      <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="font-bold text-lg">Upload Proof</p>
                      <p className="text-sm text-text-secondary">Click to browse or drag and drop</p>
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        onChange={handleFileChange} 
                        className="hidden" 
>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
                      />
                    </label>
                  )}
                </div>
                <button
                  disabled={!file || submitting}
                  onClick={handleSubmit}
                  className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-light transition-colors shadow-lg disabled:opacity-50"
                >
                  {submitting ? "Verifying..." : "Submit Proof"}
                </button>
              </div>
            )}

            {status === "VERIFYING" && (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xl font-bold">Verifying your proof...</p>
<<<<<<< HEAD
                <p className="text-text-secondary">
                  Our AI is checking your submission. This usually takes 5-10
                  seconds.
                </p>
=======
                <p className="text-text-secondary">Our AI is checking your submission. This usually takes 5-10 seconds.</p>
>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
              </div>
            )}

            {status === "SUCCESS" && (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={40} />
                </div>
<<<<<<< HEAD
                <p className="text-2xl font-bold text-text-primary">
                  Proof Verified! 🎉
                </p>
                <p className="text-text-secondary">
                  You've earned +{challenge.points} points and kept your streak
                  alive.
                </p>

                {/* Display calculated impact */}
                {impactData && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6 space-y-3">
                    <h4 className="font-bold text-blue-900 text-sm">
                      Your Environmental Impact
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {impactData.calculatedImpacts.co2_kg_saved > 0 && (
                        <div className="bg-white p-2 rounded">
                          <div className="text-blue-600 font-bold">
                            {impactData.calculatedImpacts.co2_kg_saved.toFixed(
                              2,
                            )}{" "}
                            kg
                          </div>
                          <div className="text-xs text-gray-600">CO₂ Saved</div>
                        </div>
                      )}
                      {impactData.calculatedImpacts.water_litre_saved > 0 && (
                        <div className="bg-white p-2 rounded">
                          <div className="text-blue-600 font-bold">
                            {impactData.calculatedImpacts.water_litre_saved.toFixed(
                              1,
                            )}{" "}
                            L
                          </div>
                          <div className="text-xs text-gray-600">
                            Water Saved
                          </div>
                        </div>
                      )}
                      {impactData.calculatedImpacts.electricity_wh_saved >
                        0 && (
                        <div className="bg-white p-2 rounded">
                          <div className="text-blue-600 font-bold">
                            {impactData.calculatedImpacts
                              .electricity_wh_saved >= 1000
                              ? `${(impactData.calculatedImpacts.electricity_wh_saved / 1000).toFixed(2)} kWh`
                              : `${impactData.calculatedImpacts.electricity_wh_saved.toFixed(1)} Wh`}
                          </div>
                          <div className="text-xs text-gray-600">
                            Energy Saved
                          </div>
                        </div>
                      )}
                      {impactData.calculatedImpacts.waste_kg_prevented > 0 && (
                        <div className="bg-white p-2 rounded">
                          <div className="text-blue-600 font-bold">
                            {impactData.calculatedImpacts.waste_kg_prevented.toFixed(
                              2,
                            )}{" "}
                            kg
                          </div>
                          <div className="text-xs text-gray-600">
                            Waste Prevented
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-primary text-white rounded-xl font-bold"
                >
                  Back to Challenges
                </button>
=======
                <p className="text-2xl font-bold text-text-primary">Proof Verified! 🎉</p>
                <p className="text-text-secondary">You've earned +{challenge.points} points and kept your streak alive.</p>
                <button onClick={onClose} className="px-8 py-3 bg-primary text-white rounded-xl font-bold">Back to Challenges</button>
>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
              </div>
            )}

            {status === "ERROR" && (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle size={40} />
                </div>
                <p className="text-2xl font-bold">Verification Failed</p>
<<<<<<< HEAD
                <p className="text-text-secondary">
                  {reason ||
                    "We couldn't verify your proof. Please try again with a clearer image."}
                </p>
                <button
                  onClick={() => setStatus("IDLE")}
                  className="px-8 py-3 bg-primary text-white rounded-xl font-bold"
                >
                  Try Again
                </button>
=======
                <p className="text-text-secondary">{reason || "We couldn't verify your proof. Please try again with a clearer image."}</p>
                <button onClick={() => setStatus("IDLE")} className="px-8 py-3 bg-primary text-white rounded-xl font-bold">Try Again</button>
>>>>>>> 07d88a3f94376a0edfc22f9304ff5f7dd0cf413f
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
