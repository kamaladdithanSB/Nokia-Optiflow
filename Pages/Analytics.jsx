
import React, { useState, useEffect, useCallback } from "react";
import { Job, Machine, Worker } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from "recharts";
import { TrendingUp, BarChart3, Clock, Target } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Analytics() {
  const [jobs, setJobs] = useState([]);
  const [machines, setMachines] = useState([]);
  const [analytics, setAnalytics] = useState({
    hourlyThroughput: [],
    machineUtilization: [],
    jobsByPriority: [],
    efficiencyTrend: []
  });

  // Memoize generateAnalytics to prevent re-creation on every render, as it's a dependency of loadData.
  // setAnalytics is a stable function provided by React, so it doesn't need to be in the deps array.
  const generateAnalytics = useCallback((jobsData, machinesData) => {
    // Hourly throughput simulation
    const hourlyThroughput = Array.from({length: 24}, (_, hour) => ({
      hour: `${hour}:00`,
      completed: Math.floor(Math.random() * 10) + 5,
      target: 12
    }));

    // Machine utilization
    const machineUtilization = machinesData.map(machine => ({
      name: machine.name,
      // Ensure division by zero is handled if capacity is 0
      utilization: machine.capacity > 0 ? Math.round((machine.current_load / machine.capacity) * 100) : 0,
      capacity: machine.capacity,
      current: machine.current_load
    }));

    // Jobs by priority
    const priorityCounts = jobsData.reduce((acc, job) => {
      acc[job.priority] = (acc[job.priority] || 0) + 1;
      return acc;
    }, {});

    const jobsByPriority = Object.entries(priorityCounts).map(([priority, count]) => ({
      name: priority,
      value: count
    }));

    // Efficiency trend (simulated)
    const efficiencyTrend = Array.from({length: 7}, (_, day) => ({
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][day],
      efficiency: Math.floor(Math.random() * 20) + 75,
      utilization: Math.floor(Math.random() * 15) + 80
    }));

    setAnalytics({
      hourlyThroughput,
      machineUtilization,
      jobsByPriority,
      efficiencyTrend
    });
  }, [setAnalytics]); // setAnalytics is stable

  // Memoize loadData as it's used in useEffect.
  // Its dependencies (generateAnalytics, setJobs, setMachines) are either stable or memoized.
  const loadData = useCallback(async () => {
    const [jobsData, machinesData] = await Promise.all([
      Job.list('-created_date', 100),
      Machine.list()
    ]);
    
    setJobs(jobsData);
    setMachines(machinesData);
    generateAnalytics(jobsData, machinesData);
  }, [generateAnalytics, setJobs, setMachines]); // generateAnalytics, setJobs, setMachines are stable callbacks/setters

  useEffect(() => {
    loadData();
  }, [loadData]); // loadData is now a stable callback

  const completedJobs = jobs.filter(j => j.status === 'completed').length;
  // Calculate average efficiency, avoiding division by zero
  const avgEfficiency = machines.length > 0 ? Math.round(machines.reduce((acc, m) => acc + m.efficiency_rating, 0) / machines.length) : 0;
  // Calculate total utilization, avoiding division by zero for individual machines and overall
  const totalUtilization = machines.length > 0 ? Math.round(machines.reduce((acc, m) => acc + (m.capacity > 0 ? (m.current_load / m.capacity) * 100 : 0), 0) / machines.length) : 0;

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Production Analytics</h1>
          <p className="text-gray-600">Performance insights and forecasting</p>
        </div>

        {/* KPI Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-600">Completed Jobs</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{completedJobs}</div>
              <div className="text-sm text-green-600 flex items-center justify-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                +12% vs last week
              </div>
            </CardContent>
          </Card>

          <Card className="text-center shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-600">Avg Efficiency</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{avgEfficiency}%</div>
              <div className="text-sm text-blue-600 flex items-center justify-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                +5% vs target
              </div>
            </CardContent>
          </Card>

          <Card className="text-center shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-600">Utilization</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{totalUtilization}%</div>
              <div className="text-sm text-purple-600 flex items-center justify-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                Optimal range
              </div>
            </CardContent>
          </Card>

          <Card className="text-center shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-gray-600">On-Time Rate</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">94%</div>
              <div className="text-sm text-orange-600 flex items-center justify-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                Above target (90%)
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="utilization">Utilization</TabsTrigger>
            <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Hourly Throughput</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.hourlyThroughput}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="completed" fill="#0088FE" />
                      <Bar dataKey="target" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Job Priority Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.jobsByPriority}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {analytics.jobsByPriority.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Weekly Efficiency Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.efficiencyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="efficiency" stroke="#0088FE" strokeWidth={3} />
                    <Line type="monotone" dataKey="utilization" stroke="#00C49F" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="utilization" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Machine Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analytics.machineUtilization} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="utilization" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forecasting" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>AI Predictions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800">Next 4 Hours</h4>
                    <p className="text-blue-600">Expected throughput: 45-52 jobs</p>
                    <p className="text-blue-600">Risk of delays: Low (12%)</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-yellow-800">Tomorrow</h4>
                    <p className="text-yellow-600">Machine CNC-01 maintenance recommended</p>
                    <p className="text-yellow-600">Peak demand expected at 14:00-16:00</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800">This Week</h4>
                    <p className="text-green-600">Efficiency target achievable (94%)</p>
                    <p className="text-green-600">Recommended: 2 additional workers Thu-Fri</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Optimization Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium text-gray-900">High Priority</h4>
                        <p className="text-sm text-gray-600">Redistribute jobs from CNC-02 to CNC-01 for better load balancing</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium text-gray-900">Medium Priority</h4>
                        <p className="text-sm text-gray-600">Schedule preventive maintenance for Assembly-01 this weekend</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium text-gray-900">Low Priority</h4>
                        <p className="text-sm text-gray-600">Consider cross-training workers for packaging operations</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
