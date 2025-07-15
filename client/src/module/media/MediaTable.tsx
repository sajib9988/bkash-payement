"use client";

import { useEffect, useState } from "react";
import { deleteMedia, getAllMedia, updateMedia } from "@/service/media";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Media } from "@/type/type";
import { toast } from "sonner";
import ConfirmDeleteModal from "@/components/MODAL/ConfirmDeleteModal";
import { UpdateModalForm } from "./update-part/UpdateModalForm";

type MediaForUpdate = {
  id: string;
  title: string;
  description: string;
  genre: string;
  type: "MOVIE" | "SERIES";
  videoUrls: string[];
  amount: number;
  thumbnail?: File | string;
  releaseDate?: string;
};

const MediaTable = () => {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMediaForEdit, setSelectedMediaForEdit] = useState<MediaForUpdate | null>(null);

  const fetchMedia = async () => {
    try {
      const result = await getAllMedia();
      console.log("📥 All Media fetched:", result);
      const validMediaList = result?.data?.data?.map((media: any) => ({
        ...media,
        type: ["MOVIE", "SERIES"].includes(media.type) ? media.type : "MOVIE",
      })) || [];
      setMediaList(validMediaList);
    } catch (error) {
      console.error("❌ Error fetching media:", error);
      toast.error("Failed to fetch media");
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleEdit = (id: string) => {
    const media = mediaList.find(m => m.id === id);
    console.log("🛠 Media to edit:", media);
    if (media) {
      setSelectedMediaForEdit({
        ...media,
        type: media.type === "MOVIE" || media.type === "SERIES" ? media.type : "MOVIE",
        thumbnail: typeof media.thumbnail === "string" ? media.thumbnail : "",
      });
      setEditModalOpen(true);
    }
  };

  const handleUpdate = async (updatedMedia: MediaForUpdate) => {
    try {
      console.log("📤 Submitting updated media:", updatedMedia);

      const formData = new FormData();
      const body = {
        title: updatedMedia.title,
        description: updatedMedia.description,
        genre: updatedMedia.genre,
        type: updatedMedia.type,
        amount: updatedMedia.amount,
        videoUrls: updatedMedia.videoUrls,
        releaseDate: updatedMedia.releaseDate,
      };

      console.log("🧾 Form body:", body);

      formData.append("data", JSON.stringify(body));

      if (updatedMedia.thumbnail instanceof File) {
        formData.append("thumbnail", updatedMedia.thumbnail);
        console.log("🖼 Thumbnail is file, appended to formData");
      } else {
        console.log("🖼 Thumbnail is string or undefined:", updatedMedia.thumbnail);
      }

      const res =await updateMedia(updatedMedia.id, formData);
console.log("✅ Media updated successfully",res );
      setMediaList(prev =>
        prev.map(m =>
          m.id === updatedMedia.id
            ? {
                ...m,
                ...body,
                thumbnail: updatedMedia.thumbnail instanceof File
                  ? URL.createObjectURL(updatedMedia.thumbnail)
                  : typeof updatedMedia.thumbnail === "string"
                    ? updatedMedia.thumbnail
                    : m.thumbnail,
                releaseDate: updatedMedia.releaseDate ?? m.releaseDate ?? "",
              } as Media
            : m
        )
      );

      setEditModalOpen(false);
      toast.success("Media updated successfully");
      fetchMedia();
    } catch (error: any) {
      console.error("❌ Error updating media:", error);
      toast.error(error?.response?.data?.message || "Failed to update media");
    }
  };

  const handleDeleteClick = (id: string) => {
    console.log("🗑 Delete clicked for ID:", id);
    setSelectedMediaId(id);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMediaId) return;
    try {
      console.log("🚮 Confirming delete for ID:", selectedMediaId);
      await deleteMedia(selectedMediaId);
      setMediaList(prev => prev.filter(media => media.id !== selectedMediaId));
      setModalOpen(false);
      setSelectedMediaId(null);
      toast.success("Media deleted successfully");
    } catch (error: any) {
      console.error("❌ Error deleting media:", error);
      if (error.message?.includes("Foreign key constraint") || error.message?.includes("P2003")) {
        toast.error("Cannot delete media", {
          description: "This media is associated with existing payments.",
        });
      } else {
        toast.error("Failed to delete media", {
          description: error?.message || "Something went wrong.",
        });
      }
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <div className="rounded-lg border border-gray-700 shadow-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-800">
            <TableRow>
              <TableHead className="w-[100px] text-gray-200 text-sm">Thumbnail</TableHead>
              <TableHead className="text-gray-200 text-sm">Title</TableHead>
              <TableHead className="text-gray-200 text-sm">Type</TableHead>
              <TableHead className="text-gray-200 text-sm">Genre</TableHead>
              <TableHead className="text-gray-200 text-sm">Release Date</TableHead>
              <TableHead className="text-gray-200 text-sm">Amount</TableHead>
              <TableHead className="text-gray-200 text-right text-sm">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mediaList.length > 0 ? (
              mediaList.map(media => (
                <TableRow key={media.id} className="hover:bg-gray-700 transition-colors">
                  <TableCell>
                    <img
                      src={media.thumbnail || "/placeholder.jpg"}
                      alt={media.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-gray-100 text-sm">{media.title}</TableCell>
                  <TableCell className="text-gray-300 text-sm">{media.type}</TableCell>
                  <TableCell className="text-gray-300 text-sm">{media.genre}</TableCell>
                  <TableCell className="text-gray-300 text-sm">{media.releaseDate || "-"}</TableCell>
                  <TableCell className="text-gray-300 text-sm">${media.amount}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-gray-600 text-white border-gray-500 hover:bg-gray-500 transition-all text-xs p-2"
                      onClick={() => handleEdit(media.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 transition-all text-xs p-2"
                      onClick={() => handleDeleteClick(media.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-400 text-sm">
                  No media found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Modal */}
      {selectedMediaForEdit && (
        <UpdateModalForm
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          media={selectedMediaForEdit}
          onSave={handleUpdate}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete "${mediaList.find(m => m.id === selectedMediaId)?.title || "this media"}"?`}
      />
    </div>
  );
};

export default MediaTable;