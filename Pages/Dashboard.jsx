import React, { useState, useEffect, useCallback } from "react";
import { Job, Machine, Worker } from "@/entities/all";
import { InvokeLLM } from "@/integrations/Core";
import { DragDropContext } from "@hello-pangea/dnd";
import { Activity, Target, Clock, TrendingUp } from "lucide-react";

import KPICards from "../Components/dashboard/KPICards";
import InteractiveGanttChart from "../components/dashboard/InteractiveGanttChart";
import DisruptionSimulator from "../components/dashboard/DisruptionSimulator";
import LiveAlerts from "../components/dashboard/LiveAlerts";
import JobDetailsModal from "../components/dashboard/JobDetailsModal";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [machines, setMachines] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    const [jobsData, machinesData, workersData] = await Promise.all([
      Job.list('-created_date', 50),
      Machine.list(),
      Worker.list()
    ]);
    
    setJobs(jobsData);
    setMachines(machinesData);
    setWorkers(workersData);
    
    calculateKPIs(jobsData, machinesData, workersData);
    generateAlerts(jobsData, machinesData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const calculateKPIs = (jobs, machines, workers) => {
    // ... function content is unchanged
    const activeJobs = jobs.filter(j => j.status === 'in_progress').length;
    const totalJobs = jobs.length;
    const completedJobs = jobs.filter(j => j.status === 'completed').length;
    const operationalMachines = machines.filter(m => m.status === 'operational').length;
    const availableWorkers = workers.filter(w => w.availability === 'available').length;
    
    const utilization = Math.round((operationalMachines / machines.length) * 100);
    const throughput = Math.round((completedJobs / totalJobs) * 100);
    const efficiency = Math.round(((completedJobs + activeJobs) / totalJobs) * 100);

    setKpis([
      {
        title: "Machine Utilization",
        value: `${utilization}%`,
        trend: 5.2,
        icon: Activity,
        bgColor: "bg-blue-500",
        iconColor: "text-blue-500"
      },
      {
        title: "Job Throughput", 
        value: `${activeJobs}/${totalJobs}`,
        trend: 12.5,
        icon: Target,
        bgColor: "bg-green-500", 
        iconColor: "text-green-500"
      },
      {
        title: "Available Workers",
        value: availableWorkers.toString(),
        trend: -2.1,
        icon: Clock,
        bgColor: "bg-yellow-500",
        iconColor: "text-yellow-500"
      },
      {
        title: "Overall Efficiency",
        value: `${efficiency}%`,
        trend: 8.7,
        icon: TrendingUp,
        bgColor: "bg-purple-500",
        iconColor: "text-purple-500"
      }
    ]);
  };

  const generateAlerts = (jobs, machines) => {
    // ... function content is unchanged
    const newAlerts = [];
    
    const delayedJobs = jobs.filter(j => j.status === 'delayed');
    if (delayedJobs.length > 0) {
      newAlerts.push({
        type: 'warning',
        title: 'Jobs Delayed',
        message: `${delayedJobs.length} jobs are behind schedule`,
        timestamp: new Date().toLocaleTimeString()
      });
    }

    const brokenMachines = machines.filter(m => m.status === 'breakdown');
    if (brokenMachines.length > 0) {
      newAlerts.push({
        type: 'critical',
        title: 'Machine Breakdown',
        message: `${brokenMachines.map(m => m.name).join(', ')} requires attention`,
        timestamp: new Date().toLocaleTimeString()
      });
    }

    const idleMachines = machines.filter(m => m.status === 'idle');
    if (idleMachines.length > 2) {
      newAlerts.push({
        type: 'info',
        title: 'Optimization Opportunity', 
        message: `${idleMachines.length} machines are idle - consider job reallocation`,
        timestamp: new Date().toLocaleTimeString()
      });
    }

    setAlerts(newAlerts);
  };

  const handleDisruption = async (disruption) => {
    // ... function content is unchanged
    setIsOptimizing(true);
    
    const newAlert = {
      type: 'critical',
      title: `Disruption: ${disruption.type}`,
      message: `${disruption.resource} affected - rescheduling jobs...`,
      timestamp: disruption.timestamp
    };
    setAlerts(prev => [newAlert, ...prev]);

    try {
      const reschedulingResult = await InvokeLLM({
        prompt: `Production disruption occurred: ${disruption.type} on ${disruption.resource}. Current jobs: ${jobs.length}, Available machines: ${machines.length}, Workers: ${workers.length}. Provide immediate rescheduling recommendations to minimize impact.`,
        response_json_schema: {
          type: "object",
          properties: { recommendations: { type: "array", items: { type: "object", properties: { action: {type: "string"}, resource: {type: "string"}, impact: {type: "string"} } } }, estimated_delay: {type: "number"}, priority_changes: {type: "array", items: {type: "string"}} }
        }
      });

      setTimeout(() => {
        setAlerts(prev => [{
          type: 'info',
          title: 'Schedule Optimized',
          message: `Production rescheduled with ${reschedulingResult.estimated_delay || 15} min delay. AI recommendations applied.`,
          timestamp: new Date().toLocaleTimeString()
        }, ...prev]);
      }, 3000);

    } catch (error) {
      console.error('Optimization failed:', error);
    }
    
    setIsOptimizing(false);
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return; // No change if dropped in same machine

    const job = jobs.find(j => j.id === draggableId);
    if (job) {
      const updatedJob = {
        ...job,
        assigned_machine: destination.droppableId
      };
      
      // Update job in the UI instantly for better UX
      setJobs(prevJobs =>
        prevJobs.map(j => (j.id === draggableId ? updatedJob : j))
      );
      
      // Persist change to the backend
      await Job.update(draggableId, { assigned_machine: destination.droppableId });
      loadData(); // Reload to confirm state
    }
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };
  
  const handleSaveJob = async (updatedJob) => {
    await Job.update(updatedJob.id, updatedJob);
    loadData();
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Production Control Center</h1>
          <p className="text-gray-600">AI-powered adaptive scheduling and resource optimization</p>
        </div>

        {isOptimizing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-blue-800 font-medium">AI optimizing production schedule...</span>
            </div>
          </div>
        )}

        <KPICards kpis={kpis} />

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <InteractiveGanttChart 
              jobs={jobs} 
              machines={machines}
              onJobClick={handleJobClick}
            />
            
            <div className="space-y-6">
              <DisruptionSimulator 
                machines={machines} 
                workers={workers}
                onDisruption={handleDisruption}
              />
              <LiveAlerts alerts={alerts} />
            </div>
          </div>
        </DragDropContext>
      </div>

      <JobDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        job={selectedJob}
        onSave={handleSaveJob}
        workers={workers}
        machines={machines}
      />
    </div>
  );
}