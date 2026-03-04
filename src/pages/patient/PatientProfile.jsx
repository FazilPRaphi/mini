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
};

const PatientProfile = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    else setForm({ ...initialForm, ...data });

    setLoading(false);
  };

  const handleChange = (e) => {
    setForm((p) => ({
      ...p,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (!form.full_name?.trim()) return "Full name required";
    if (!form.age) return "Age required";
    if (!form.gender) return "Gender required";
    if (!form.phone) return "Phone required";
    if (!form.address) return "Address required";
    if (!form.blood_group) return "Blood group required";
    if (!form.emergency_contact) return "Emergency contact required";
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
      .update({ ...form, age: Number(form.age) })
      .eq("id", user.id);

    if (error) toast.error(error.message);
    else {
      toast.success("Profile updated");
      setIsEditing(false);
      setTimeout(() => {
        navigate("/patient-dashboard", { replace: true });
      }, 800);
    }

    setSaving(false);
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
      <div className="p-10 text-center text-gray-500">
        Loading profile...
      </div>
    );

  return (
    <div className="space-y-10">

      {/* PROFILE CARD */}
      <div className="bg-white rounded-2xl p-8 shadow flex flex-col md:flex-row gap-8">

        {/* avatar */}
        <div className="relative">
          <div className="w-28 h-28 rounded-xl bg-orange-200 flex items-center justify-center text-4xl">
            👤
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="absolute bottom-0 right-0 bg-cyan-600 text-white p-2 rounded-lg"
          >
            ✎
          </button>
        </div>

        {/* info */}
        <div className="flex-1">

          <div className="flex justify-between items-start">

            <div>
              <h2 className="text-3xl font-bold">
                {form.full_name || "Patient"}
              </h2>

              <p className="text-cyan-600 text-sm flex items-center gap-2 mt-1">
                ✔ Verified Patient
              </p>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="bg-cyan-600 text-white px-5 py-2 rounded-lg"
            >
              Edit Profile
            </button>

          </div>

          {/* DETAILS */}
          <div className="grid md:grid-cols-3 gap-6 mt-6 text-sm">

            <Info label="AGE" value={`${form.age || "-"} Years`} />
            <Info label="GENDER" value={form.gender} />
            <Info label="BLOOD GROUP" value={form.blood_group} />

            <Info label="PHONE" value={form.phone} />
            <Info label="EMERGENCY CONTACT" value={form.emergency_contact} />
            <Info label="LOCATION" value={form.address} />

          </div>

          {/* MEDICAL HISTORY */}
          <div className="mt-6">
            <p className="font-semibold text-gray-700 mb-2">
              Medical History
            </p>

            <div className="flex flex-wrap gap-2">
              {(form.medical_history || "None")
                .split(",")
                .map((item, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 px-3 py-1 rounded-lg text-sm"
                  >
                    {item}
                  </span>
                ))}
            </div>
          </div>

        </div>
      </div>

      {/* ACCOUNT SETTINGS */}
      <div className="bg-white rounded-2xl p-8 shadow grid md:grid-cols-2 gap-10">

        {/* EMAIL */}
        <div>
          <h3 className="font-semibold mb-4">Account Settings</h3>

          <label className="text-sm text-gray-500">
            Registered Email Address
          </label>

          <div className="bg-gray-100 px-4 py-3 rounded-lg mt-2">
            {email}
          </div>

          <p className="text-xs text-gray-400 mt-2">
            Contact admin to change your primary email.
          </p>
        </div>

        {/* PASSWORD */}
        <div className="space-y-4">

          <label className="text-sm text-gray-500">
            Update Password
          </label>

          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full"
          />

          <button
            onClick={changePassword}
            className="bg-black text-white w-full py-2 rounded-lg"
          >
            Update Password
          </button>

        </div>
      </div>

      {/* BOTTOM CARDS */}
      <div className="grid md:grid-cols-3 gap-6">

        <SmallCard title="Notifications" subtitle="Manage alerts & emails" />
        <SmallCard title="Privacy" subtitle="Data sharing settings" />
        <SmallCard title="Sessions" subtitle="Manage logged in devices" />

      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400">{label}</p>
    <p className="font-medium">{value || "-"}</p>
  </div>
);

const SmallCard = ({ title, subtitle }) => (
  <div className="bg-white rounded-xl p-6 shadow">
    <p className="font-semibold">{title}</p>
    <p className="text-sm text-gray-500">{subtitle}</p>
  </div>
);

export default PatientProfile;