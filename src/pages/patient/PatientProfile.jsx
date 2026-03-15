import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

const initialForm = {
  full_name: "",
  age: "",
  gender: "",
  phone: "",
  address: "",
  blood_group: "",
  emergency_contact: "",
  medical_history: "",
  avatar_url: "",
};

const PatientProfile = ({ defaultEditing = false }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [editForm, setEditForm] = useState(initialForm);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isEditing, setIsEditing] = useState(defaultEditing);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setEmail(user.email);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) toast.error(error.message);
    else {
      const filled = { ...initialForm, ...data };
      setForm(filled);
      setEditForm(filled);
      if (defaultEditing) setIsEditing(true);
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    setEditForm((p) => ({
      ...p,
      [e.target.name]: e.target.value,
    }));
  };

  const openEdit = () => {
    setEditForm({ ...form });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setEditForm({ ...form });
    setIsEditing(false);
  };

  const validateForm = () => {
    if (!editForm.full_name?.trim()) return "Full name required";
    if (!editForm.age) return "Age required";
    if (!editForm.gender) return "Gender required";
    if (!editForm.phone) return "Phone required";
    if (!editForm.address) return "Address required";
    if (!editForm.blood_group) return "Blood group required";
    if (!editForm.emergency_contact) return "Emergency contact required";
    return null;
  };

  const saveProfile = async () => {
    const errorMsg = validateForm();
    if (errorMsg) return toast.error(errorMsg);

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("profiles")
      .update({ ...editForm, age: Number(editForm.age) })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated!");
      setForm({ ...editForm, age: Number(editForm.age) });
      setIsEditing(false);

      if (defaultEditing) {
        setTimeout(() => navigate("/patient-dashboard", { replace: true }), 800);
      }
    }
  };

  const uploadAvatar = async (event) => {
    try {
      setUploadingImage(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      // Need import { v4 as uuidv4 } from "uuid"; at the top, but we'll use a simple timestamp instead to avoid modifying imports if uuid isn't present
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicURL = urlData.publicUrl;

      // Update local state immediately
      setForm((prev) => ({ ...prev, avatar_url: publicURL }));
      setEditForm((prev) => ({ ...prev, avatar_url: publicURL }));

      // Update database if not in edit mode (auto-save avatar)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("profiles")
          .update({ avatar_url: publicURL })
          .eq("id", user.id);
        toast.success("Profile photo updated!");
      }
    } catch (error) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const changePassword = async () => {
    if (!password) return toast.error("Password cannot be empty");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated");
      setPassword("");
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500 font-medium">
        Loading profile...
      </div>
    );

  return (
    <div className="space-y-8 max-w-4xl mx-auto">

      {/* PROFILE CARD */}
      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center md:items-start">

        {/* avatar */}
        <div className="relative shrink-0 group">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-[30px] bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-4xl shadow-inner border-4 border-white overflow-hidden">
            {form.avatar_url ? (
              <img 
                src={form.avatar_url} 
                alt="Profile" 
                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                onClick={() => window.open(form.avatar_url, '_blank')}
                title="Click to view full image"
              />
            ) : (
              "👤"
            )}
          </div>

          <div className="absolute -bottom-2 -right-2">
            <input 
              type="file" 
              id="patient-avatar-upload" 
              accept="image/*" 
              className="hidden" 
              onChange={uploadAvatar}
              disabled={uploadingImage}
            />
            <label 
              htmlFor="patient-avatar-upload"
              className="flex items-center justify-center w-10 h-10 bg-cyan-600 text-white rounded-xl shadow-lg hover:bg-cyan-700 cursor-pointer hover:scale-110 transition-transform active:scale-95 border-2 border-white"
              title="Upload profile picture"
            >
              {uploadingImage ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              )}
            </label>
          </div>
        </div>

        {/* info / form */}
        <div className="flex-1 w-full">

          {isEditing ? (
            /* ─── EDIT FORM ─── */
            <>
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                  {defaultEditing ? "Complete Your Profile" : "Edit Profile"}
                </h2>
                {!defaultEditing && (
                  <button
                    onClick={cancelEdit}
                    className="text-gray-500 hover:text-gray-700 text-sm font-bold bg-gray-50 px-5 py-2.5 rounded-xl border border-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <Field
                  label="Full Name *"
                  name="full_name"
                  value={editForm.full_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                />

                <Field
                  label="Age *"
                  name="age"
                  type="number"
                  value={editForm.age}
                  onChange={handleChange}
                  placeholder="25"
                />

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Gender *</label>
                  <select
                    name="gender"
                    value={editForm.gender}
                    onChange={handleChange}
                    className="border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all font-medium"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Blood Group *</label>
                  <select
                    name="blood_group"
                    value={editForm.blood_group}
                    onChange={handleChange}
                    className="border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all font-medium"
                  >
                    <option value="">Select blood group</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <Field
                  label="Phone *"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                />

                <Field
                  label="Emergency Contact *"
                  name="emergency_contact"
                  value={editForm.emergency_contact}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                />

                <div className="sm:col-span-2">
                  <Field
                    label="Address / Location *"
                    name="address"
                    value={editForm.address}
                    onChange={handleChange}
                    placeholder="City, State"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Medical History (comma-separated)</label>
                  <textarea
                    name="medical_history"
                    value={editForm.medical_history}
                    onChange={handleChange}
                    placeholder="Diabetes, Hypertension"
                    rows={2}
                    className="border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none transition-all font-medium"
                  />
                </div>

              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex-1 bg-cyan-600 text-white px-8 py-3.5 rounded-2xl font-black shadow-lg shadow-cyan-600/20 hover:bg-cyan-700 disabled:opacity-50 transition-all active:scale-95"
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>
                {!defaultEditing && (
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-100 text-gray-600 px-8 py-3.5 rounded-2xl font-black hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </>
          ) : (
            /* ─── READ-ONLY VIEW ─── */
            <>
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
                <div className="text-center sm:text-left">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                    {form.full_name || "Patient"}
                  </h2>
                  <p className="text-cyan-600 text-xs font-black uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-600 animate-pulse" />
                    Verified Patient
                  </p>
                </div>

                <button
                  onClick={openEdit}
                  className="bg-cyan-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-cyan-600/20 hover:bg-cyan-700 transition-all active:scale-95 text-sm"
                >
                  Edit Profile
                </button>
              </div>

              {/* DETAILS */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-10">
                <Info label="AGE" value={`${form.age || "-"} Years`} />
                <Info label="GENDER" value={form.gender} />
                <Info label="BLOOD GROUP" value={form.blood_group} />
                <Info label="PHONE" value={form.phone} />
                <Info label="EMERGENCY" value={form.emergency_contact} />
                <Info label="LOCATION" value={form.address} />
              </div>

              {/* MEDICAL HISTORY */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Medical History</p>
                <div className="flex flex-wrap gap-2">
                  {(form.medical_history || "None")
                    .split(",")
                    .map((item, i) => (
                      <span
                        key={i}
                        className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl text-sm font-bold text-gray-600"
                      >
                        {item.trim()}
                      </span>
                    ))}
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* ACCOUNT SETTINGS — only shown in view mode */}
      {!isEditing && (
        <>
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">Account Settings</h3>
              <button
                onClick={() => setShowAccountSettings(o => !o)}
                className="text-xs font-black px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all uppercase tracking-widest"
              >
                {showAccountSettings ? "Hide" : "Change Password"}
              </button>
            </div>

            {showAccountSettings && (
              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* EMAIL */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Registered Email Address</label>
                  <div className="bg-gray-50 px-4 py-3.5 rounded-xl border border-gray-100 font-bold text-gray-700">{email}</div>
                  <p className="text-[10px] font-bold text-gray-400 mt-2 ml-1">
                    Contact admin to change your primary email.
                  </p>
                </div>

                {/* PASSWORD */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Update Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border border-gray-100 bg-gray-50 rounded-xl px-4 py-3.5 w-full font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                  />
                  <button
                    onClick={changePassword}
                    className="bg-black text-white w-full py-4 rounded-xl font-black shadow-lg shadow-gray-900/10 hover:bg-black transition-all active:scale-95"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <SmallCard title="Notifications" subtitle="Manage alerts & emails" icon="🔔" />
            <SmallCard title="Privacy" subtitle="Data sharing settings" icon="🔒" />
            <SmallCard title="Sessions" subtitle="Manage logged in devices" icon="📱" />
          </div>
        </>
      )}

    </div>
  );
};

const Field = ({ label, name, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 w-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all font-medium"
    />
  </div>
);

const Info = ({ label, value }) => (
  <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-50 group hover:bg-white hover:border-gray-100 transition-all">
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="font-black text-gray-900">{value || "-"}</p>
  </div>
);

const SmallCard = ({ title, subtitle, icon }) => (
  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group cursor-pointer">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">{icon}</div>
      <div>
        <p className="font-black text-gray-900 group-hover:text-cyan-600 transition-colors uppercase tracking-tight text-sm">{title}</p>
        <p className="text-xs font-bold text-gray-400">{subtitle}</p>
      </div>
    </div>
  </div>
);

export default PatientProfile;
