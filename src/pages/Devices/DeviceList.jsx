import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Wifi,
  Power,
  RefreshCw,
  Activity,
  Monitor,
  Eye,
} from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { deviceService } from "../../services/deviceService";
import { useDeviceStore } from "../../store/deviceStore";
import Button from "../../components/UI/Button";
import Modal from "../../components/UI/Modal";
import DataTable from "../../components/UI/DataTable";
import DeviceForm from "../../components/Forms/DeviceForm";
import BulkOperations from "../../components/Bulk/BulkOperations";

const DeviceList = () => {
  const { devices, setDevices, deleteDevice, updateDevice } = useDeviceStore();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [sortBy, setSortBy] = useState("last_seen");
  const [sortDirection, setSortDirection] = useState("desc");
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await deviceService.getAllDevices();
      // Ensure we're setting an array, even if the response is null/undefined
      const devicesArray = Array.isArray(response.rpis)
        ? response.rpis
        : Array.isArray(response)
        ? response
        : [];
      setDevices(devicesArray);
    } catch (error) {
      toast.error("Failed to fetch devices");
      console.error("Error fetching devices:", error);
      // Set empty array on error to prevent iterable issues
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDevice = async (data) => {
    try {
      const response = await deviceService.createDevice(data);
      if (response.rpis) {
        setDevices((prev) => [...(prev || []), response.rpis]);
      }
      setShowModal(false);
      toast.success("Device created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create device");
      console.error("Error creating device:", error);
    }
  };

  const handleUpdateDevice = async (data) => {
    try {
      const response = await deviceService.updateDevice(
        editingDevice._id,
        data
      );
      if (response.rpis) {
        updateDevice(editingDevice._id, response.rpis);
      }
      setShowModal(false);
      setEditingDevice(null);
      toast.success("Device updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update device");
      console.error("Error updating device:", error);
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (
      !confirm(
        "Are you sure you want to delete this device? This action cannot be undone."
      )
    )
      return;

    try {
      await deviceService.deleteDevice(deviceId);
      deleteDevice(deviceId);
      // Remove from selected devices if present
      setSelectedDevices((prev) => prev.filter((id) => id !== deviceId));
      toast.success("Device deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete device");
      console.error("Error deleting device:", error);
    }
  };

  const handleStatusUpdate = async (deviceId, status) => {
    try {
      await deviceService.updateDeviceStatus(deviceId, status);
      updateDevice(deviceId, { rpi_status: status });
      toast.success(
        `Device ${status === "active" ? "activated" : "deactivated"}`
      );
    } catch (error) {
      toast.error("Failed to update device status");
      console.error("Error updating device status:", error);
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedDevices.length === 0) {
      toast.error("Please select devices first");
      return;
    }

    try {
      setBulkActionLoading(true);
      const updates = selectedDevices.map((id) => ({
        id,
        rpi_status: status,
      }));

      const response = await deviceService.bulkUpdateDevices({ updates });

      // Update local state
      selectedDevices.forEach((deviceId) => {
        updateDevice(deviceId, { rpi_status: status });
      });

      toast.success(
        `${selectedDevices.length} devices ${
          status === "active" ? "activated" : "deactivated"
        }`
      );
      setSelectedDevices([]);
    } catch (error) {
      toast.error("Failed to update device status");
      console.error("Error updating device status:", error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDevices.length === 0) {
      toast.error("Please select devices first");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedDevices.length} devices? This action cannot be undone.`
      )
    )
      return;

    try {
      setBulkActionLoading(true);
      await deviceService.bulkDeleteDevices({ ids: selectedDevices });

      // Update local state
      selectedDevices.forEach((deviceId) => {
        deleteDevice(deviceId);
      });

      toast.success(`${selectedDevices.length} devices deleted successfully`);
      setSelectedDevices([]);
    } catch (error) {
      toast.error("Failed to delete devices");
      console.error("Error deleting devices:", error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkActionComplete = () => {
    setSelectedDevices([]);
    fetchDevices(); // Refresh data
  };

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(columnKey);
      setSortDirection("asc");
    }
  };

  const getStatusConfig = (status) => {
    const statusConfig = {
      active: {
        color: "green",
        label: "Active",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
      },
      in_active: {
        color: "red",
        label: "Inactive",
        bgColor: "bg-red-100",
        textColor: "text-red-800",
      },
      warning: {
        color: "yellow",
        label: "Warning",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
      },
      maintenance: {
        color: "blue",
        label: "Maintenance",
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
      },
    };

    return statusConfig[status] || statusConfig.in_active;
  };

  // Fix: Ensure devices is always an array before spreading
  const sortedDevices = Array.isArray(devices)
    ? [...devices].sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        // Handle date sorting
        if (
          sortBy === "last_seen" ||
          sortBy === "createdAt" ||
          sortBy === "updatedAt"
        ) {
          aValue = new Date(aValue || 0);
          bValue = new Date(bValue || 0);
        }

        // Handle status sorting
        if (sortBy === "rpi_status") {
          const statusOrder = {
            active: 1,
            warning: 2,
            maintenance: 3,
            in_active: 4,
          };
          aValue = statusOrder[aValue] || 5;
          bValue = statusOrder[bValue] || 5;
        }

        if (sortDirection === "asc") {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      })
    : [];

  const columns = [
    {
      key: "select",
      header: (
        <input
          type="checkbox"
          checked={
            Array.isArray(devices) &&
            selectedDevices.length === devices.length &&
            devices.length > 0
          }
          onChange={(e) => {
            if (e.target.checked && Array.isArray(devices)) {
              setSelectedDevices(devices.map((d) => d._id));
            } else {
              setSelectedDevices([]);
            }
          }}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      ),
      render: (device) => (
        <input
          type="checkbox"
          checked={selectedDevices.includes(device._id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedDevices([...selectedDevices, device._id]);
            } else {
              setSelectedDevices(
                selectedDevices.filter((id) => id !== device._id)
              );
            }
          }}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      ),
      cellClassName: "w-12 px-4",
    },
    {
      key: "rpi_name",
      header: "Device",
      sortable: true,
      render: (device) => (
        <Link
          to={`/devices/${device._id}`}
          className="flex items-center space-x-3 hover:text-primary-600 transition-colors"
        >
          <div className="flex-shrink-0">
            <Monitor className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{device.rpi_name}</div>
            <div className="text-sm text-gray-500">{device.rpi_id}</div>
            {device.vehicle_no && (
              <div className="text-xs text-gray-400 mt-1">
                Vehicle: {device.vehicle_no}
              </div>
            )}
          </div>
        </Link>
      ),
    },
    {
      key: "location",
      header: "Location",
      sortable: true,
      render: (device) => (
        <div>
          <div className="text-sm text-gray-900">
            {device.location || "Not specified"}
          </div>
          {device.owner_name && (
            <div className="text-xs text-gray-500 mt-1">
              {device.owner_name}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "rpi_status",
      header: "Status",
      sortable: true,
      render: (device) => {
        const config = getStatusConfig(device.rpi_status);

        return (
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}
            >
              <div
                className={`w-2 h-2 rounded-full bg-${config.color}-500 mr-1`}
              ></div>
              {config.label}
            </span>
            {device.last_seen && (
              <div className="text-xs text-gray-500">
                {new Date(device.last_seen).toLocaleDateString()}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "display",
      header: "Displays",
      render: (device) => {
        const displayCount = device.display?.length || 0;
        return (
          <div className="text-sm text-gray-900">
            {displayCount > 0 ? (
              <span className="flex items-center space-x-1">
                <Eye className="h-4 w-4 text-gray-400" />
                <span>
                  {displayCount} display{displayCount !== 1 ? "s" : ""}
                </span>
              </span>
            ) : (
              <span className="text-gray-400">No displays</span>
            )}
          </div>
        );
      },
    },
    {
      key: "last_seen",
      header: "Last Seen",
      sortable: true,
      render: (device) => {
        if (!device.last_seen)
          return <span className="text-gray-400">Never</span>;

        const lastSeen = new Date(device.last_seen);
        const now = new Date();
        const diffMs = now - lastSeen;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        let timeAgo = "";
        if (diffMins < 1) timeAgo = "Just now";
        else if (diffMins < 60) timeAgo = `${diffMins}m ago`;
        else if (diffHours < 24) timeAgo = `${diffHours}h ago`;
        else timeAgo = `${diffDays}d ago`;

        return (
          <div>
            <div className="text-sm text-gray-900">{timeAgo}</div>
            <div className="text-xs text-gray-500">
              {lastSeen.toLocaleDateString()}
            </div>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (device) => (
        <div className="flex items-center space-x-2">
          <Link
            to={`/devices/${device.rpi_id}`}
            className="text-primary-600 hover:text-primary-900 transition-colors p-1 rounded"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Link>

          <button
            onClick={() => {
              setEditingDevice(device);
              setShowModal(true);
            }}
            className="text-yellow-600 hover:text-yellow-900 transition-colors p-1 rounded"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>

          <button
            onClick={() =>
              handleStatusUpdate(
                device._id,
                device.rpi_status === "active" ? "in_active" : "active"
              )
            }
            className={`p-1 rounded transition-colors ${
              device.rpi_status === "active"
                ? "text-red-600 hover:text-red-900"
                : "text-green-600 hover:text-green-900"
            }`}
            title={device.rpi_status === "active" ? "Deactivate" : "Activate"}
          >
            <Power className="h-4 w-4" />
          </button>

          <button
            onClick={() => handleDeleteDevice(device._id)}
            className="text-red-600 hover:text-red-900 transition-colors p-1 rounded"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      cellClassName: "w-32",
    },
  ];

  // Fix: Ensure devices is an array before using filter
  const devicesArray = Array.isArray(devices) ? devices : [];
  const activeDevicesCount = devicesArray.filter(
    (d) => d.rpi_status === "active"
  ).length;
  const inactiveDevicesCount = devicesArray.filter(
    (d) => d.rpi_status === "in_active"
  ).length;
  const warningDevicesCount = devicesArray.filter(
    (d) => d.rpi_status === "warning"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devices</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your Raspberry Pi advertising displays ({devicesArray.length}{" "}
            total devices)
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link to="/devices/health">
            <Button variant="outline" icon={Activity}>
              Health Monitor
            </Button>
          </Link>
          <Button
            onClick={() => {
              setEditingDevice(null);
              setShowModal(true);
            }}
            icon={Plus}
          >
            Add Device
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeDevicesCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">
                {inactiveDevicesCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Warning</p>
              <p className="text-2xl font-bold text-gray-900">
                {warningDevicesCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Operations */}
      {selectedDevices.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Monitor className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-800">
                  {selectedDevices.length} device
                  {selectedDevices.length !== 1 ? "s" : ""} selected
                </h3>
                <p className="text-sm text-blue-600 mt-1">
                  Choose an action to perform on all selected devices
                </p>
              </div>
            </div>

            <div className="mt-3 sm:mt-0 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusUpdate("active")}
                loading={bulkActionLoading}
                icon={Power}
              >
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusUpdate("in_active")}
                loading={bulkActionLoading}
                icon={Power}
              >
                Deactivate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                loading={bulkActionLoading}
                icon={Trash2}
              >
                Delete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDevices([])}
                disabled={bulkActionLoading}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Operations Component */}
      <BulkOperations
        selectedDevices={selectedDevices}
        onComplete={handleBulkActionComplete}
      />

      {/* Devices Table */}
      <DataTable
        columns={columns}
        data={sortedDevices}
        loading={loading}
        onSort={handleSort}
        sortBy={sortBy}
        sortDirection={sortDirection}
        emptyMessage={
          <div className="text-center py-12">
            <Monitor className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No devices
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first device.
            </p>
            <div className="mt-6">
              <Button onClick={() => setShowModal(true)} icon={Plus}>
                Add Device
              </Button>
            </div>
          </div>
        }
      />

      {/* Add/Edit Device Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingDevice(null);
        }}
        title={editingDevice ? "Edit Device" : "Add New Device"}
        size="lg"
      >
        <DeviceForm
          device={editingDevice}
          onSubmit={editingDevice ? handleUpdateDevice : handleCreateDevice}
          onCancel={() => {
            setShowModal(false);
            setEditingDevice(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default DeviceList;
