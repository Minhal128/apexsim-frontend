"use client";
import React, { useState } from 'react';
import { BsGoogle, BsFillPhoneFill } from "react-icons/bs";
import { IoMdMail } from "react-icons/io";
import { MdLock, MdDesktopMac, MdDelete } from "react-icons/md";
import { FaWallet } from "react-icons/fa6";
import { PiDesktopTowerFill } from "react-icons/pi";
import { apiRequest } from "@/lib/api";

interface SecurityRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  actionText: string;
  info?: string;
  onClick?: () => void;
  actionColor?: string;
}

const SecurityRow = ({
  icon,
  title,
  subtitle,
  actionText,
  info,
  onClick,
  actionColor
}: SecurityRowProps) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 sm:py-6 border-b border-white/5 last:border-0">

    <div className="flex items-start gap-4">
      <div className="text-gray-400 text-xl mt-1 sm:mt-0">
        {icon}
      </div>

      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 sm:w-207.5">
          <h4 className="font-semibold text-[15px] text-white">
            {title}
          </h4>

          {info && (
            <span className="text-gray-50 text-sm font-medium break-all sm:break-normal">
              {info}
            </span>
          )}
        </div>

        <p className="text-gray-500 text-xs mt-1 leading-relaxed max-w-full sm:max-w-187.5">
          {subtitle}
        </p>
      </div>
    </div>

    <button
      onClick={onClick}
      className={`self-start sm:self-center py-2 px-4 rounded text-sm font-semibold transition-all cursor-pointer min-w-22.5 ${actionColor || "bg-[#222222] text-white"}`}
    >
      {actionText}
    </button>
  </div>
);

interface SecuritySettingsProps {
  user: any;
}

