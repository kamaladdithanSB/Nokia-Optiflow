import React, { useState, useEffect } from "react";
import { Machine, Worker } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Wrench, 
  User, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Settings,
  Activity
} from "lucide-react";

const statusIcons = {
  operational: CheckCircle,
  maintenance: Settings, 
  breakdown: AlertCircle,
  idle: Clock,
  available: CheckCircle,
  busy: Activity,
  absent: AlertCircle,
  break: Clock
};

const statusColors = {
  operational: "bg-green-100 text-green-800 border-green-200",
  maintenance: "bg-yellow-100 text-yellow-800 border-yellow-200",
  breakdown: "bg-red-100 text-red-800 border-red-200", 
  idle: "bg-gray-100 text-gray-800 border-gray-200",
  available: "bg-green-100 text-green-800 border-green-200",
  busy: "bg-blue-100 text-blue-800 border-blue-200",
  absent: "bg-red-100 text-red-800 border-red-200",
  break: "bg-yellow-100 text-yellow-800 border-yellow-200"
};

export default function Resources() {
  const [machines, setMachines] = useState([]);
  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    const [machinesData, workersData] = await Promise.all([
      Machine.list(),
      Worker.list()
    ]);
    setMachines(machinesData);
    setWorkers(workersData);
  };

  const getUtilization = (current, capacity) => {
    return Math.round((current / capacity) * 100);
  };

  const machineStats = {
    total: machines.length,
    operational: machines.filter(m => m.status === 'operational').length,
    maintenance: machines.filter(m => m.status === 'maintenance').length,
    breakdown: machines.filter(m => m.status === 'breakdown').length,
    idle: machines.filter(m => m.status === 'idle').length,
    avgUtilization: Math.round(machines.reduce((acc, m) => acc + getUtilization(m.current_load, m.capacity), 0) / machines.length) || 0
  };

  const workerStats = {
    total: workers.length,
    available: workers.filter(w => w.availability === 'available').length,
    busy: workers.filter(w => w.availability === 'busy').length,
    absent: workers.filter(w => w.availability === 'absent').length,
    onBreak: workers.filter(w => w.availability === 'break').length,
    avgEfficiency: Math.round(workers.reduce((acc, w) => acc + w.efficiency_rating, 0) / workers.length) || 0
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resource Management</h1>
          <p className="text-gray-600">Monitor machines and workforce availability</p>
        </div>

        <Tabs defaultValue="machines" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="machines" className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Machines
            </TabsTrigger>
            <TabsTrigger value="workers" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Workers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="machines" className="space-y-6">
            {/* Machine Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-gray-900">{machineStats.total}</div>
                  <div className="text-sm text-gray-500">Total</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">{machineStats.operational}</div>
                  <div className="text-sm text-gray-500">Operational</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-yellow-600">{machineStats.maintenance}</div>
                  <div className="text-sm text-gray-500">Maintenance</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">{machineStats.breakdown}</div>
                  <div className="text-sm text-gray-500">Breakdown</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-gray-600">{machineStats.idle}</div>
                  <div className="text-sm text-gray-500">Idle</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{machineStats.avgUtilization}%</div>
                  <div className="text-sm text-gray-500">Avg Utilization</div>
                </CardContent>
              </Card>
            </div>

            {/* Machines List */}
            <div className="grid gap-4">
              {machines.map((machine) => {
                const StatusIcon = statusIcons[machine.status];
                const utilization = getUtilization(machine.current_load, machine.capacity);
                
                return (
                  <Card key={machine.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${
                            machine.status === 'operational' ? 'bg-green-100' :
                            machine.status === 'maintenance' ? 'bg-yellow-100' :
                            machine.status === 'breakdown' ? 'bg-red-100' : 'bg-gray-100'
                          }`}>
                            <StatusIcon className={`w-6 h-6 ${
                              machine.status === 'operational' ? 'text-green-600' :
                              machine.status === 'maintenance' ? 'text-yellow-600' :
                              machine.status === 'breakdown' ? 'text-red-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{machine.name}</h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                              <span>Type: {machine.type}</span>
                              <span>Location: {machine.location}</span>
                              <span>Capacity: {machine.capacity}</span>
                            </div>
                            <div className="mt-2">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm text-gray-600">Utilization:</span>
                                <span className="text-sm font-medium">{utilization}%</span>
                              </div>
                              <Progress value={utilization} className="w-32 h-2" />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={statusColors[machine.status]}>
                            {machine.status}
                          </Badge>
                          <div className="text-right text-sm text-gray-600">
                            <div>Efficiency: {machine.efficiency_rating}%</div>
                            <div>Load: {machine.current_load}/{machine.capacity}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="workers" className="space-y-6">
            {/* Worker Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-gray-900">{workerStats.total}</div>
                  <div className="text-sm text-gray-500">Total</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">{workerStats.available}</div>
                  <div className="text-sm text-gray-500">Available</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{workerStats.busy}</div>
                  <div className="text-sm text-gray-500">Busy</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">{workerStats.absent}</div>
                  <div className="text-sm text-gray-500">Absent</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-yellow-600">{workerStats.onBreak}</div>
                  <div className="text-sm text-gray-500">On Break</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">{workerStats.avgEfficiency}%</div>
                  <div className="text-sm text-gray-500">Avg Efficiency</div>
                </CardContent>
              </Card>
            </div>

            {/* Workers List */}
            <div className="grid gap-4">
              {workers.map((worker) => {
                const StatusIcon = statusIcons[worker.availability];
                
                return (
                  <Card key={worker.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${
                            worker.availability === 'available' ? 'bg-green-100' :
                            worker.availability === 'busy' ? 'bg-blue-100' :
                            worker.availability === 'absent' ? 'bg-red-100' : 'bg-yellow-100'
                          }`}>
                            <StatusIcon className={`w-6 h-6 ${
                              worker.availability === 'available' ? 'text-green-600' :
                              worker.availability === 'busy' ? 'text-blue-600' :
                              worker.availability === 'absent' ? 'text-red-600' : 'text-yellow-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{worker.name}</h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                              <span>Shift: {worker.shift}</span>
                              <span>Skills: {worker.skills?.join(', ')}</span>
                            </div>
                            {worker.current_job && (
                              <div className="mt-1 text-sm text-blue-600">
                                Current Job: {worker.current_job}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={statusColors[worker.availability]}>
                            {worker.availability}
                          </Badge>
                          <div className="text-right text-sm text-gray-600">
                            <div>Efficiency: {worker.efficiency_rating}%</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}