import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  FolderPlus, 
  Folder,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Edit2,
  Trash2,
  FolderOpen,
  FileVideo,
  FileImage,
  FileAudio
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
  type?: 'video' | 'image' | 'audio';
}

interface FolderSidebarProps {
  folders: FolderItem[];
  selectedFolder: string;
  expandedFolders: string[];
  onFolderSelect: (folderId: string) => void;
  onFolderToggle: (folderId: string) => void;
  onFolderCreate: (name: string, type: 'video' | 'image' | 'audio', parentId?: string) => void;
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
  const [newFolderType, setNewFolderType] = useState<'video' | 'image' | 'audio'>('video');
  const [renamingFolder, setRenamingFolder] = useState<FolderItem | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<FolderItem | null>(null);
  const [parentFolderId, setParentFolderId] = useState<string | undefined>();
  const [parentFolder, setParentFolder] = useState<FolderItem | null>(null);

  const findFolder = (folders: FolderItem[], id: string): FolderItem | null => {
    for (const folder of folders) {
      if (folder.id === id) return folder;
      if (folder.children) {
        const found = findFolder(folder.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      // Use parent folder type if creating a subfolder, otherwise use selected type
      const folderType = parentFolder?.type || newFolderType;
      onFolderCreate(newFolderName.trim(), folderType, parentFolderId);
      setNewFolderName("");
      setNewFolderType('video');
      setParentFolderId(undefined);
      setParentFolder(null);
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
    
    // Find parent folder if creating subfolder
    if (parentId) {
      const parent = findFolder(folders, parentId);
      setParentFolder(parent);
      // Inherit parent's type if it exists
      if (parent?.type) {
        setNewFolderType(parent.type);
      }
    } else {
      setParentFolder(null);
      setNewFolderType('video');
    }
    
    setShowCreateDialog(true);
  };

  const getFolderIcon = (folder: FolderItem, isExpanded: boolean) => {
    if (!folder.type) {
      return isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />;
    }
    
    switch (folder.type) {
      case 'video':
        return <FileVideo size={16} className="text-blue-500" />;
      case 'image':
        return <FileImage size={16} className="text-green-500" />;
      case 'audio':
        return <FileAudio size={16} className="text-purple-500" />;
      default:
        return isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />;
    }
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
              : "hover:bg-secondary"
          )}
          style={{ marginLeft: level * 20 }}
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
            <div className="w-[14px] flex justify-center">
            {hasChildren && (
                isExpanded ? 
                  <ChevronDown size={14} /> : 
                  <ChevronRight size={14} />
              )}
            </div>
            {getFolderIcon(folder, isExpanded)}
            <span className="text-sm">{folder.name}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">{folder.count}</span>
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
            <DialogTitle>{parentFolder ? `在 "${parentFolder.name}" 下新建子文件夹` : '新建文件夹'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">文件夹名称</label>
              <Input
                placeholder="输入文件夹名称..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
            </div>
            {/* Only show type selector when creating top-level folder */}
            {!parentFolder && (
              <div>
                <label className="text-sm font-medium mb-2 block">文件夹类型</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={newFolderType === 'video' ? 'default' : 'outline'}
                    className="flex flex-col items-center gap-2 h-auto py-3"
                    onClick={() => setNewFolderType('video')}
                  >
                    <FileVideo size={20} />
                    <span className="text-xs">视频</span>
                  </Button>
                  <Button
                    type="button"
                    variant={newFolderType === 'image' ? 'default' : 'outline'}
                    className="flex flex-col items-center gap-2 h-auto py-3"
                    onClick={() => setNewFolderType('image')}
                  >
                    <FileImage size={20} />
                    <span className="text-xs">图片</span>
                  </Button>
                  <Button
                    type="button"
                    variant={newFolderType === 'audio' ? 'default' : 'outline'}
                    className="flex flex-col items-center gap-2 h-auto py-3"
                    onClick={() => setNewFolderType('audio')}
                  >
                    <FileAudio size={20} />
                    <span className="text-xs">音频</span>
                  </Button>
                </div>
              </div>
            )}
            {/* Show inherited type for subfolders */}
            {parentFolder && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {parentFolder.type === 'video' && <FileVideo size={16} className="text-blue-500" />}
                {parentFolder.type === 'image' && <FileImage size={16} className="text-green-500" />}
                {parentFolder.type === 'audio' && <FileAudio size={16} className="text-purple-500" />}
                <span>
                  类型：{parentFolder.type === 'video' ? '视频' : parentFolder.type === 'image' ? '图片' : '音频'}
                  （继承自父文件夹）
                </span>
              </div>
            )}
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