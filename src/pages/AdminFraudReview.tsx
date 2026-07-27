/**
 * Admin Fraud Review Page
 * 
 * Displays flagged submissions for manual review and approval/rejection
 */

import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, XCircle, Filter, Download } from "lucide-react";
import { FraudReviewTask, FraudRiskLevel } from "../types";

const AdminFraudReview: React.FC = () => {
  const [tasks, setTasks] = useState<FraudReviewTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [selectedTask, setSelectedTask] = useState<FraudReviewTask | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  useEffect(() => {
    // Load flagged submissions from Firestore
    loadFlaggedSubmissions();
  }, [filter]);

  const loadFlaggedSubmissions = async () => {
    setLoading(true);
    try {
      // In production, fetch from Firestore
      // db.collection("fraudReviewTasks").where("status", "==", filter).get()
      const mockTasks: FraudReviewTask[] = [];
      setTasks(mockTasks);
    } catch (error) {
      console.error("Error loading flagged submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedTask) return;

    try {
      // Update Firestore
      // await db.collection("fraudReviewTasks").doc(selectedTask.id).update({
      //   status: "approved",
      //   reviewedAt: new Date(),
      //   reviewedBy: currentUser.uid,
      //   reviewNotes
      // });

      setTasks(
        tasks.map((t) =>
          t.id === selectedTask.id
            ? { ...t, status: "approved", reviewNotes }
            : t
        )
      );
      setSelectedTask(null);
      setReviewNotes("");
    } catch (error) {
      console.error("Error approving submission:", error);
    }
  };

  const handleReject = async () => {
    if (!selectedTask) return;

    try {
      // Update Firestore
      // await db.collection("fraudReviewTasks").doc(selectedTask.id).update({
      //   status: "rejected",
      //   reviewedAt: new Date(),
      //   reviewedBy: currentUser.uid,
      //   reviewNotes
      // });

      setTasks(
        tasks.map((t) =>
          t.id === selectedTask.id
            ? { ...t, status: "rejected", reviewNotes }
            : t
        )
      );
      setSelectedTask(null);
      setReviewNotes("");
    } catch (error) {
      console.error("Error rejecting submission:", error);
    }
  };

  const getRiskColor = (level: FraudRiskLevel) => {
    switch (level) {
      case FraudRiskLevel.APPROVED:
        return "bg-green-100 text-green-800";
      case FraudRiskLevel.LOW:
        return "bg-blue-100 text-blue-800";
      case FraudRiskLevel.MEDIUM:
        return "bg-yellow-100 text-yellow-800";
      case FraudRiskLevel.HIGH:
        return "bg-orange-100 text-orange-800";
      case FraudRiskLevel.CRITICAL:
        return "bg-red-100 text-red-800";
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Fraud Review Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Review flagged submissions and approve or reject them
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Pending Review</div>
            <div className="text-3xl font-bold text-yellow-600">
              {tasks.filter((t) => t.status === "pending").length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Approved</div>
            <div className="text-3xl font-bold text-green-600">
              {tasks.filter((t) => t.status === "approved").length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Rejected</div>
            <div className="text-3xl font-bold text-red-600">
              {tasks.filter((t) => t.status === "rejected").length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-3xl font-bold text-gray-900">{tasks.length}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <button className="ml-auto px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <Download size={18} />
            Export
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task List */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                Loading submissions...
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                No submissions to review
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={`bg-white rounded-lg shadow p-4 cursor-pointer transition hover:shadow-md ${
                      selectedTask?.id === task.id ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {task.challengeTitle}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(task.fraudScore.riskLevel as FraudRiskLevel)}`}
                          >
                            {task.fraudScore.riskLevel}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          User: {task.userId} • Fraud Score: {task.fraudScore.overallScore}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Submitted: {new Date(task.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {task.status === "pending" && (
                          <AlertCircle className="text-yellow-500" size={24} />
                        )}
                        {task.status === "approved" && (
                          <CheckCircle className="text-green-500" size={24} />
                        )}
                        {task.status === "rejected" && (
                          <XCircle className="text-red-500" size={24} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {selectedTask && (
            <div className="bg-white rounded-lg shadow p-6 h-fit">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Fraud Analysis</h2>

              {/* Image Preview */}
              <img
                src={selectedTask.imageUrl}
                alt="Submission"
                className="w-full rounded-lg mb-4 max-h-48 object-cover"
              />

              {/* Fraud Score Breakdown */}
              <div className="mb-6 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Overall Score
                  </span>
                  <span className="text-2xl font-bold text-red-600">
                    {selectedTask.fraudScore.overallScore}%
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Image Quality</span>
                      <span className="font-medium">{selectedTask.fraudScore.breakdown.imageAnalysis}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${selectedTask.fraudScore.breakdown.imageAnalysis}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Metadata</span>
                      <span className="font-medium">{selectedTask.fraudScore.breakdown.metadataAnalysis}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${selectedTask.fraudScore.breakdown.metadataAnalysis}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Geolocation</span>
                      <span className="font-medium">{selectedTask.fraudScore.breakdown.geolocationAnalysis}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${selectedTask.fraudScore.breakdown.geolocationAnalysis}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Pattern Analysis</span>
                      <span className="font-medium">{selectedTask.fraudScore.breakdown.patternAnalysis}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${selectedTask.fraudScore.breakdown.patternAnalysis}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Flags */}
              {(selectedTask.fraudScore.details.metadataFlags.length > 0 ||
                selectedTask.fraudScore.details.locationFlags.length > 0 ||
                selectedTask.fraudScore.details.patternFlags.length > 0) && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Flags</h3>
                  <ul className="space-y-1 text-sm">
                    {[
                      ...selectedTask.fraudScore.details.metadataFlags,
                      ...selectedTask.fraudScore.details.locationFlags,
                      ...selectedTask.fraudScore.details.patternFlags,
                    ].map((flag, idx) => (
                      <li key={idx} className="text-gray-700 flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Review Notes */}
              {selectedTask.status === "pending" && (
                <>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add review notes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handleApprove}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={handleReject}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition"
                    >
                      Reject
                    </button>
                  </div>
                </>
              )}

              {selectedTask.status !== "pending" && (
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-600">
                    <strong>Status:</strong> {selectedTask.status.toUpperCase()}
                  </p>
                  {selectedTask.reviewedAt && (
                    <p className="text-xs text-gray-600">
                      <strong>Reviewed:</strong>{" "}
                      {new Date(selectedTask.reviewedAt).toLocaleString()}
                    </p>
                  )}
                  {selectedTask.reviewNotes && (
                    <p className="text-xs text-gray-600 mt-2">
                      <strong>Notes:</strong> {selectedTask.reviewNotes}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFraudReview;
