import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, RotateCcw, Check, X, Eye, Download, Settings, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface ReviewMaterial {
  id: string;
  name: string;
  type: "视频" | "图片" | "音频";
  fileSize: string;
  uploadTime: Date;
  uploader: string;
  folderPath: string;
  status: "pending" | "approved" | "rejected";
  previewUrl?: string;
}

// Mock data for review materials
const mockReviewMaterials: ReviewMaterial[] = [
  { id: "1", name: "zmy-uk-伦敦风景-3-5s231.mov", type: "视频", fileSize: "2.29 MB", uploadTime: new Date("2025-12-18 14:11:23"), uploader: "张梦云", folderPath: "伦敦风景", status: "pending" },
  { id: "2", name: "zmy-uk-伦敦风景-3-5s230.mov", type: "视频", fileSize: "438 KB", uploadTime: new Date("2025-12-18 14:11:22"), uploader: "张梦云", folderPath: "伦敦风景", status: "pending" },
  { id: "3", name: "zmy-uk-伦敦风景-3-5s229.mov", type: "视频", fileSize: "664 KB", uploadTime: new Date("2025-12-18 14:11:22"), uploader: "张梦云", folderPath: "伦敦风景", status: "pending" },
  { id: "4", name: "zmy-uk-伦敦风景-3-5s228.mov", type: "视频", fileSize: "929 KB", uploadTime: new Date("2025-12-18 14:11:21"), uploader: "张梦云", folderPath: "伦敦风景", status: "pending" },
  { id: "5", name: "zmy-uk-伦敦风景-3-5s227.mov", type: "视频", fileSize: "1.03 MB", uploadTime: new Date("2025-12-18 14:11:21"), uploader: "张梦云", folderPath: "伦敦风景", status: "pending" },
  { id: "6", name: "zmy-uk-伦敦风景-3-5s226.mov", type: "视频", fileSize: "930 KB", uploadTime: new Date("2025-12-18 14:11:20"), uploader: "张梦云", folderPath: "伦敦风景", status: "pending" },
  { id: "7", name: "zmy-uk-伦敦风景-3-5s225.mov", type: "视频", fileSize: "928 KB", uploadTime: new Date("2025-12-18 14:11:20"), uploader: "张梦云", folderPath: "伦敦风景", status: "pending" },
  { id: "8", name: "zmy-uk-伦敦风景-3-5s224.mov", type: "视频", fileSize: "1001 KB", uploadTime: new Date("2025-12-18 14:11:19"), uploader: "张梦云", folderPath: "伦敦风景", status: "pending" },
  { id: "9", name: "zmy-uk-伦敦风景-3-5s223.mov", type: "视频", fileSize: "959 KB", uploadTime: new Date("2025-12-18 14:11:19"), uploader: "张梦云", folderPath: "伦敦风景", status: "pending" },
  { id: "10", name: "zmy-uk-伦敦风景-3-5s222.mov", type: "视频", fileSize: "1002 KB", uploadTime: new Date("2025-12-18 14:11:18"), uploader: "张梦云", folderPath: "伦敦风景", status: "pending" },
  { id: "11", name: "zmy-uk-伦敦风景-3-5s221.mov", type: "视频", fileSize: "3.21 MB", uploadTime: new Date("2025-12-18 14:11:18"), uploader: "张梦云", folderPath: "伦敦风景", status: "pending" },
  { id: "12", name: "zmy-uk-伦敦风景-3-5s220.mov", type: "视频", fileSize: "2.12 MB", uploadTime: new Date("2025-12-18 14:11:17"), uploader: "张梦云", folderPath: "伦敦风景", status: "pending" },
];

