import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FolderPlus, 
  Folder,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Edit2,
  Trash2,
  FolderOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface FolderItem {
  id: string;
  name: string;
  count: number;
  hasChildren?: boolean;
  children?: FolderItem[];
  parentId?: string;
}

interface FolderSidebarProps {
  folders: FolderItem[];
  selectedFolder: string;
  expandedFolders: string[];
  onFolderSelect: (folderId: string) => void;
  onFolderToggle: (folderId: string) => void;
  onFolderCreate: (name: string, parentId?: string) => void;
  onFolderRename: (folderId: string, newName: string) => void;
  onFolderDelete: (folderId: string) => void;
  title?: string;
}

const FolderSidebar = ({
  folders,
  selectedFolder,
  expandedFolders,
  onFolderSelect,
  onFolderToggle,
  onFolderCreate,
  onFolderRename,
  onFolderDelete,
  title = "文件夹"
}: FolderSidebarProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renamingFolder, setRenamingFolder] = useState<FolderItem | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<FolderItem | null>(null);
  const [parentFolderId, setParentFolderId] = useState<string | undefined>();

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onFolderCreate(newFolderName.trim(), parentFolderId);
      setNewFolderName("");
      setParentFolderId(undefined);
      setShowCreateDialog(false);
    }
  };

  const handleRenameFolder = () => {
    if (renamingFolder && newFolderName.trim()) {
      onFolderRename(renamingFolder.id, newFolderName.trim());
      setNewFolderName("");
      setRenamingFolder(null);
      setShowRenameDialog(false);
    }
  };

  const handleDeleteFolder = () => {
    if (deletingFolder) {
      onFolderDelete(deletingFolder.id);
      setDeletingFolder(null);
      setShowDeleteDialog(false);
    }
  };

  const openCreateDialog = (parentId?: string) => {
    setParentFolderId(parentId);
    setNewFolderName("");
    setShowCreateDialog(true);
  };

  const openRenameDialog = (folder: FolderItem) => {
    setRenamingFolder(folder);
    setNewFolderName(folder.name);
    setShowRenameDialog(true);
  };

  const openDeleteDialog = (folder: FolderItem) => {
    setDeletingFolder(folder);
    setShowDeleteDialog(true);
  };

  const renderFolder = (folder: FolderItem, level: number = 0) => {
    const isExpanded = expandedFolders.includes(folder.id);
    const isSelected = selectedFolder === folder.id;
    const hasChildren = folder.hasChildren || (folder.children && folder.children.length > 0);

    return (
      <div key={folder.id}>
        <div
          className={cn(
            "group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors",
            isSelected
              ? "bg-primary text-primary-foreground"
              : "hover:bg-secondary",
            level > 0 && "ml-4"
          )}
          style={{ marginLeft: level * 16 }}
        >
          <div 
            className="flex items-center gap-2 flex-1"
            onClick={() => {
              if (hasChildren) {
                onFolderToggle(folder.id);
              }
              onFolderSelect(folder.id);
            }}
          >
            {hasChildren && (
              isExpanded ? 
                <ChevronDown size={14} /> : 
                <ChevronRight size={14} />
            )}
            {isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />}
            <span className="text-sm">{folder.name}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">{folder.count}</span>
            {folder.id !== 'all' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical size={12} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openCreateDialog(folder.id)}>
                    <FolderPlus size={14} className="mr-2" />
                    新建子文件夹
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openRenameDialog(folder)}>
                    <Edit2 size={14} className="mr-2" />
                    重命名
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => openDeleteDialog(folder)}
                    className="text-destructive"
                  >
                    <Trash2 size={14} className="mr-2" />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        {/* Render children */}
        {hasChildren && isExpanded && folder.children && (
          <div className="space-y-1 mt-1">
            {folder.children.map((child) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="w-64 bg-card border-r border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={() => openCreateDialog()}>
            <FolderPlus size={16} />
          </Button>
        </div>

        <div className="space-y-1">
          {folders.map((folder) => renderFolder(folder))}
        </div>
      </div>

      {/* Create Folder Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建文件夹</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="输入文件夹名称..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              取消
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Folder Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重命名文件夹</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="输入新名称..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleRenameFolder()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
              取消
            </Button>
            <Button onClick={handleRenameFolder} disabled={!newFolderName.trim()}>
              重命名
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除文件夹 "{deletingFolder?.name}" 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFolder} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FolderSidebar;