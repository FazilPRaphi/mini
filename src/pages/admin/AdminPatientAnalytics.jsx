import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import toast from "react-hot-toast";

const COLORS = ["#00C49F", "#FF8042", "#0088FE", "#FFBB28", "#8884d8", "#82ca9d"];

const AdminPatientAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [activityData, setActivityData] = useState([]);
    const [topPatientsData, setTopPatientsData] = useState([]);
    const [timelineData, setTimelineData] = useState([]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);

            // Fetch patients
            const { data: patients, error: pError } = await supabase
                .from("profiles")
                .select("id, full_name")
                .eq("role", "patient");

            if (pError) {
                toast.error("Error fetching patients");
                setLoading(false);
                return;
            }

            // Fetch bookings
            const { data: bookings, error: bError } = await supabase
                .from("appointment_bookings")
                .select("id, patient_id, appointment_id");

            // Fetch appointments to get dates
            const { data: appointments, error: aError } = await supabase
                .from("appointments")
                .select("id, date");

            if (bError || aError) {
                toast.error(bError?.message || aError?.message || "Error fetching booking data");
                setLoading(false);
                return;
            }

            // Map appointments by ID
            const appMap = {};
            (appointments || []).forEach(a => appMap[a.id] = a.date);

            // Process patient stats
            const patientStats = {};
            (patients || []).forEach(p => {
                patientStats[p.id] = { name: p.full_name || "Unknown", booked: 0 };
            });

            const dateCount = {};

            (bookings || []).forEach(b => {
                if (patientStats[b.patient_id]) {
                    patientStats[b.patient_id].booked += 1;
                }

                const bDate = appMap[b.appointment_id];
                if (bDate) {
                    if (!dateCount[bDate]) dateCount[bDate] = { date: bDate, bookings: 0 };
                    dateCount[bDate].bookings += 1;
                }
            });

            // 1. Pie Chart: Active vs Inactive Patients
            let activeCount = 0;
            let inactiveCount = 0;
            Object.values(patientStats).forEach(p => {
                if (p.booked > 0) activeCount++;
                else inactiveCount++;
            });

            setActivityData([
                { name: "Active (Booked >= 1)", value: activeCount },
                { name: "Inactive (0 Bookings)", value: inactiveCount }
            ]);

            // 2. Bar Chart: Top Patients by Bookings
            const topData = Object.values(patientStats)
                .filter(p => p.booked > 0)
                .sort((a, b) => b.booked - a.booked)
                .slice(0, 10);

            setTopPatientsData(topData);

            // 3. Line Chart: Booking Timeline
            const tData = Object.values(dateCount).sort((a, b) => new Date(a.date) - new Date(b.date));
            setTimelineData(tData);

            setLoading(false);
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return <p className="text-gray-500 p-8">Loading analytics...</p>;
    }

    return (
        <div className="space-y-8 p-4">
            <h2 className="text-3xl font-bold text-gray-800">Patient Analytics</h2>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* ACTIVE VS INACTIVE PIE CHART */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Patient Engagement Activity</h3>
                    <div className="h-80">
                        {activityData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={activityData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {activityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">No data available</div>
                        )}
                    </div>
                </div>

                {/* TOP PATIENTS BAR CHART */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Top Patients by Appointments</h3>
                    <div className="h-80">
                        {topPatientsData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topPatientsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                    <RechartsTooltip cursor={{ fill: 'transparent' }} />
                                    <Legend verticalAlign="top" height={36} />
                                    <Bar dataKey="booked" name="Total Bookings" fill="#0088FE" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">No data available</div>
                        )}
                    </div>
                </div>

                {/* TIMELINE TREND CHART */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Patient Booking Trends over Time</h3>
                    <div className="h-80">
                        {timelineData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Legend verticalAlign="top" height={36} />
                                    <Line type="monotone" dataKey="bookings" name="Appointments Booked" stroke="#82ca9d" strokeWidth={3} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">No data available</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPatientAnalytics;
