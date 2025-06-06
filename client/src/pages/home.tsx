import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import ContentCard from "@/components/content-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid, List, Plus } from "lucide-react";
import { useState } from "react";
import UploadModal from "@/components/upload-modal";

export default function Home() {
  const [filters, setFilters] = useState({
    type: [] as string[],
    rating: [] as string[],
    tags: [] as string[],
    search: "",
    limit: 20,
    offset: 0,
  });
  
  const [sortBy, setSortBy] = useState("latest");
  const [viewMode, setViewMode] = useState("grid");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const { data: fanworks = [], isLoading } = useQuery({
    queryKey: ["/api/fanworks", filters, sortBy],
    retry: false,
  });

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, offset: 0 }));
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header onSearch={(search) => handleFilterChange({ search })} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <Sidebar 
            filters={filters}
            onFilterChange={handleFilterChange}
            onUpload={() => setUploadModalOpen(true)}
          />
          
          <main className="flex-1">
            {/* Sort and View Options */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-foreground">Latest Fanworks</h1>
                <span className="text-muted-foreground">{fanworks.length} results</span>
              </div>
              <div className="flex items-center space-x-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 bg-dark-elevated border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="favorited">Most Favorited</SelectItem>
                    <SelectItem value="commented">Most Commented</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex bg-dark-elevated rounded border border-border">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-neon-green text-dark-bg" : ""}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-neon-green text-dark-bg" : ""}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-dark-surface rounded-lg h-80 animate-pulse" />
                ))}
              </div>
            ) : fanworks.length > 0 ? (
              <div className={
                viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }>
                {fanworks.map((fanwork: any) => (
                  <ContentCard 
                    key={fanwork.id} 
                    fanwork={fanwork} 
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-muted-foreground text-lg mb-4">
                  No fanworks found matching your criteria
                </div>
                <Button 
                  onClick={() => setUploadModalOpen(true)}
                  className="bg-neon-green text-dark-bg hover:bg-neon-green/90"
                >
                  Upload First Fanwork
                </Button>
              </div>
            )}

            {/* Load More */}
            {fanworks.length >= filters.limit && (
              <div className="text-center mt-12">
                <Button
                  variant="outline"
                  onClick={() => handleFilterChange({ offset: filters.offset + filters.limit })}
                  className="border-neon-green text-neon-green hover:bg-neon-green hover:text-dark-bg glow-neon"
                >
                  Load More Content
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={() => setUploadModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-neon-green text-dark-bg hover:bg-neon-green/90 shadow-lg hover:scale-110 transition-transform"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <UploadModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />
    </div>
  );
}
