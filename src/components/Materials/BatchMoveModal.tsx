import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderItem {
  id: string;
  name: string;
  count: number;
  children?: FolderItem[];
}

interface BatchMoveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  folders: FolderItem[];
  onConfirm: (folderId: string) => void;
}

const BatchMoveModal = ({
  open,
  onOpenChange,
  selectedCount,
  folders,
  onConfirm,
}: BatchMoveModalProps) => {
  const [selectedFolder, setSelectedFolder] = useState<string>("");

  const handleConfirm = () => {
    if (selectedFolder) {
      onConfirm(selectedFolder);
      onOpenChange(false);
      setSelectedFolder("");
    }
  };

  const flattenFolders = (items: FolderItem[], level: number = 0): { item: FolderItem; level: number }[] => {
    let result: { item: FolderItem; level: number }[] = [];
    for (const item of items) {
      result.push({ item, level });
      if (item.children) {
        result = result.concat(flattenFolders(item.children, level + 1));
      }
    }
    return result;
  };

  const flatFolders = flattenFolders(folders);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>批量移动到文件夹</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            已选择 <span className="font-medium text-foreground">{selectedCount}</span> 个素材，请选择目标文件夹：
          </p>

          <RadioGroup
            value={selectedFolder}
            onValueChange={setSelectedFolder}
            className="space-y-2"
          >
            {flatFolders.map(({ item, level }) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors",
                  selectedFolder === item.id && "bg-primary/10 border-primary/30"
                )}
                style={{ marginLeft: level * 16 }}
                onClick={() => setSelectedFolder(item.id)}
              >
                <RadioGroupItem value={item.id} id={item.id} />
                <Label
                  htmlFor={item.id}
                  className="flex items-center gap-2 flex-1 cursor-pointer"
                >
                  {selectedFolder === item.id ? (
                    <FolderOpen size={16} className="text-primary" />
                  ) : (
                    <Folder size={16} className="text-muted-foreground" />
                  )}
                  <span>{item.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {item.count} 个文件
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedFolder}>
            确认移动
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BatchMoveModal;
