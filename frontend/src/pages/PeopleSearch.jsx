import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Search,
  Filter,
  Sparkles,
  Heart,
  Star,
  MapPin,
  MessageSquare,
  ChevronRight,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PeopleSearch() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [intentFilter, setIntentFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // V2 Filters
  const [minScoreFilter, setMinScoreFilter] = useState("0");
  const [workingStyleFilter, setWorkingStyleFilter] = useState("all");

  const filteredResults = results.filter(p => {
    const score = parseFloat(minScoreFilter);
    if (score > 0 && (p.peer_score || 0) < score) return false;
    if (workingStyleFilter !== "all" && p.matching_preferences?.working_style !== workingStyleFilter) return false;
    return true;
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await axios.post(
        `${API}/search/people`,
        {
          query: searchQuery,
          intent_filter: intentFilter || null,
          availability_filter: availabilityFilter || null,
        },
        { withCredentials: true }
      );
      setResults(response.data);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 md:px-6" data-testid="people-search">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Find People</h1>
          <p className="text-slate-400">
            Use natural language to search for talent that matches your needs
          </p>
        </div>

        {/* Search Section */}
        <div className="glass rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder='Try: "AI engineer who loves climate tech and is open to gigs"'
                className="pl-12 h-14 bg-black/30 border-white/10 text-white placeholder:text-slate-500 rounded-xl text-lg"
                data-testid="search-input"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="h-14 px-8 bg-white text-black hover:bg-white/90 rounded-xl font-semibold"
              data-testid="search-btn"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={18} className="mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-500" />
              <span className="text-sm text-slate-400">Filters:</span>
            </div>
            <Select value={intentFilter} onValueChange={setIntentFilter}>
              <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Intent" />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(240_5%_10%)] border-white/10">
                <SelectItem value="all">All Intents</SelectItem>
                <SelectItem value="Freelance/Gigs">Freelance/Gigs</SelectItem>
                <SelectItem value="Job">Job Seekers</SelectItem>
                <SelectItem value="Cofounder">Cofounder</SelectItem>
              </SelectContent>
            </Select>
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-[200px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(240_5%_10%)] border-white/10">
                <SelectItem value="all">Any Availability</SelectItem>
                <SelectItem value="Available now">Available Now</SelectItem>
                <SelectItem value="On a gig — limited capacity">Limited Capacity</SelectItem>
              </SelectContent>
            </Select>
            <Select value={workingStyleFilter} onValueChange={setWorkingStyleFilter}>
              <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Working Style" />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(240_5%_10%)] border-white/10">
                <SelectItem value="all">Any Style</SelectItem>
                <SelectItem value="Flexible">Flexible / Hybrid</SelectItem>
                <SelectItem value="Remote Only">Remote Only</SelectItem>
                <SelectItem value="In Person Only">In Person Only</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 bg-white/5 px-4 rounded-md border border-white/10">
              <span className="text-sm text-slate-400 whitespace-nowrap">Min Score: {minScoreFilter}</span>
              <input
                type="range" min="0" max="10" step="0.5"
                value={minScoreFilter}
                onChange={(e) => setMinScoreFilter(e.target.value)}
                className="w-24 accent-[hsl(250_100%_70%)]"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-white/10" />
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-32 mb-2" />
                    <div className="h-3 bg-white/5 rounded w-24" />
                  </div>
                </div>
                <div className="h-3 bg-white/5 rounded w-full mb-2" />
                <div className="h-3 bg-white/5 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Search size={48} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No matches found</h3>
            <p className="text-slate-400">
              Try adjusting your search query or filters
            </p>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResults.map((person) => (
              <Link
                key={person.user_id}
                to={`/profile/${person.user_id}`}
                className="glass rounded-2xl p-6 card-hover group"
                data-testid={`person-card-${person.user_id}`}
              >
                {/* Match Score */}
                {person.match_score > 0 && (
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-gradient-to-r from-[hsl(250_100%_70%)] to-[hsl(180_100%_50%)] text-white border-0">
                      <Sparkles size={12} className="mr-1" />
                      {Math.round(person.match_score * 100)}% Match
                    </Badge>
                  </div>
                )}

                {/* Profile */}
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="w-14 h-14 border-2 border-white/20">
                    <AvatarImage src={person.picture} />
                    <AvatarFallback className="bg-gradient-to-br from-[hsl(250_100%_70%)] to-[hsl(180_100%_50%)]">
                      {person.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate group-hover:text-[hsl(250_100%_70%)] transition-colors">
                      {person.name}
                    </h3>
                    {person.role_labels?.length > 0 && (
                      <p className="text-sm text-slate-400 truncate">
                        {person.role_labels[0]}
                      </p>
                    )}
                    {person.location && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin size={10} />
                        {person.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Match Reasoning */}
                {person.match_reasoning && (
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                    {person.match_reasoning}
                  </p>
                )}

                {/* Ikigai Highlights */}
                {person.ikigai && (
                  <div className="space-y-2 mb-4">
                    {person.ikigai.what_i_love?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Heart size={12} className="text-[hsl(320_100%_60%)]" />
                        <span className="text-xs text-slate-400 truncate">
                          {person.ikigai.what_i_love.slice(0, 2).join(", ")}
                        </span>
                      </div>
                    )}
                    {person.ikigai.what_im_good_at?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Star size={12} className="text-[hsl(250_100%_70%)]" />
                        <span className="text-xs text-slate-400 truncate">
                          {person.ikigai.what_im_good_at.slice(0, 2).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={`text-xs ${person.availability === "Available now"
                          ? "border-[hsl(150_100%_45%)]/50 text-[hsl(150_100%_45%)]"
                          : "border-[hsl(45_100%_50%)]/50 text-[hsl(45_100%_50%)]"
                        }`}
                    >
                      {person.availability === "Available now" ? "Available" : "Limited"}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      Score: {person.peer_score?.toFixed(1) || "—"}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl p-12 text-center">
            <Sparkles size={48} className="mx-auto text-[hsl(250_100%_70%)] mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Search</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              Use natural language to find people. Try searching for specific skills,
              interests, or collaboration types.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
