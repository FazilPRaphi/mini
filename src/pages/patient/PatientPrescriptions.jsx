import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import jsPDF from "jspdf";

const PatientPrescriptions = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const downloadPDF = (record) => {

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Medical Prescription", 20, 20);

    doc.setFontSize(12);
    doc.text(`Consultation: ${record.title}`, 20, 35);

    doc.text(
      `Doctor: Dr. ${record.doctor?.full_name || "Unknown"}`,
      20,
      45
    );

    doc.text(
      `Date: ${new Date(record.created_at).toLocaleString()}`,
      20,
      55
    );

    doc.text("Clinical Notes:", 20, 70);

    const notes = doc.splitTextToSize(
      record.description || "No notes",
      170
    );

    doc.text(notes, 20, 80);

    let y = 100;

    doc.text("Medicines:", 20, y);
    y += 10;

    record.prescriptions?.forEach((p, i) => {
      doc.text(`${i + 1}. ${p.medicine_name}`, 20, y);
      y += 8;

      doc.text(`Dosage: ${p.dosage}`, 30, y);
      y += 8;

      if (p.frequency) {
        doc.text(`Frequency: ${p.frequency}`, 30, y);
        y += 8;
      }

      if (p.duration) {
        doc.text(`Duration: ${p.duration}`, 30, y);
        y += 8;
      }

      y += 5;
    });

    doc.save(`prescription-${record.id}.pdf`);
  };

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("medical_records")
      .select(`
        id,
        title,
        description,
        created_at,
        doctor:profiles!medical_records_doctor_profiles_fkey (
          full_name
        ),
        prescriptions (
          id,
          medicine_name,
          dosage,
          frequency,
          duration
        )
      `)
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setRecords(data || []);
    else console.error(error);

    setLoading(false);
  };

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          My Prescriptions
        </h1>
        <p className="text-gray-500 mt-2">
          View your past consultations and prescribed medicines
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl shadow animate-pulse space-y-4"
            >
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-24 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* EMPTY */}
      {!loading && records.length === 0 && (
        <div className="bg-white rounded-2xl p-10 shadow text-center text-gray-500">
          No prescriptions yet
        </div>
      )}

      {/* RECORDS */}
      {!loading && records.length > 0 && (
        <div className="space-y-8">

          {records.map((record) => (

            <div
              key={record.id}
              className="bg-white rounded-2xl shadow p-8 flex flex-col lg:flex-row gap-8"
            >

              {/* LEFT SECTION */}
              <div className="flex-1 space-y-6">

                {/* CATEGORY + DATE */}
                <div className="flex justify-between items-start">

                  <span className="bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded-full">
                    Consultation
                  </span>

                  <div className="text-sm text-gray-500">
                    {new Date(record.created_at).toLocaleString()}
                  </div>

                </div>

                {/* TITLE */}
                <h2 className="text-2xl font-bold text-gray-900">
                  {record.title}
                </h2>

                {/* DOCTOR */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center">
                    👨‍⚕️
                  </div>

                  <div>
                    <p className="font-medium">
                      Dr. {record.doctor?.full_name || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-500">
                      General Physician
                    </p>
                  </div>
                </div>

                {/* CLINICAL NOTES */}
                {record.description && (
                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs font-semibold text-blue-600 mb-2">
                      CLINICAL NOTES
                    </p>

                    <p className="text-sm text-gray-700 leading-relaxed">
                      {record.description}
                    </p>

                  </div>
                )}

              </div>

              {/* RIGHT SECTION (MEDICINES) */}
              <div className="w-full lg:w-80 space-y-4">

                <p className="text-sm font-semibold text-gray-600">
                  Prescribed Medicines
                </p>

                {record.prescriptions?.length > 0 ? (
                  record.prescriptions.map((p) => (

                    <div
                      key={p.id}
                      className="border rounded-xl p-4 space-y-2"
                    >

                      <div className="flex justify-between items-center">

                        <p className="font-semibold">
                          {p.medicine_name}
                        </p>

                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                          ACTIVE
                        </span>

                      </div>

                      <p className="text-sm text-gray-500">
                        {p.dosage} • {p.frequency}
                      </p>

                      {p.duration && (
                        <p className="text-xs text-gray-400">
                          Duration: {p.duration}
                        </p>
                      )}

                    </div>

                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No medicines added.
                  </p>
                )}

                {/* ACTION BUTTONS */}
                <div className="flex gap-3 pt-4">

                  <button
                    onClick={() => downloadPDF(record)}
                    className="border border-blue-500 text-blue-500 px-4 py-2 rounded-lg text-sm hover:bg-blue-50"
                  >
                    Download PDF
                  </button>

                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                    Order Refill
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>
      )}
    </div>
  );
};

export default PatientPrescriptions;