import React, { useState, useEffect } from "react";
import { Job, Worker, Machine } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, User, Wrench, AlertCircle, Upload, Database } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import JobStatusUpdater from "../components/jobs/JobStatusUpdater";
import BulkUpload from "../Components/jobs/BulkUpload";
import CompanyDataset from "../components/jobs/CompanyDataset";

const priorityColors = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200", 
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-green-100 text-green-800 border-green-200"
};

const statusColors = {
  queued: "bg-gray-100 text-gray-800 border-gray-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200", 
  delayed: "bg-red-100 text-red-800 border-red-200"
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("jobs");
  const [newJob, setNewJob] = useState({
    title: "",
    duration: "",
    priority: "medium",
    machine_type: "cnc",
    required_skills: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [jobsData, workersData, machinesData] = await Promise.all([
      Job.list('-created_date', 50),
      Worker.list(),
      Machine.list()
    ]);
    setJobs(jobsData);
    setWorkers(workersData);
    setMachines(machinesData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await Job.create({
      ...newJob,
      duration: parseFloat(newJob.duration),
      status: "queued"
    });
    setNewJob({ title: "", duration: "", priority: "medium", machine_type: "cnc", required_skills: [] });
    setShowForm(false);
    loadData();
  };

  const handleStatusChange = async (updatedJob) => {
    await Job.update(updatedJob.id, updatedJob);
    loadData();
  };

  const getWorkerName = (workerId) => {
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : 'Unassigned';
  };

  const getMachineName = (machineId) => {
    const machine = machines.find(m => m.id === machineId);
    return machine ? machine.name : 'Not assigned';
  };

  const filteredJobs = jobs.filter(job => {
    const matchesStatus = filterStatus === "all" || job.status === filterStatus;
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getWorkerName(job.assigned_worker).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const jobStats = {
    total: jobs.length,
    queued: jobs.filter(j => j.status === 'queued').length,
    in_progress: jobs.filter(j => j.status === 'in_progress').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    delayed: jobs.filter(j => j.status === 'delayed').length
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Queue Management</h1>
            <p className="text-gray-600 mt-1">Monitor and manage production jobs with employee assignments</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Job
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="dataset" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Dataset
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-gray-900">{jobStats.total}</div>
                  <div className="text-sm text-gray-500">Total Jobs</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-gray-600">{jobStats.queued}</div>
                  <div className="text-sm text-gray-500">Queued</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{jobStats.in_progress}</div>
                  <div className="text-sm text-gray-500">In Progress</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">{jobStats.completed}</div>
                  <div className="text-sm text-gray-500">Completed</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">{jobStats.delayed}</div>
                  <div className="text-sm text-gray-500">Delayed</div>
                </CardContent>
              </Card>
            </div>

            {showForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Job</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Job title"
                        value={newJob.title}
                        onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                        required
                      />
                      <Input
                        type="number"
                        placeholder="Duration (hours)" 
                        value={newJob.duration}
                        onChange={(e) => setNewJob({...newJob, duration: e.target.value})}
                        required
                      />
                      <Select 
                        value={newJob.priority}
                        onValueChange={(value) => setNewJob({...newJob, priority: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={newJob.machine_type}
                        onValueChange={(value) => setNewJob({...newJob, machine_type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cnc">CNC</SelectItem>
                          <SelectItem value="assembly">Assembly</SelectItem>
                          <SelectItem value="testing">Testing</SelectItem>
                          <SelectItem value="packaging">Packaging</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Create Job</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Filters */}
            <div className="flex gap-4">
              <Input
                placeholder="Search jobs or employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Jobs List */}
            <div className="grid gap-4">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">{job.title}</h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {job.duration}h
                              </div>
                              <div className="flex items-center gap-1">
                                <Wrench className="w-4 h-4" />
                                {job.machine_type} • {getMachineName(job.assigned_machine)}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {getWorkerName(job.assigned_worker)}
                              </div>
                            </div>
                            {job.start_time && (
                              <div className="text-sm text-blue-600 mt-1">
                                Started: {new Date(job.start_time).toLocaleString()}
                                {job.end_time && ` • Completed: ${new Date(job.end_time).toLocaleString()}`}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={priorityColors[job.priority]}>
                            {job.priority === 'critical' && <AlertCircle className="w-3 h-3 mr-1" />}
                            {job.priority}
                          </Badge>
                          <Badge className={statusColors[job.status]}>
                            {job.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      <JobStatusUpdater 
                        job={job}
                        onStatusChange={handleStatusChange}
                        workers={workers}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <BulkUpload onUploadComplete={loadData} />
          </TabsContent>

          <TabsContent value="dataset" className="space-y-6">
            <CompanyDataset onDataUpdate={loadData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}