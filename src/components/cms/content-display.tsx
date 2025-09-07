"use client";

import { useContest } from '@/context/ContestContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface ContentDisplayProps {
  placement: 'public' | 'participant' | 'both';
  showOnHomepage?: boolean;
  showOnRegistration?: boolean;
  className?: string;
}

export function ContentDisplay({ 
  placement, 
  showOnHomepage = false, 
  showOnRegistration = false,
  className = "" 
}: ContentDisplayProps) {
  const { getCmsContentByPlacement } = useContest();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const content = getCmsContentByPlacement(placement);

  // Filter content based on additional criteria
  const filteredContent = content.filter(item => {
    if (showOnHomepage && !item.showOnHomepage) return false;
    if (showOnRegistration && !item.showOnRegistration) return false;
    return true;
  });

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'guidelines': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'news': return 'bg-green-100 text-green-800 border-green-200';
      case 'announcement': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'faq': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'terms': return 'bg-red-100 text-red-800 border-red-200';
      case 'privacy': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'guidelines': return '📋';
      case 'news': return '📰';
      case 'announcement': return '📢';
      case 'faq': return '❓';
      case 'terms': return '📄';
      case 'privacy': return '🔒';
      default: return '📄';
    }
  };

  if (filteredContent.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {filteredContent.map((item) => (
        <Card key={item.id} className="border-l-4 border-l-primary/20">
          <Collapsible>
            <CollapsibleTrigger
              onClick={() => toggleExpanded(item.id!)}
              className="w-full"
            >
              <CardHeader className="hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTypeIcon(item.type)}</span>
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge className={getTypeColor(item.type)}>
                          {item.type}
                        </Badge>
                        {item.showOnHomepage && (
                          <Badge variant="secondary">Homepage</Badge>
                        )}
                        {item.showOnRegistration && (
                          <Badge variant="secondary">Registration</Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Priority: {item.priority}
                    </span>
                    {expandedItems.has(item.id!) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="prose max-w-none">
                  <div 
                    className="text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: item.content.replace(/\n/g, '<br />') 
                    }}
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}
    </div>
  );
}

// Specialized components for different placements
export function PublicContentDisplay({ className }: { className?: string }) {
  return (
    <ContentDisplay 
      placement="public" 
      showOnHomepage={true}
      className={className} 
    />
  );
}

export function ParticipantContentDisplay({ className }: { className?: string }) {
  return (
    <ContentDisplay 
      placement="participant" 
      className={className} 
    />
  );
}

export function HomepageContentDisplay({ className }: { className?: string }) {
  return (
    <ContentDisplay 
      placement="both" 
      showOnHomepage={true}
      className={className} 
    />
  );
}

export function RegistrationContentDisplay({ className }: { className?: string }) {
  return (
    <ContentDisplay 
      placement="both" 
      showOnRegistration={true}
      className={className} 
    />
  );
}
