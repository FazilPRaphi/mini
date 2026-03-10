import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";
import {
  Mail,
  Shield,
  Award,
  Edit3,
  Camera,
  CheckCircle,
  Clock,
} from "lucide-react";

const Profile = ({ defaultEditing = false }) => {
  const [profile, setProfile] = useState({
    full_name: "",
    institution: "",
    speciality: "",
    avatar_url: "",
  });

  const [editForm, setEditForm] = useState({
    full_name: "",
    institution: "",
    speciality: "",
    avatar_url: "",
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(defaultEditing);
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  const [lastLogin] = useState(
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  );

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setEmail(user.email);

      const { data } = await supabase
        .from("profiles")
        .select("full_name, institution, speciality, avatar_url")
        .eq("id", user.id)
        .single();

      if (data) {
        const filled = {
          full_name: data.full_name || "",
          institution: data.institution || "",
          speciality: data.speciality || "",
          avatar_url: data.avatar_url || "",
        };

        setProfile(filled);
        setEditForm(filled);

        if (defaultEditing) setIsEditing(true);
      }

      setPageLoading(false);
    };

    loadProfile();
  }, [defaultEditing]);

  const validateProfile = () => {
    if (!editForm.full_name.trim()) return "Full name is required";
    if (!editForm.institution.trim()) return "Institution is required";
    if (!editForm.speciality.trim()) return "Speciality is required";
    return null;
  };

  const updateProfile = async () => {
    const err = validateProfile();
    if (err) return toast.error(err);

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: editForm.full_name.trim(),
        institution: editForm.institution.trim(),
        speciality: editForm.speciality.trim(),
        avatar_url: editForm.avatar_url.trim() || null,
      })
      .eq("id", user.id);

    if (error) toast.error(error.message);
    else {
      toast.success("Profile updated!");
      setProfile({ ...editForm });
      setIsEditing(false);
    }

    setLoading(false);
  };

  const updatePassword = async () => {
    if (!password) return toast.error("Password cannot be empty");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) toast.error(error.message);
    else {
      toast.success("Password updated!");
      setPassword("");
      setShowAccountSettings(false);
    }
  };

  const completionFields = [
    "full_name",
    "institution",
    "speciality",
    "avatar_url",
  ];

  const filledCount = completionFields.filter((f) => profile[f]).length;
  const completionPct = Math.round(
    (filledCount / completionFields.length) * 100
  );

  if (pageLoading)
    return (
      <div className="p-10 text-gray-400 font-bold animate-pulse">
        Loading profile dashboard...
      </div>
    );

  const initial = profile.full_name?.charAt(0)?.toUpperCase() || "D";

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 h-[calc(100vh-80px)] overflow-hidden flex flex-col">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-black text-gray-900">
          Professional Profile
        </h1>
        <p className="text-gray-500 font-medium">
          Manage your professional identity and credentials.
        </p>
      </div>

      {/* PROFILE CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0BC5EA] to-[#2B6CB0] p-10 text-white shadow-xl">

        <div className="flex flex-col md:flex-row items-center gap-8">

          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-[30px] bg-white p-1 shadow-2xl">
              <div className="w-full h-full rounded-[26px] bg-gray-100 flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-black text-gray-400">
                    {initial}
                  </span>
                )}
              </div>
            </div>

            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center">
              <Camera size={18} />
            </button>
          </div>

          {/* Profile Info */}
          <div className="flex-1">

            <div className="flex items-center gap-4 mb-3">

              {isEditing ? (
                <input
                  value={editForm.full_name}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, full_name: e.target.value }))
                  }
                  className="bg-white/20 px-4 py-2 rounded-xl text-white placeholder-white/60"
                />
              ) : (
                <h2 className="text-3xl font-black">
                  {profile.full_name || "Doctor"}
                </h2>
              )}

              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-black">
                <CheckCircle size={14} />
                Verified
              </div>
            </div>

            <div className="flex flex-wrap gap-6 text-white/90">

              <div className="flex items-center gap-2 text-sm font-semibold">
                <Shield size={16} />
                {isEditing ? (
                  <input
                    value={editForm.speciality}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        speciality: e.target.value,
                      }))
                    }
                    className="bg-white/20 px-3 py-1 rounded-lg"
                  />
                ) : (
                  profile.speciality || "Speciality not set"
                )}
              </div>

              <div className="flex items-center gap-2 text-sm font-semibold">
                <Award size={16} />
                {isEditing ? (
                  <input
                    value={editForm.institution}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        institution: e.target.value,
                      }))
                    }
                    className="bg-white/20 px-3 py-1 rounded-lg"
                  />
                ) : (
                  profile.institution || "Institution not set"
                )}
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <div>

            {isEditing ? (
              <>
                <button
                  onClick={updateProfile}
                  className="px-6 py-3 bg-white text-gray-900 rounded-xl font-bold shadow"
                >
                  {loading ? "Saving..." : "Save"}
                </button>

                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm(profile);
                  }}
                  className="ml-3 px-6 py-3 bg-white/20 rounded-xl"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-white text-gray-900 rounded-xl flex items-center gap-2 font-semibold shadow"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            )}

          </div>

        </div>
      </div>

      {/* ACCOUNT SECURITY */}
      <div className="seba-card p-8">

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black">Account Security</h3>

          <button
            onClick={() => setShowAccountSettings(!showAccountSettings)}
            className="px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold"
          >
            {showAccountSettings ? "Cancel" : "Change Password"}
          </button>
        </div>

        {showAccountSettings && (
          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-2">
                Email
              </label>

              <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-xl">
                <Mail size={16} />
                <span className="font-bold">{email}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-2">
                New Password
              </label>

              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-xl p-3"
              />

              <button
                onClick={updatePassword}
                className="mt-3 w-full py-3 bg-gray-900 text-white rounded-xl text-xs font-bold"
              >
                Update Password
              </button>
            </div>
          </div>
        )}
      </div>

      {/* INSIGHT CARDS */}
      <div className="grid grid-cols-3 gap-6">

        <div className="seba-card p-6">
          <p className="text-xs text-gray-400 font-bold">
            Profile Completion
          </p>
          <h4 className="text-3xl font-black">{completionPct}%</h4>

          <div className="h-2 bg-gray-200 rounded-full mt-3">
            <div
              style={{ width: `${completionPct}%` }}
              className="h-full bg-cyan-500 rounded-full"
            />
          </div>
        </div>

        <div className="seba-card p-6">
          <p className="text-xs text-gray-400 font-bold">Status</p>

          <h4 className="text-xl font-black flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            LIVE
          </h4>
        </div>

        <div className="seba-card p-6">
          <p className="text-xs text-gray-400 font-bold">
            Last Session
          </p>

          <h4 className="text-lg font-black">{lastLogin}</h4>
        </div>
      </div>

    </div>
  );
};

export default Profile;