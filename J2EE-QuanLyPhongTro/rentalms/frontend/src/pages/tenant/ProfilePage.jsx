import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ErrorState, LoadingState } from "../../components/ui/StateBlocks";
import { api, extractErrorMessage, unwrapData } from "../../lib/api";
import { uploadImageToCloudinary } from "../../lib/cloudinary";
import { getInitials } from "../../lib/format";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    cccdNumber: "",
    bankAccount: "",
    zaloLink: ""
  });
  const [message, setMessage] = useState("");

  const query = useQuery({
    queryKey: ["profile-me"],
    queryFn: async () => unwrapData(await api.get("/api/v1/profile/me"))
  });

  useEffect(() => {
    if (query.data) {
      setForm({
        fullName: query.data.fullName || "",
        phone: query.data.phone || "",
        cccdNumber: query.data.cccdNumber || "",
        bankAccount: query.data.bankAccount || "",
        zaloLink: query.data.zaloLink || ""
      });
    }
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: async (payload) => unwrapData(await api.put("/api/v1/profile/me", payload)),
    onSuccess: () => {
      setMessage("Cập nhật hồ sơ thành công.");
      toast.success("Đã lưu hồ sơ");
      queryClient.invalidateQueries({ queryKey: ["profile-me"] });
    }
  });

  const cccdMutation = useMutation({
    mutationFn: async ({ side, file }) => {
      const url = await uploadImageToCloudinary(file);
      return unwrapData(
        await api.put("/api/v1/profile/me", {
          fullName: form.fullName,
          phone: form.phone || null,
          cccdNumber: form.cccdNumber || null,
          bankAccount: form.bankAccount || null,
          zaloLink: form.zaloLink || null,
          cccdFrontUrl: side === "front" ? url : query.data.cccdFrontUrl || null,
          cccdBackUrl: side === "back" ? url : query.data.cccdBackUrl || null
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-me"] });
      toast.success("Da cap nhat anh CCCD");
    }
  });

  const submit = (event) => {
    event.preventDefault();
    setMessage("");
    mutation.mutate({
      ...form,
      cccdFrontUrl: query.data.cccdFrontUrl || null,
      cccdBackUrl: query.data.cccdBackUrl || null
    });
  };

  if (query.isLoading) {
    return <LoadingState label="Dang tai profile..." />;
  }

  if (query.isError) {
    return <ErrorState message={extractErrorMessage(query.error)} />;
  }

  return (
    <section className="animate-fade-in grid gap-6 xl:grid-cols-[0.65fr_1.35fr]">
      <div className="rounded-card-lg border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <span className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-2xl font-extrabold text-white ring-4 ring-secondary/20">
            {getInitials(query.data.fullName)}
          </span>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-secondary">Tóm tắt</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-navy">{query.data.fullName}</h1>
        </div>
        <div className="mt-5 space-y-3 text-sm text-muted">
          <p>
            <strong>Email:</strong> {query.data.email}
          </p>
          <p>
            <strong>Role:</strong> {query.data.role}
          </p>
          <p>
            <strong>Trạng thái:</strong> {query.data.active ? "Đang hoạt động" : "Bị khóa"}
          </p>
        </div>
      </div>

      <div className="rounded-card-lg border border-border bg-surface p-6 shadow-card md:pb-28">
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-secondary">Biểu mẫu</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-navy">Cập nhật thông tin</h2>

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <input
            type="text"
            className="tenant-input md:col-span-2"
            placeholder="Ho va ten"
            value={form.fullName}
            onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            required
          />
          <input
            type="text"
            className="tenant-input"
            placeholder="So dien thoai"
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          />
          <input
            type="text"
            className="tenant-input"
            placeholder="CCCD"
            value={form.cccdNumber}
            onChange={(event) => setForm((current) => ({ ...current, cccdNumber: event.target.value }))}
          />
          <input
            type="text"
            className="tenant-input"
            placeholder="Tai khoan ngan hang"
            value={form.bankAccount}
            onChange={(event) => setForm((current) => ({ ...current, bankAccount: event.target.value }))}
          />
          <input
            type="text"
            className="tenant-input"
            placeholder="So Zalo / link Zalo"
            value={form.zaloLink}
            onChange={(event) => setForm((current) => ({ ...current, zaloLink: event.target.value }))}
          />
          {message ? <p className="md:col-span-2 text-sm font-semibold text-emerald-700">{message}</p> : null}
          {mutation.isError ? <p className="md:col-span-2 text-sm font-semibold text-red-700">{extractErrorMessage(mutation.error)}</p> : null}
          <div className="md:col-span-2 md:sticky md:bottom-6 md:z-10">
            <button type="submit" disabled={mutation.isPending} className="tenant-submit w-full md:w-auto">
              {mutation.isPending ? "Đang lưu..." : "Lưu hồ sơ"}
            </button>
          </div>
        </form>

        <div className="mt-10 border-t border-border pt-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-secondary">Giấy tờ tùy thân</p>
          <h3 className="mt-2 font-display text-2xl font-bold text-navy">Ảnh CCCD</h3>
          <p className="mt-2 text-sm text-muted">
            Upload len Cloudinary (unsigned preset). Can mat truoc de dang ky thue phong.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-card border border-border p-4">
              <p className="text-sm font-extrabold text-navy">Mat truoc</p>
              {query.data.cccdFrontUrl ? (
                <img
                  src={query.data.cccdFrontUrl}
                  alt="CCCD truoc"
                  className="mt-3 max-h-48 w-full rounded-lg object-contain ring-1 ring-border"
                />
              ) : (
                <p className="mt-3 text-xs text-muted">Chua co anh</p>
              )}
              <input
                type="file"
                accept="image/*"
                className="mt-3 block w-full text-sm"
                disabled={cccdMutation.isPending}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) cccdMutation.mutate({ side: "front", file });
                  event.target.value = "";
                }}
              />
            </div>
            <div className="rounded-card border border-border p-4">
              <p className="text-sm font-extrabold text-navy">Mat sau</p>
              {query.data.cccdBackUrl ? (
                <img
                  src={query.data.cccdBackUrl}
                  alt="CCCD sau"
                  className="mt-3 max-h-48 w-full rounded-lg object-contain ring-1 ring-border"
                />
              ) : (
                <p className="mt-3 text-xs text-muted">Chua co anh</p>
              )}
              <input
                type="file"
                accept="image/*"
                className="mt-3 block w-full text-sm"
                disabled={cccdMutation.isPending}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) cccdMutation.mutate({ side: "back", file });
                  event.target.value = "";
                }}
              />
            </div>
          </div>
          {cccdMutation.isError ? (
            <p className="mt-4 text-sm font-semibold text-red-700">{extractErrorMessage(cccdMutation.error)}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