export default function SecuritySettings({ user }: SecuritySettingsProps) {
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [deviceData, setDeviceData] = useState<any[]>([]);
  const [addressData, setAddressData] = useState<any[]>([]);

  const [qrCode, setQrCode] = useState("");
  const [token, setToken] = useState("");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [newAddress, setNewAddress] = useState({ address: '', label: '', network: 'TRC20' });

  const fetchActivity = async () => {
    try {
      const data = await apiRequest("/profile/activity");
      setActivityData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDevices = async () => {
    try {
      const data = await apiRequest("/profile/devices");
      setDeviceData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAddresses = async () => {
    try {
      const data = await apiRequest("/profile/whitelisted-addresses");
      setAddressData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    try {
      await apiRequest(`/profile/devices/${deviceId}`, { method: 'DELETE' });
      fetchDevices();
    } catch (err) {
      alert("Failed to remove device");
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.address) return;
    try {
      await apiRequest("/profile/whitelisted-addresses", {
        method: "POST",
        body: JSON.stringify(newAddress)
      });
      setNewAddress({ address: '', label: '', network: 'TRC20' });
      fetchAddresses();
    } catch (err) {
      alert("Failed to add address");
    }
  };

  const handleRemoveAddress = async (id: string) => {
    try {
      await apiRequest(`/profile/whitelisted-addresses/${id}`, { method: 'DELETE' });
      fetchAddresses();
    } catch (err) {
      alert("Failed to remove address");
    }
  };

  const handleSetup2FA = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/profile/2fa/setup", { method: "POST" });
      setQrCode(data.qrCode);
      setShow2FAModal(true);
    } catch (err: any) {
      setError(err.message || "Failed to setup 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    setLoading(true);
    setError("");
    try {
      await apiRequest("/profile/2fa/verify", {
        method: "POST",
        body: JSON.stringify({ token })
      });
      setShow2FAModal(false);
      window.location.reload(); // Refresh to update user state
    } catch (err: any) {
      setError(err.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm("Are you sure you want to disable Google Authenticator?")) return;
    setLoading(true);
    try {
      await apiRequest("/profile/2fa/disable", { method: "POST" });
      window.location.reload();
    } catch (err: any) {
      alert(err.message || "Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePhone = async () => {
    setLoading(true);
    setError("");
    try {
      await apiRequest("/profile/update", {
        method: "PUT",
        body: JSON.stringify({ phone })
      });
      setShowPhoneModal(false);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to update phone");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    setLoading(true);
    setError("");
    try {
      await apiRequest("/profile/update", {
        method: "PUT",
        body: JSON.stringify({ email })
      });
      setShowEmailModal(false);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to update email");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await apiRequest("/profile/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword })
      });
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      alert("Password changed successfully");
    } catch (err: any) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white font-manrope px-3 sm:px-4">
      <div className="max-w-5xl md:py-0 py-5 mx-auto space-y-10 sm:space-y-12">
        {error && !show2FAModal && !showPhoneModal && (
          <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg text-red-500 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Authentication Method */}
        <section className="border-b-4 border-b-[#181818] pb-2">
          <h3 className="text-gray-50 text-lg font-medium mb-2">
            Authentication method
          </h3>

          <div>
            <SecurityRow
              icon={<BsGoogle />}
              title="Google Authenticator"
              subtitle="API Secure verification when withdrawing, retrieving passwords, modifying security settings and managing API"
              actionText={user?.twoFactorEnabled ? "Disable" : "Bind"}
              actionColor={user?.twoFactorEnabled ? "bg-red-600/20 text-red-500" : ""}
              onClick={user?.twoFactorEnabled ? handleDisable2FA : handleSetup2FA}
            />

            <SecurityRow
              icon={<BsFillPhoneFill />}
              title="Phone number"
              info={user?.phone || "Not linked"}
              subtitle="Receive verification SMS that is used to withdraw, change the password or security settings"
              actionText={user?.phone ? "Change" : "Bind"}
              onClick={() => setShowPhoneModal(true)}
            />

            <SecurityRow
              icon={<IoMdMail />}
              title="Email address"
              info={user?.email}
              subtitle="Used when logging in, withdrawing and modifying security settings"
              actionText="Change"
              onClick={() => setShowEmailModal(true)}
            />
          </div>
        </section>

        {/* Advanced Security */}
        <section className="border-b-4 border-b-[#181818] pb-2">
          <h3 className="text-gray-50 text-lg font-medium mb-2">
            Advanced Security
          </h3>

          <div className="bg-[#1c1c1e]/30 rounded-lg">
            <SecurityRow
              icon={<MdLock />}
              title="Password"
              subtitle="Used to manage your account login password"
              actionText="Change"
              onClick={() => setShowPasswordModal(true)}
            />

            <SecurityRow
              icon={<FaWallet />}
              title="Address management"
              subtitle="After setting as a trust address, withdrawals will be exempt from security verification"
              actionText="Manage"
              onClick={() => { fetchAddresses(); setShowAddressModal(true); }}
            />
          </div>
        </section>

        {/* Account Management */}
        <section>
          <h3 className="text-gray-50 text-lg font-medium mb-2">
            Account Management
          </h3>

          <div className="bg-[#1c1c1e]/30 rounded-lg">
            <SecurityRow
              icon={<PiDesktopTowerFill />}
              title="My device"
              subtitle="For managing logged-in devices and viewing device history"
              actionText="Manage"
              onClick={() => { fetchDevices(); setShowDeviceModal(true); }}
            />

            <SecurityRow
              icon={<MdDesktopMac />}
              title="Account activity"
              subtitle={`Last login IP address: ${user?.lastLoginIp || "N/A"}`}
              actionText="Manage"
              onClick={() => { fetchActivity(); setShowActivityModal(true); }}
            />

            <SecurityRow
              icon={<MdDelete />}
              title="Delete account"
              subtitle="After deleting your account, you will never be able to re-register this account and its sub-account email, mobile phone number, and identity information."
              actionText="Delete"
              actionColor="bg-red-600/20 text-red-500"
              onClick={() => alert("Please contact support to delete your account")}
            />
          </div>
        </section>
      </div>

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#181818] border border-white/10 p-6 rounded-xl max-w-sm w-full space-y-4">
            <h3 className="text-xl font-bold text-center">Setup Authenticator</h3>
            <p className="text-gray-400 text-sm text-center">Scan this QR code with your Google Authenticator app</p>
            <div className="bg-white p-2 rounded-lg w-fit mx-auto">
              <img src={qrCode} alt="QR Code" className="w-48 h-48" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-500">Verification Code</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="6-digit code"
                className="w-full bg-[#222] border border-white/5 rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500"
              />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setShow2FAModal(false)} className="flex-1 py-3 text-sm font-semibold text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button
                onClick={handleVerify2FA}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded-lg text-sm font-semibold"
              >
                {loading ? "Verifying..." : "Verify & Enable"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phone Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#181818] border border-white/10 p-6 rounded-xl max-w-sm w-full space-y-4">
            <h3 className="text-xl font-bold">Edit Phone Number</h3>
            <div className="space-y-2">
              <label className="text-xs text-gray-500">New Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                className="w-full bg-[#222] border border-white/5 rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500"
              />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => { setShowPhoneModal(false); setError(""); }} className="flex-1 py-3 text-sm font-semibold text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button
                onClick={handleUpdatePhone}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded-lg text-sm font-semibold"
              >
                {loading ? "Saving..." : "Save Change"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#181818] border border-white/10 p-6 rounded-xl max-w-sm w-full space-y-4">
            <h3 className="text-xl font-bold">Edit Email Address</h3>
            <div className="space-y-2">
              <label className="text-xs text-gray-500">New Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="w-full bg-[#222] border border-white/5 rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500"
              />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => { setShowEmailModal(false); setError(""); }} className="flex-1 py-3 text-sm font-semibold text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button
                onClick={handleUpdateEmail}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded-lg text-sm font-semibold"
              >
                {loading ? "Saving..." : "Save Change"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#181818] border border-white/10 p-6 rounded-xl max-w-sm w-full space-y-4">
            <h3 className="text-xl font-bold">Change Password</h3>
            <div className="space-y-2">
              <label className="text-xs text-gray-500">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#222] border border-white/5 rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-500">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#222] border border-white/5 rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-500">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#222] border border-white/5 rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500"
              />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => { setShowPasswordModal(false); setError(""); }} className="flex-1 py-3 text-sm font-semibold text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded-lg text-sm font-semibold"
              >
                {loading ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#181818] border border-white/10 p-6 rounded-xl max-w-2xl w-full space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Account Activity</h3>
              <button onClick={() => setShowActivityModal(false)} className="text-gray-400 hover:text-white">Close</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-white/5">
                    <th className="py-3">Time</th>
                    <th className="py-3">IP Address</th>
                    <th className="py-3">OS</th>
                    <th className="py-3">Browser</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activityData.map((item, idx) => (
                    <tr key={idx} className="text-sm">
                      <td className="py-3">{new Date(item.timestamp).toLocaleString()}</td>
                      <td className="py-3">{item.ip}</td>
                      <td className="py-3">{item.os}</td>
                      <td className="py-3">{item.browser}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* My Devices Modal */}
      {showDeviceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#181818] border border-white/10 p-6 rounded-xl max-w-2xl w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">My Devices</h3>
              <button onClick={() => setShowDeviceModal(false)} className="text-gray-400 hover:text-white">Close</button>
            </div>
            <div className="space-y-4">
              {deviceData.map((device) => (
                <div key={device.deviceId} className="flex items-center justify-between p-4 bg-[#222] rounded-lg border border-white/5">
                  <div className="flex items-center gap-4">
                    <PiDesktopTowerFill className="text-2xl text-gray-400" />
                    <div>
                      <p className="font-semibold">{device.deviceName}</p>
                      <p className="text-xs text-gray-500">{device.os} • {device.browser}</p>
                      <p className="text-[10px] text-gray-600">Last active: {new Date(device.lastActive).toLocaleString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveDevice(device.deviceId)}
                    className="text-red-500 text-xs font-semibold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Address Management Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#181818] border border-white/10 p-6 rounded-xl max-w-2xl w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Whitelisted Addresses</h3>
              <button onClick={() => setShowAddressModal(false)} className="text-gray-400 hover:text-white">Close</button>
            </div>

            <div className="space-y-3 bg-[#222] p-4 rounded-lg border border-white/5">
              <h4 className="text-sm font-semibold">Add New Address</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Address"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                  className="bg-[#181818] border border-white/5 rounded p-2 text-sm outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Label (e.g. My Wallet)"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  className="bg-[#181818] border border-white/5 rounded p-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-between items-center gap-3">
                <select
                  value={newAddress.network}
                  onChange={(e) => setNewAddress({ ...newAddress, network: e.target.value })}
                  className="bg-[#181818] border border-white/5 rounded p-2 text-sm outline-none"
                >
                  <option value="TRC20">TRC20</option>
                  <option value="ERC20">ERC20</option>
                  <option value="BTC">BTC</option>
                  <option value="SOL">SOL</option>
                </select>
                <button
                  onClick={handleAddAddress}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-sm font-semibold"
                >
                  Add Whitelist
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {addressData.map((addr) => (
                <div key={addr._id} className="flex items-center justify-between p-3 bg-[#1c1c1e] rounded-lg border border-white/5">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-semibold text-sm truncate">{addr.label || 'No Label'}</p>
                    <p className="text-xs text-gray-500 font-mono truncate">{addr.address}</p>
                    <p className="text-[10px] text-blue-500">{addr.network}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveAddress(addr._id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <MdDelete size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
