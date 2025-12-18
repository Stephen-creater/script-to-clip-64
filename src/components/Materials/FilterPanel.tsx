import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Smartphone,
  Monitor,
  Clock,
  Folder,
  Loader2,
  User,
  XCircle,
  CheckCircle,
  CalendarIcon,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface FilterState {
  aspectRatio: {
    vertical: boolean;    // 9:16
    horizontal: boolean;  // 16:9
  };
  durationRange: [number, number]; // [min, max] in seconds
  reviewStatus: {
    machineReview: boolean;
    pendingHuman: boolean;
    rejected: boolean;
    approved: boolean;
  };
  uploadDateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  uploader: string;
  uploadGroup: string;
  folder: string | null;
}

interface FolderItem {
  id: string;
  name: string;
  count: number;
  children?: FolderItem[];
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  folders: FolderItem[];
}

const FilterPanel = ({ filters, onFiltersChange, folders }: FilterPanelProps) => {
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const updateAspectRatio = (key: keyof FilterState['aspectRatio'], value: boolean) => {
    onFiltersChange({
      ...filters,
      aspectRatio: {
        ...filters.aspectRatio,
        [key]: value,
      },
    });
  };

  const updateDurationRange = (value: [number, number]) => {
    onFiltersChange({
      ...filters,
      durationRange: value,
    });
  };

  const updateReviewStatus = (key: keyof FilterState['reviewStatus'], value: boolean) => {
    onFiltersChange({
      ...filters,
      reviewStatus: {
        ...filters.reviewStatus,
        [key]: value,
      },
    });
  };

  const setFolder = (folderId: string | null) => {
    onFiltersChange({
      ...filters,
      folder: filters.folder === folderId ? null : folderId,
    });
  };

  const updateUploader = (value: string) => {
    onFiltersChange({
      ...filters,
      uploader: value,
    });
  };

  const updateUploadGroup = (value: string) => {
    onFiltersChange({
      ...filters,
      uploadGroup: value,
    });
  };

  const updateDateRange = (from: Date | undefined, to: Date | undefined) => {
    onFiltersChange({
      ...filters,
      uploadDateRange: { from, to },
    });
  };

  const formatDuration = (seconds: number) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${mins}分${secs}秒` : `${mins}分钟`;
    }
    return `${seconds}秒`;
  };

  const renderFolderTree = (items: FolderItem[], level: number = 0) => {
    return items.map((item) => (
      <div key={item.id}>
        <div
          className={cn(
            "flex items-center justify-between py-2 px-2 rounded cursor-pointer hover:bg-muted transition-colors",
            filters.folder === item.id && "bg-primary/10 text-primary",
            level > 0 && "ml-4"
          )}
          onClick={() => setFolder(item.id)}
        >
          <div className="flex items-center gap-2">
            <Folder size={14} className="text-muted-foreground" />
            <span className="text-sm">{item.name}</span>
          </div>
          <span className="text-xs text-muted-foreground">{item.count}</span>
        </div>
        {item.children && renderFolderTree(item.children, level + 1)}
      </div>
    ));
  };

  return (
    <div className="w-72 border-r border-border bg-card p-4 overflow-y-auto">
      <h3 className="font-semibold mb-4">筛选条件</h3>

      <Accordion type="multiple" defaultValue={["smart", "status", "search", "folders"]} className="space-y-2">
        {/* Smart Filters */}
        <AccordionItem value="smart" className="border-b-0">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            智能筛选
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <div className="space-y-4">
              {/* Aspect Ratio */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">画面比例</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="vertical"
                      checked={filters.aspectRatio.vertical}
                      onCheckedChange={(checked) =>
                        updateAspectRatio("vertical", !!checked)
                      }
                    />
                    <Label
                      htmlFor="vertical"
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Smartphone size={14} />
                      竖屏 (9:16)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="horizontal"
                      checked={filters.aspectRatio.horizontal}
                      onCheckedChange={(checked) =>
                        updateAspectRatio("horizontal", !!checked)
                      }
                    />
                    <Label
                      htmlFor="horizontal"
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Monitor size={14} />
                      横屏 (16:9)
                    </Label>
                  </div>
                </div>
              </div>

              {/* Duration Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <Clock size={12} />
                    素材时长
                  </p>
                  <span className="text-xs text-primary">
                    {formatDuration(filters.durationRange[0])} - {formatDuration(filters.durationRange[1])}
                  </span>
                </div>
                <Slider
                  value={filters.durationRange}
                  onValueChange={(value) => updateDurationRange(value as [number, number])}
                  min={0}
                  max={120}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0秒</span>
                  <span>2分钟</span>
                </div>
              </div>

              {/* Upload Date Range */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <CalendarIcon size={12} />
                  上传时间
                </p>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal text-sm h-9",
                        !filters.uploadDateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.uploadDateRange.from ? (
                        filters.uploadDateRange.to ? (
                          <>
                            {format(filters.uploadDateRange.from, "MM/dd")} - {format(filters.uploadDateRange.to, "MM/dd")}
                          </>
                        ) : (
                          format(filters.uploadDateRange.from, "yyyy/MM/dd")
                        )
                      ) : (
                        <span>选择日期范围</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{
                        from: filters.uploadDateRange.from,
                        to: filters.uploadDateRange.to,
                      }}
                      onSelect={(range) => {
                        updateDateRange(range?.from, range?.to);
                      }}
                      numberOfMonths={1}
                      className="pointer-events-auto"
                    />
                    <div className="p-3 border-t flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          updateDateRange(undefined, undefined);
                          setDatePickerOpen(false);
                        }}
                      >
                        清除
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setDatePickerOpen(false)}
                      >
                        确定
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Precise Search */}
        <AccordionItem value="search" className="border-b-0">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            <div className="flex items-center gap-2">
              <Search size={14} />
              精确搜索
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">上传组</Label>
                <Input
                  placeholder="输入上传组名称"
                  value={filters.uploadGroup}
                  onChange={(e) => updateUploadGroup(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">上传人</Label>
                <Input
                  placeholder="输入上传人姓名"
                  value={filters.uploader}
                  onChange={(e) => updateUploader(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Review Status */}
        <AccordionItem value="status" className="border-b-0">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            审核状态
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="machineReview"
                  checked={filters.reviewStatus.machineReview}
                  onCheckedChange={(checked) =>
                    updateReviewStatus("machineReview", !!checked)
                  }
                />
                <Label
                  htmlFor="machineReview"
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Loader2 size={14} className="text-warning" />
                  机审中
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="pendingHuman"
                  checked={filters.reviewStatus.pendingHuman}
                  onCheckedChange={(checked) =>
                    updateReviewStatus("pendingHuman", !!checked)
                  }
                />
                <Label
                  htmlFor="pendingHuman"
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <User size={14} className="text-info" />
                  待人审
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="rejected"
                  checked={filters.reviewStatus.rejected}
                  onCheckedChange={(checked) =>
                    updateReviewStatus("rejected", !!checked)
                  }
                />
                <Label
                  htmlFor="rejected"
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <XCircle size={14} className="text-destructive" />
                  已驳回
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="approved"
                  checked={filters.reviewStatus.approved}
                  onCheckedChange={(checked) =>
                    updateReviewStatus("approved", !!checked)
                  }
                />
                <Label
                  htmlFor="approved"
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <CheckCircle size={14} className="text-success" />
                  已入库
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Folder Sources */}
        <AccordionItem value="folders" className="border-b-0">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            素材来源包
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <div className="space-y-1">
              <div
                className={cn(
                  "flex items-center justify-between py-2 px-2 rounded cursor-pointer hover:bg-muted transition-colors",
                  filters.folder === null && "bg-primary/10 text-primary"
                )}
                onClick={() => setFolder(null)}
              >
                <div className="flex items-center gap-2">
                  <Folder size={14} className="text-muted-foreground" />
                  <span className="text-sm">全部素材</span>
                </div>
              </div>
              {renderFolderTree(folders)}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default FilterPanel;