const MaterialReview = () => {
  const [materials, setMaterials] = useState<ReviewMaterial[]>(mockReviewMaterials);
  const [searchName, setSearchName] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewMaterial, setPreviewMaterial] = useState<ReviewMaterial | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const { toast } = useToast();

  const filteredMaterials = materials.filter(m => {
    if (m.status !== "pending") return false;
    if (searchName && !m.name.toLowerCase().includes(searchName.toLowerCase())) return false;
    if (typeFilter !== "all" && m.type !== typeFilter) return false;
    if (startDate && m.uploadTime < new Date(startDate)) return false;
    if (endDate && m.uploadTime > new Date(endDate + " 23:59:59")) return false;
    return true;
  });

  const handleReset = () => {
    setSearchName("");
    setTypeFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const handleApprove = (id: string) => {
    setMaterials(prev => prev.map(m => 
      m.id === id ? { ...m, status: "approved" as const } : m
    ));
    toast({ title: "审核通过", description: "素材已通过审核" });
  };

  const openRejectModal = (id: string) => {
    setRejectingId(id);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!rejectingId) return;
    if (!rejectReason.trim()) {
      toast({ title: "请输入驳回原因", variant: "destructive" });
      return;
    }
    setMaterials(prev => prev.map(m => 
      m.id === rejectingId ? { ...m, status: "rejected" as const } : m
    ));
    toast({ title: "已拒绝", description: `素材已被拒绝，原因：${rejectReason}`, variant: "destructive" });
    setRejectModalOpen(false);
    setRejectingId(null);
    setRejectReason("");
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredMaterials.map(m => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleBatchApprove = () => {
    setMaterials(prev => prev.map(m => 
      selectedIds.includes(m.id) ? { ...m, status: "approved" as const } : m
    ));
    toast({ title: "批量审核通过", description: `已通过 ${selectedIds.length} 个素材` });
    setSelectedIds([]);
  };

  const handleBatchReject = () => {
    setMaterials(prev => prev.map(m => 
      selectedIds.includes(m.id) ? { ...m, status: "rejected" as const } : m
    ));
    toast({ title: "批量拒绝", description: `已拒绝 ${selectedIds.length} 个素材`, variant: "destructive" });
    setSelectedIds([]);
  };

  return (
    <div className="p-6 space-y-4">
      {/* Filter Bar */}
      <div className="flex items-center gap-4 flex-wrap bg-card p-4 rounded-lg border">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">素材名称：</span>
          <Input
            placeholder="请输入素材名称"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-48"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">素材类型：</span>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="全部" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="视频">视频</SelectItem>
              <SelectItem value="图片">图片</SelectItem>
              <SelectItem value="音频">音频</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">上传日期范围：</span>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-36"
          />
          <span className="text-muted-foreground">→</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-36"
          />
        </div>

        <Button variant="outline" onClick={handleReset}>
          <RotateCcw size={16} className="mr-2" />
          重置
        </Button>
        <Button className="bg-primary">
          <Search size={16} className="mr-2" />
          搜索
        </Button>
      </div>

      {/* Batch Actions & Tools */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            disabled={selectedIds.length === 0}
            onClick={handleBatchApprove}
          >
            批量通过 ({selectedIds.length})
          </Button>
          <Button 
            variant="outline" 
            disabled={selectedIds.length === 0}
            onClick={handleBatchReject}
          >
            批量拒绝 ({selectedIds.length})
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <RefreshCw size={18} />
          </Button>
          <Button variant="ghost" size="icon">
            <Download size={18} />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings size={18} />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedIds.length === filteredMaterials.length && filteredMaterials.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="min-w-[300px]">素材名称</TableHead>
              <TableHead className="w-24 text-center">素材类型</TableHead>
              <TableHead className="w-24 text-center">预览</TableHead>
              <TableHead className="w-40 text-center">上传时间</TableHead>
              <TableHead className="w-24 text-center">上传人</TableHead>
              <TableHead className="w-32 text-center">素材文件夹</TableHead>
              <TableHead className="w-40 text-center">审核</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMaterials.map((material) => (
              <TableRow key={material.id} className="hover:bg-muted/30">
                <TableCell>
                  <Checkbox 
                    checked={selectedIds.includes(material.id)}
                    onCheckedChange={(checked) => handleSelectItem(material.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell className="font-medium">{material.name}</TableCell>
                <TableCell className="text-center">
                  <span className="text-primary">{material.type}</span>
                </TableCell>
                <TableCell className="text-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPreviewMaterial(material)}
                  >
                    预 览
                  </Button>
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {format(material.uploadTime, "yyyy-MM-dd HH:mm:ss")}
                </TableCell>
                <TableCell className="text-center">{material.uploader}</TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {material.folderPath}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button 
                      size="sm" 
                      className="bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => handleApprove(material.id)}
                    >
                      <Check size={14} className="mr-1" />
                      通过
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => openRejectModal(material.id)}
                    >
                      <X size={14} className="mr-1" />
                      拒绝
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredMaterials.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  暂无待审核素材
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Preview Modal */}
      <Dialog open={!!previewMaterial} onOpenChange={() => setPreviewMaterial(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>素材预览</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <Eye size={48} className="text-muted-foreground" />
            </div>
            {previewMaterial && (
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">名称：</span>{previewMaterial.name}</p>
                <p><span className="text-muted-foreground">类型：</span>{previewMaterial.type}</p>
                <p><span className="text-muted-foreground">大小：</span>{previewMaterial.fileSize}</p>
                <p><span className="text-muted-foreground">上传人：</span>{previewMaterial.uploader}</p>
                <p><span className="text-muted-foreground">文件夹：</span>{previewMaterial.folderPath}</p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={() => {
                  if (previewMaterial) {
                    handleApprove(previewMaterial.id);
                    setPreviewMaterial(null);
                  }
                }}
              >
                <Check size={16} className="mr-2" />
                通过
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  if (previewMaterial) {
                    openRejectModal(previewMaterial.id);
                    setPreviewMaterial(null);
                  }
                }}
              >
                <X size={16} className="mr-2" />
                拒绝
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>请输入驳回原因</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="请输入驳回原因..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
                取消
              </Button>
              <Button variant="destructive" onClick={handleConfirmReject}>
                确认拒绝
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaterialReview;
