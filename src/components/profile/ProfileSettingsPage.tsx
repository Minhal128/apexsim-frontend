"use client";
import React, { useState } from 'react';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/components/ToastContext';
import { LuEye, LuSearch, LuCopy } from "react-icons/lu";
import { FaAddressCard } from "react-icons/fa";
import { IoPersonSharp } from "react-icons/io5";
import { AiFillProfile } from "react-icons/ai";

interface PreferenceRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  value?: string;
  actionText: string;
  onClick?: () => void;
}

const PreferenceRow = ({ icon, title, description, value, actionText, onClick }: PreferenceRowProps) => (
  <div className="flex items-start justify-between md:py-3 py-5 border-b border-white/5">
    <div className="flex items-center gap-4">
      <div className="text-gray-400 text-2xl mt-1">
        {icon}
      </div>
      <div className="flex flex-col">
        <h4 className="font-semibold text-white text-[15px]">{title}</h4>
        <p className="text-gray-500 text-xs leading-relaxed max-w-50">
          {description}
        </p>
        {value && <span className="text-white text-sm mt-1 font-medium">{value}</span>}
      </div>
    </div>
    <div>
      <button
        onClick={onClick}
        className="bg-[#222222] text-white text-[12px] px-5 font-semibold py-1 rounded transition-all cursor-pointer"
      >
        {actionText}
      </button>
    </div>
  </div>
);

interface ProfileSettingsProps {
  user: any;
}

export default function ProfileSettings({ user }: ProfileSettingsProps) {
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [nickname, setNickname] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [orderConfirmation, setOrderConfirmation] = useState(user?.preferences?.orderConfirmation ?? true);

  const avatars = [
    "/images/manimage.png",
    "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
    "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    "https://assets.coingecko.com/coins/images/325/small/tether.png",
    "https://assets.coingecko.com/coins/images/4128/small/solana.png",
    "https://assets.coingecko.com/coins/images/825/small/binancecoin.png",
    "https://assets.coingecko.com/coins/images/975/small/cardano.png",
    "https://assets.coingecko.com/coins/images/44/small/xrp.png",
    "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
  ];

  const handleUpdateProfile = async (updates: any) => {
    setLoading(true);
    setError("");
    try {
      await apiRequest("/profile/update", {
        method: "PUT",
        body: JSON.stringify(updates)
      });
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNickname = () => handleUpdateProfile({ name: nickname });
  const handleUpdateAvatar = (avatar: string) => handleUpdateProfile({ avatar });
  const handleToggleOrderConfirmation = () => {
    const newVal = !orderConfirmation;
    setOrderConfirmation(newVal);
    handleUpdateProfile({ preferences: { orderConfirmation: newVal } });
  };

  const toast = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.addToast("File size must be less than 2MB", "warning");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdateAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className=" text-white py-5 md:py-0 font-manrope">
      <div className="max-w-6xl mx-auto">

        {/* Profile Section */}
        <section>
          <h2 className="text-2xl font-semibold px-4">Profile</h2>
          <div className=" px-6">
            <PreferenceRow
              icon={<FaAddressCard />}
              title="Nickname"
              description="Set a customized nickname"
              value={user?.name || "User"}
              actionText="Edit"
              onClick={() => setShowNicknameModal(true)}
            />

            <PreferenceRow
              icon={<IoPersonSharp />}
              title="Avatar"
              description="Select an avatar to personalize your account"
              value={user?.avatar ? "Custom Avatar Set" : "Default Avatar"}
              actionText="Edit"
              onClick={() => setShowAvatarModal(true)}
            />
          </div>
        </section>

        {/* Preference Section */}
        <section>
          <h2 className="text-2xl font-semibold px-4">Preference</h2>
          <div className="px-6">
            <PreferenceRow
              icon={<AiFillProfile />}
              title="Order confirmation"
              description="If you enable the reminder, an order will need to be reconfirmed every time"
              value={orderConfirmation ? "Enabled" : "Disabled"}
              actionText={orderConfirmation ? "Disable" : "Enable"}
              onClick={handleToggleOrderConfirmation}
            />
          </div>
        </section>

      </div>

      {/* Nickname Modal */}
      {showNicknameModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#181818] border border-white/10 p-6 rounded-xl max-w-sm w-full space-y-4">
            <h3 className="text-xl font-bold">Edit Nickname</h3>
            <div className="space-y-2">
              <label className="text-xs text-gray-500">Nickname</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Your nickname"
                className="w-full bg-[#222] border border-white/5 rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500"
              />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => { setShowNicknameModal(false); setError(""); }} className="flex-1 py-3 text-sm font-semibold text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button
                onClick={handleUpdateNickname}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded-lg text-sm font-semibold"
              >
                {loading ? "Saving..." : "Save Change"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#181818] border border-white/10 p-6 rounded-xl max-w-md w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Select Avatar</h3>
              <div className="relative">
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="avatar-upload"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded cursor-pointer transition-colors"
                >
                  Upload New
                </label>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 max-h-80 overflow-y-auto p-1 custom-scrollbar">
              {avatars.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => handleUpdateAvatar(url)}
                  className={`p-2 rounded-lg border-2 transition-all ${user?.avatar === url ? 'border-blue-500 bg-white/5' : 'border-transparent hover:border-white/20'}`}
                >
                  <img src={url} alt={`Avatar ${idx}`} className="w-full aspect-square object-cover rounded-full" />
                </button>
              ))}
            </div>
            {loading && <p className="text-center text-sm text-blue-500">Updating...</p>}
            <div className="flex justify-end">
              <button onClick={() => setShowAvatarModal(false)} className="py-2 px-6 text-sm font-semibold text-gray-400 hover:text-white transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}