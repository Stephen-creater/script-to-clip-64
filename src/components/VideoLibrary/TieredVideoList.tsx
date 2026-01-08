import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Trophy, CheckCircle, AlertTriangle } from "lucide-react";
import AIVideoCard, { VideoWithAI } from "./AIVideoCard";
import { cn } from "@/lib/utils";

interface TieredVideoListProps {
  videos: VideoWithAI[];
  selectedVideos: string[];
  onVideoSelect: (videoId: string) => void;
  onSelectGrade: (grade: 'S' | 'A' | 'B' | 'C') => void;
  superMode: boolean;
}

const TieredVideoList = ({ 
  videos, 
  selectedVideos, 
  onVideoSelect, 
  onSelectGrade,
  superMode 
}: TieredVideoListProps) => {
  const sVideos = videos.filter(v => v.aiGrade === 'S');
  const aVideos = videos.filter(v => v.aiGrade === 'A');
  const bcVideos = videos.filter(v => v.aiGrade === 'B' || v.aiGrade === 'C');

  const sSelected = sVideos.filter(v => selectedVideos.includes(v.id)).length;
  const aSelected = aVideos.filter(v => selectedVideos.includes(v.id)).length;
  const bcSelected = bcVideos.filter(v => selectedVideos.includes(v.id)).length;

  const tiers = [
    {
      id: 'tier-s',
      grade: 'S' as const,
      icon: Trophy,
      title: '必发爆款',
      subtitle: 'S级',
      videos: sVideos,
      selectedCount: sSelected,
      iconColor: 'text-yellow-500',
      badgeClass: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black',
      defaultOpen: true
    },
    {
      id: 'tier-a',
      grade: 'A' as const,
      icon: CheckCircle,
      title: '优质备选',
      subtitle: 'A级',
      videos: aVideos,
      selectedCount: aSelected,
      iconColor: 'text-green-500',
      badgeClass: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white',
      defaultOpen: true
    },
    {
      id: 'tier-bc',
      grade: 'B' as const,
      icon: AlertTriangle,
      title: '需人工复核',
      subtitle: 'B/C级',
      videos: bcVideos,
      selectedCount: bcSelected,
      iconColor: 'text-orange-500',
      badgeClass: 'bg-muted text-muted-foreground',
      defaultOpen: false
    }
  ];

  return (
    <Accordion 
      type="multiple" 
      defaultValue={['tier-s', 'tier-a']}
      className="space-y-4"
    >
      {tiers.map((tier) => (
        <AccordionItem 
          key={tier.id} 
          value={tier.id}
          className="border rounded-lg bg-card overflow-hidden"
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-3 flex-1">
              {/* Checkbox to select all in tier */}
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={tier.selectedCount === tier.videos.length && tier.videos.length > 0}
                  onCheckedChange={() => onSelectGrade(tier.grade)}
                />
              </div>
              
              {/* Icon */}
              <tier.icon className={cn("w-5 h-5", tier.iconColor)} />
              
              {/* Title */}
              <span className="font-semibold">{tier.title}</span>
              
              {/* Badge */}
              <Badge className={tier.badgeClass}>
                {tier.subtitle}
              </Badge>
              
              {/* Count */}
              <span className="text-sm text-muted-foreground">
                {tier.videos.length} 个
                {tier.selectedCount > 0 && (
                  <span className="text-primary ml-1">
                    (已选 {tier.selectedCount})
                  </span>
                )}
              </span>
            </div>
          </AccordionTrigger>
          
          <AccordionContent className="px-4 pb-4">
            {tier.videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tier.videos.map((video) => (
                  <AIVideoCard
                    key={video.id}
                    video={video}
                    isSelected={selectedVideos.includes(video.id)}
                    onSelect={onVideoSelect}
                    superMode={superMode}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                此分类暂无视频
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default TieredVideoList;
