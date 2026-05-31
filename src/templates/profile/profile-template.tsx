"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout";
import {
  Card,
  CardHeader,
  CardBody,
  Badge,
  Button,
  Input,
} from "@/components/ui";
import UserAvatar from "@/components/user-avatar";
import {
  User,
  Mail,
  Shield,
  Camera,
  Edit,
  Check,
  Calendar,
} from "lucide-react";
import { useUpdateProfile } from "@/hooks/user";

/**
 * User data shape for the profile page.
 */
interface ProfileUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  status: string;
  emailVerified: Date | null;
  createdAt: Date;
}

interface ProfileTemplateProps {
  user: ProfileUser;
}

export const ProfileTemplate = ({ user }: ProfileTemplateProps) => {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name ?? "");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const handleSave = () => {
    setMessage(null);
    updateProfile(
      { name },
      {
        onSuccess: () => {
          setMessage({ type: "success", text: "Profil berhasil diperbarui" });
          setEditing(false);
          router.refresh();
          setTimeout(() => setMessage(null), 3000);
        },
        onError: () => {
          setMessage({
            type: "error",
            text: "Gagal memperbarui profil. Coba lagi.",
          });
        },
      },
    );
  };

  const handleCancel = () => {
    setName(user.name ?? "");
    setEditing(false);
    setMessage(null);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success" as const;
      case "PENDING_VERIFICATION":
        return "warning" as const;
      case "SUSPENDED":
        return "danger" as const;
      default:
        return "default" as const;
    }
  };

  const topbarUser = {
    name: user.name,
    email: user.email,
    image: user.image,
  };

  return (
    <AppLayout
      user={topbarUser}
      title="Profil"
      contentContainerClassName="max-w-6xl pb-20"
    >
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Profil
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Kelola informasi profil Anda
        </p>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`mb-6 flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
            message.type === "success"
              ? "border border-green-200 bg-green-50 text-green-700"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <Check size={16} />
          ) : (
            <Shield size={16} />
          )}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ─── Left Column: Profile Card ──────────────────── */}
        <div className="lg:col-span-1">
          <Card>
            <CardBody className="flex flex-col items-center py-8">
              {/* Avatar */}
              <div className="group relative mb-4">
                <UserAvatar
                  src={user.image}
                  name={user.name}
                  size={96}
                  className="ring-4 ring-slate-100"
                />
                <button
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Ubah Foto"
                  title="Ubah Foto"
                >
                  <Camera size={24} className="text-white" />
                </button>
              </div>

              {/* Name & Email */}
              <h2 className="text-lg font-semibold text-slate-900">
                {user.name || "Pengguna"}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">{user.email}</p>

              {/* Status & Role Badges */}
              <div className="mt-4 flex items-center gap-2">
                <Badge variant={statusVariant(user.status)}>
                  {user.status.replace("_", " ")}
                </Badge>
                <Badge variant="info">{user.role}</Badge>
              </div>

              {/* Joined Date */}
              <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
                <Calendar size={14} />
                <span>Bergabung pada {formatDate(user.createdAt)}</span>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* ─── Right Column: Details & Edit ───────────────── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Personal Information */}
          <Card>
            <CardHeader
              title="Informasi Pribadi"
              action={
                !editing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(true)}
                  >
                    <Edit size={14} />
                    Edit
                  </Button>
                ) : null
              }
            />
            <CardBody>
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="profile-name"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Nama Lengkap
                    </label>
                    <Input
                      id="profile-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama lengkap Anda"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Alamat Email
                    </label>
                    <Input value={user.email ?? ""} disabled />
                    <p className="mt-1 text-xs text-slate-400">
                      Email tidak dapat diubah
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      onClick={handleSave}
                      isLoading={isPending}
                      size="sm"
                    >
                      Simpan Perubahan
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      disabled={isPending}
                    >
                      Batalkan
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <InfoRow
                    icon={<User size={16} className="text-slate-400" />}
                    label="Nama Lengkap"
                    value={user.name || "—"}
                  />
                  <InfoRow
                    icon={<Mail size={16} className="text-slate-400" />}
                    label="Alamat Email"
                    value={user.email || "—"}
                    extra={
                      user.emailVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <Check size={12} />
                          Terverifikasi
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600">
                          Tidak Terverifikasi
                        </span>
                      )
                    }
                  />
                  <InfoRow
                    icon={<Shield size={16} className="text-slate-400" />}
                    label="Peran"
                    value={user.role}
                  />
                </div>
              )}
            </CardBody>
          </Card>

          {/* Account Security */}
          <Card>
            <CardHeader title="Keamanan Akun" />
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Kata Sandi
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Ubah kata sandi Anda untuk keamanan akun
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Ubah Kata Sandi
                  </Button>
                </div>
                <div className="border-t border-slate-100" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Autentikasi Dua Faktor
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Tambahkan lapisan keamanan tambahan untuk akun Anda
                    </p>
                  </div>
                  <Badge variant="default">Segera Hadir</Badge>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Danger Zone */}
          <Card>
            <CardHeader title="Zona Berbahaya" />
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Hapus Akun</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Hapus akun Anda secara permanen
                  </p>
                </div>
                <Button variant="danger" size="sm" disabled>
                  Hapus Akun
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

// Support component — pure JSX only, no logic
const InfoRow = ({
  icon,
  label,
  value,
  extra,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  extra?: React.ReactNode;
}) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <div className="mt-0.5 flex items-center gap-2">
        <p className="text-sm text-slate-900">{value}</p>
        {extra}
      </div>
    </div>
  </div>
);
