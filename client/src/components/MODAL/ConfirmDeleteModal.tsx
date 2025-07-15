import { Button } from "@/components/ui/button";

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;  // async function
  title: string;
}

const ConfirmDeleteModal = ({ open, onClose, onConfirm, title }: ConfirmDeleteModalProps) => {
  return (
    <div
      className={`fixed inset-0 bg-black-10 bg-opacity-50 flex justify-center items-center ${
        open ? "block" : "hidden"
      }`}
    >
      <div className="bg-green-50 border-1 p-6 rounded shadow-md max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              await onConfirm();  // async call with await
            }}
          >
            Yes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
