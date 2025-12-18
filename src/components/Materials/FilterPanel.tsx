import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  Timer,
  Folder,
  Loader2,
  User,
  XCircle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterState {
  aspectRatio: {
    vertical: boolean;    // 9:16
    horizontal: boolean;  // 16:9
  };
  duration: {
    short: boolean;       // <5s
    long: boolean;        // >15s
  };
  reviewStatus: {
    machineReview: boolean;
    pendingHuman: boolean;
    rejected: boolean;
    approved: boolean;
  };
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
  const updateAspectRatio = (key: keyof FilterState['aspectRatio'], value: boolean) => {
    onFiltersChange({
      ...filters,
      aspectRatio: {
        ...filters.aspectRatio,
        [key]: value,
      },
    });
  };

  const updateDuration = (key: keyof FilterState['duration'], value: boolean) => {
    onFiltersChange({
      ...filters,
      duration: {
        ...filters.duration,
        [key]: value,
      },
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
    <div className="w-64 border-r border-border bg-card p-4 overflow-y-auto">
      <h3 className="font-semibold mb-4">筛选条件</h3>

      <Accordion type="multiple" defaultValue={["smart", "status", "folders"]} className="space-y-2">
        {/* Smart Filters */}
        <AccordionItem value="smart" className="border-b-0">
          <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
            智能筛选
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <div className="space-y-3">
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

              {/* Duration */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">素材时长</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="short"
                      checked={filters.duration.short}
                      onCheckedChange={(checked) =>
                        updateDuration("short", !!checked)
                      }
                    />
                    <Label
                      htmlFor="short"
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Clock size={14} />
                      短素材 (&lt;5s)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="long"
                      checked={filters.duration.long}
                      onCheckedChange={(checked) =>
                        updateDuration("long", !!checked)
                      }
                    />
                    <Label
                      htmlFor="long"
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Timer size={14} />
                      长素材 (&gt;15s)
                    </Label>
                  </div>
                </div>
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
